import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * Generate workshop code
 */
function generateWorkshopCode(workshopId: string): string {
  // Format: WORKSHOP-PREFIX-XXXX
  // e.g., KENI-2024-A7B3
  const prefix = workshopId.toUpperCase().substring(0, 4).replace(/[^A-Z0-9]/g, '');
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workshop_id, count = 1, email, name, expires_in_days = 30 } = body;

    if (!workshop_id) {
      return NextResponse.json(
        { error: 'ID de l\'atelier requis' },
        { status: 400 }
      );
    }

    const codesToInsert: any[] = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    for (let i = 0; i < count; i++) {
      let code: string;
      let isUnique = false;
      let attempts = 0;

      // Generate unique code
      while (!isUnique && attempts < 10) {
        code = generateWorkshopCode(workshop_id);
        
        // Check if code already exists
        const { data: existing } = await supabase
          .from('marrai_workshop_codes')
          .select('id')
          .eq('code', code)
          .single();

        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return NextResponse.json(
          { error: 'Impossible de générer un code unique. Réessayez.' },
          { status: 500 }
        );
      }

      codesToInsert.push({
        code: code!,
        workshop_id,
        email: email || null,
        name: name || null,
        expires_at: expiresAt.toISOString(),
        used: false,
      });
    }

    // Insert codes
    const { data, error } = await (supabase as any)
      .from('marrai_workshop_codes')
      .insert(codesToInsert)
      .select();

    if (error) {
      console.error('Error inserting workshop codes:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la génération des codes' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `${count} code(s) généré(s) avec succès`,
        codes: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in workshop-codes POST:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workshop_id = searchParams.get('workshop_id');
    const used = searchParams.get('used');

    let query = supabase
      .from('marrai_workshop_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (workshop_id) {
      query = query.eq('workshop_id', workshop_id);
    }

    if (used !== null) {
      query = query.eq('used', used === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching workshop codes:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des codes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ codes: data || [] }, { status: 200 });
  } catch (error) {
    console.error('Error in workshop-codes GET:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

