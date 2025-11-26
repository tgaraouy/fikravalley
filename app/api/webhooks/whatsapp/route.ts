/**
 * WhatsApp Webhook Endpoint
 *
 * Handles inbound WhatsApp messages (360dialog) for speaker clarification loop.
 * - GET: verification challenge (hub.* params)
 * - POST: process inbound messages, update conversation ideas, re-run Agent 1
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { formatPhoneNumber, sendWhatsAppMessage } from '@/lib/whatsapp';
import { conversationExtractorAgent } from '@/lib/agents/conversation-extractor-agent';

type ConversationIdeaRow =
  Database['public']['Tables']['marrai_conversation_ideas']['Row'];

interface InboundMessage {
  from: string;
  text: string;
  type?: string;
  raw?: any;
}

const VERIFY_TOKEN =
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
  process.env.WHATSAPP_VERIFY_TOKEN ||
  'fikra-webhook';

const SUPPORTED_STATUSES: ConversationIdeaRow['status'][] = [
  'speaker_contacted',
  'pending_validation',
  'needs_refinement',
  'speaker_validated',
];

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for webhooks');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function extractMessages(payload: any): InboundMessage[] {
  const messages: InboundMessage[] = [];

  if (Array.isArray(payload?.messages)) {
    payload.messages.forEach((msg: any) => {
      const text =
        msg?.text?.body ||
        msg?.button?.text ||
        msg?.interactive?.button_reply?.title ||
        msg?.interactive?.list_reply?.title ||
        msg?.interactive?.button_reply?.id ||
        msg?.interactive?.list_reply?.id;

      if (msg?.from && text) {
        messages.push({ from: msg.from, text, type: msg.type, raw: msg });
      }
    });
  }

  if (Array.isArray(payload?.entry)) {
    payload.entry.forEach((entry: any) => {
      entry?.changes?.forEach((change: any) => {
        const changeMessages = change?.value?.messages;
        if (Array.isArray(changeMessages)) {
          changeMessages.forEach((msg: any) => {
            const text =
              msg?.text?.body ||
              msg?.button?.text ||
              msg?.interactive?.button_reply?.title ||
              msg?.interactive?.list_reply?.title ||
              msg?.interactive?.button_reply?.id ||
              msg?.interactive?.list_reply?.id;

            if (msg?.from && text) {
              messages.push({ from: msg.from, text, type: msg.type, raw: msg });
            }
          });
        }
      });
    });
  }

  return messages;
}

function classifyResponse(text: string): 'positive' | 'negative' | 'clarification' {
  const normalized = text.trim().toLowerCase();
  const positiveTokens = [
    '✅',
    '👍',
    '1',
    'oui',
    'yes',
    'ok',
    'okay',
    'wakha',
    'waha',
    'd accord',
    'مرتاحة',
    'نعم',
    'واخا',
  ];

  const negativeTokens = [
    '❌',
    '👎',
    '2',
    'non',
    'no',
    'la',
    'laa',
    'mashi',
    'رفض',
    'ماشي',
  ];

  const containsPositive = positiveTokens.some(
    (token) => normalized.includes(token) || text.includes(token)
  );
  const containsNegative = negativeTokens.some(
    (token) => normalized.includes(token) || text.includes(token)
  );

  if (containsPositive && !containsNegative) return 'positive';
  if (containsNegative && !containsPositive) return 'negative';
  return 'clarification';
}

async function findConversationIdeaByPhone(
  phoneCandidates: string[]
): Promise<ConversationIdeaRow | null> {
  const supabase = getSupabase();
  const filters = phoneCandidates
    .filter(Boolean)
    .map((candidate) => `speaker_context.ilike.%${candidate}%`);

  let query = (supabase as any)
    .from('marrai_conversation_ideas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (filters.length > 0) {
    query = query.or(filters.join(','));
  }

  query = query.in('status', SUPPORTED_STATUSES);

  const { data, error } = await query;

  if (error) {
    console.error('Error querying conversation ideas by phone:', error);
    return null;
  }

  return data?.[0] ?? null;
}

function appendValidationNote(
  existing: string | null,
  message: string
): string {
  const note = `WhatsApp (${new Date().toISOString()}): ${message}`;
  return existing ? `${existing}\n${note}` : note;
}

async function processInboundMessage(message: InboundMessage) {
  const formattedPhone = formatPhoneNumber(message.from);
  const candidates = Array.from(
    new Set([
      message.from,
      formattedPhone,
      `+${formattedPhone}`,
      formattedPhone.startsWith('212') ? formattedPhone.slice(3) : '',
    ])
  ).filter(Boolean) as string[];

  const conversation = await findConversationIdeaByPhone(candidates);

  if (!conversation) {
    console.warn('No conversation idea found for incoming phone:', message.from);
    return;
  }

  const supabase = getSupabase();
  const responseType = classifyResponse(message.text);

  const updatedNotes = appendValidationNote(
    conversation.validation_notes,
    message.text
  );

  if (responseType === 'negative') {
    await (supabase as any)
      .from('marrai_conversation_ideas')
      .update({
        validation_notes: updatedNotes,
        validation_method: 'whatsapp',
        validated_at: new Date().toISOString(),
        status: 'speaker_rejected',
      })
      .eq('id', conversation.id);

    await sendWhatsAppMessage(
      message.from,
      'شكراً بزاف! غادي نحدّثو السجل ديالك، وكنبقاو على تواصل لأي جديد 🙏'
    );
    return;
  }

  const combinedQuote = `${conversation.speaker_quote}\n\n[Clarification ${new Date().toISOString()}]\n${message.text}`;

  const extractionInput = {
    speaker_quote: combinedQuote,
    speaker_email: conversation.speaker_email || undefined,
    speaker_context: conversation.speaker_context || undefined,
    speaker_phone: message.from,
  };

  const extracted = await conversationExtractorAgent.extractIdea(extractionInput);

  if (!extracted) {
    console.warn('Agent failed to extract idea from clarification response.');
    await (supabase as any)
      .from('marrai_conversation_ideas')
      .update({
        speaker_quote: combinedQuote,
        validation_notes: updatedNotes,
        validation_method: 'whatsapp',
      })
      .eq('id', conversation.id);
    return;
  }

  const canAutoPromote =
    extracted.confidence_score >= 0.85 && !extracted.needs_clarification;

  await (supabase as any)
    .from('marrai_conversation_ideas')
    .update({
      speaker_quote: combinedQuote,
      problem_title: extracted.problem_title,
      problem_statement: extracted.problem_statement,
      proposed_solution: extracted.proposed_solution || null,
      category: extracted.category,
      digitization_opportunity: extracted.proposed_solution || null,
      confidence_score: extracted.confidence_score,
      needs_clarification: extracted.needs_clarification,
      validation_question: extracted.validation_question || null,
      validation_notes: updatedNotes,
      validation_method: 'whatsapp',
      validated_at: new Date().toISOString(),
      status: canAutoPromote ? 'promoted_to_idea' : 'speaker_contacted',
    })
    .eq('id', conversation.id);

  if (canAutoPromote) {
    await conversationExtractorAgent.autoPromoteIdea(conversation.id);
    await sendWhatsAppMessage(
      message.from,
      '✅ ولّيناها مشروع! شكراً على التوضيح، الفريق غادي يتاصل بيك قريباً.'
    );
  } else if (extracted.validation_question) {
    await sendWhatsAppMessage(
      message.from,
      extracted.validation_question
    );
  } else {
    await sendWhatsAppMessage(
      message.from,
      'شكراً على التوضيح! غادي نكملو التحليل ونرجعو ليك إلا احتجنا أي حاجة أخرى.'
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge ?? 'OK', { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const messages = extractMessages(payload);

    if (!messages.length) {
      return NextResponse.json(
        { received: true, processed: 0 },
        { status: 200 }
      );
    }

    for (const message of messages) {
      try {
        await processInboundMessage(message);
      } catch (error) {
        console.error('Error processing WhatsApp message:', error);
      }
    }

    return NextResponse.json(
      { received: true, processed: messages.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    );
  }
}

