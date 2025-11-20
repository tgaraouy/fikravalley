/**
 * Contact Submitter Component
 * 
 * Allows admins to easily contact idea submitters via email or WhatsApp
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getQualifiedIdeaEmail, 
  getExceptionalIdeaEmail, 
  getClarificationNeededEmail,
  getGenericFollowUpEmail 
} from '@/lib/email/templates';
import { 
  getQualifiedIdeaWhatsApp, 
  getExceptionalIdeaWhatsApp,
  getClarificationNeededWhatsApp,
  getGenericFollowUpWhatsApp 
} from '@/lib/whatsapp/templates';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

interface Idea {
  id: string;
  title: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone?: string;
  qualification_tier?: 'exceptional' | 'qualified' | 'needs_work';
  total_score?: number;
  clarity_score?: number;
  intilaka_pdf_url?: string;
  status: string;
  follow_up_status?: string;
  last_contacted_at?: string;
  contact_method?: string;
}

interface ContactSubmitterProps {
  idea: Idea;
  onContacted?: () => void;
}

export function ContactSubmitter({ idea, onContacted }: ContactSubmitterProps) {
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp'>('email');
  const [template, setTemplate] = useState<'qualified' | 'exceptional' | 'clarification' | 'custom'>('qualified');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const getEmailTemplate = () => {
    switch (template) {
      case 'qualified':
        return getQualifiedIdeaEmail({
          title: idea.title,
          submitterName: idea.submitter_name,
          score: idea.total_score,
          qualificationTier: idea.qualification_tier,
          intilakaPdfUrl: idea.intilaka_pdf_url,
        });
      case 'exceptional':
        return getExceptionalIdeaEmail({
          title: idea.title,
          submitterName: idea.submitter_name,
          score: idea.total_score || 0,
          intilakaPdfUrl: idea.intilaka_pdf_url,
        });
      case 'clarification':
        return getClarificationNeededEmail({
          title: idea.title,
          submitterName: idea.submitter_name,
          clarityScore: idea.clarity_score,
        });
      case 'custom':
        return getGenericFollowUpEmail({
          title: idea.title,
          submitterName: idea.submitter_name,
          message: customMessage,
        });
    }
  };

  const getWhatsAppTemplate = () => {
    switch (template) {
      case 'qualified':
        return getQualifiedIdeaWhatsApp({
          title: idea.title,
          score: idea.total_score,
          intilakaPdfUrl: idea.intilaka_pdf_url,
        });
      case 'exceptional':
        return getExceptionalIdeaWhatsApp({
          title: idea.title,
          score: idea.total_score || 0,
        });
      case 'clarification':
        return getClarificationNeededWhatsApp({
          title: idea.title,
        });
      case 'custom':
        return getGenericFollowUpWhatsApp({
          title: idea.title,
          message: customMessage,
        });
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      if (contactMethod === 'email') {
        const emailTemplate = getEmailTemplate();
        // In production, use your email service (SendGrid, Resend, etc.)
        const response = await fetch('/api/admin/contact/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ideaId: idea.id,
            to: idea.submitter_email,
            subject: emailTemplate.subject,
            body: emailTemplate.body,
            method: 'email',
          }),
        });

        if (!response.ok) throw new Error('Failed to send email');
      } else {
        if (!idea.submitter_phone) {
          alert('Numéro de téléphone non disponible');
          setIsSending(false);
          return;
        }

        const whatsappTemplate = getWhatsAppTemplate();
        const message = whatsappTemplate.messageDarija || whatsappTemplate.message;
        
        // Send WhatsApp message
        const sent = await sendWhatsAppMessage(idea.submitter_phone, message);
        if (!sent) throw new Error('Failed to send WhatsApp message');

        // Record in database
        await fetch('/api/admin/contact/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ideaId: idea.id,
            phone: idea.submitter_phone,
            message,
            method: 'whatsapp',
          }),
        });
      }

      setSent(true);
      onContacted?.();
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSending(false);
    }
  };

  const emailTemplate = getEmailTemplate();
  const whatsappTemplate = getWhatsAppTemplate();
  const previewMessage = contactMethod === 'email' 
    ? emailTemplate.body 
    : (whatsappTemplate.messageDarija || whatsappTemplate.message);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacter le soumissionnaire</CardTitle>
        <CardDescription>
          {idea.submitter_name} - {idea.submitter_email}
          {idea.submitter_phone && ` - ${idea.submitter_phone}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Method Selection */}
        <div className="flex gap-2">
          <Button
            variant={contactMethod === 'email' ? 'primary' : 'outline'}
            onClick={() => setContactMethod('email')}
            size="sm"
          >
            📧 Email
          </Button>
          <Button
            variant={contactMethod === 'whatsapp' ? 'primary' : 'outline'}
            onClick={() => setContactMethod('whatsapp')}
            size="sm"
            disabled={!idea.submitter_phone}
          >
            💬 WhatsApp {!idea.submitter_phone && '(non disponible)'}
          </Button>
        </div>

        {/* Template Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Type de message</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="qualified">Idée qualifiée</option>
            <option value="exceptional">Idée exceptionnelle</option>
            <option value="clarification">Nécessite clarification</option>
            <option value="custom">Message personnalisé</option>
          </select>
        </div>

        {/* Custom Message Input */}
        {template === 'custom' && (
          <div>
            <label className="text-sm font-medium mb-2 block">Message personnalisé</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-md min-h-[100px]"
              placeholder="Écrivez votre message..."
            />
          </div>
        )}

        {/* Preview */}
        <div>
          <label className="text-sm font-medium mb-2 block">Aperçu</label>
          <div className="p-3 bg-slate-50 border rounded-md text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
            {contactMethod === 'email' && (
              <div>
                <div className="font-semibold mb-2">Sujet: {emailTemplate.subject}</div>
                <div>{previewMessage}</div>
              </div>
            )}
            {contactMethod === 'whatsapp' && <div>{previewMessage}</div>}
          </div>
        </div>

        {/* Follow-up Status */}
        {idea.follow_up_status && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Statut:</span>
            <Badge variant={
              idea.follow_up_status === 'responded' ? 'default' :
              idea.follow_up_status === 'contacted' ? 'success' :
              'outline'
            }>
              {idea.follow_up_status}
            </Badge>
            {idea.last_contacted_at && (
              <span className="text-xs text-slate-500">
                Dernier contact: {new Date(idea.last_contacted_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isSending || sent || (template === 'custom' && !customMessage.trim())}
          className="w-full"
        >
          {sent ? '✅ Envoyé!' : isSending ? 'Envoi...' : `Envoyer par ${contactMethod === 'email' ? 'Email' : 'WhatsApp'}`}
        </Button>
      </CardContent>
    </Card>
  );
}

