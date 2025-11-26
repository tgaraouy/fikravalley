#!/usr/bin/env tsx
/**
 * Script pour hasher plusieurs numéros de téléphone en batch
 * Usage: tsx scripts/hash-phone-batch.ts
 * 
 * Modifiez le tableau PHONE_NUMBERS ci-dessous avec vos numéros
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

interface PhoneMapping {
  phone: string;
  hash: string;
}

async function hashPhone(phone: string): Promise<string> {
  return bcrypt.hash(phone.trim(), SALT_ROUNDS);
}

// ============================================
// MODIFIEZ CETTE LISTE AVEC VOS NUMÉROS
// ============================================
const PHONE_NUMBERS = [
  '+212661234567', // Use Case 1: Argan Oil
  '+212661234568', // Use Case 2: Tour Guides
  '+212661234569', // Use Case 3: Digital Souk
  '+212661234570', // Use Case 4: Zakat
  '+212661234571', // Use Case 5: Traffic
  '+212661234572', // Use Case 6: Saffron
  '+212661234573', // Use Case 7: Khettaras
  '+212661234574', // Use Case 8: Darija
  '+212661234575', // Use Case 9: Moussem
  '+212661234576', // Use Case 10: Fishing
];

async function main() {
  console.log('🔐 Hash de plusieurs numéros de téléphone...\n');
  console.log(`Nombre de numéros: ${PHONE_NUMBERS.length}\n`);

  const mappings: PhoneMapping[] = [];

  for (let i = 0; i < PHONE_NUMBERS.length; i++) {
    const phone = PHONE_NUMBERS[i];
    process.stdout.write(`[${i + 1}/${PHONE_NUMBERS.length}] Hash de ${phone}... `);
    
    const hash = await hashPhone(phone);
    mappings.push({ phone, hash });
    
    console.log('✅');
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 RÉSULTATS (pour SQL)');
  console.log('='.repeat(80) + '\n');

  // Format pour SQL INSERT
  console.log('-- Phone hashes pour INSERT INTO marrai_secure_users');
  console.log('-- Format: phone_hash');
  console.log('');
  
  mappings.forEach((mapping, index) => {
    console.log(`-- ${mapping.phone}`);
    console.log(`'${mapping.hash}'`);
    if (index < mappings.length - 1) {
      console.log('');
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('📋 MAPPING COMPLET (pour référence)');
  console.log('='.repeat(80) + '\n');

  mappings.forEach((mapping) => {
    console.log(`${mapping.phone} → ${mapping.hash.substring(0, 30)}...`);
  });

  console.log('\n✅ Terminé!');
}

main().catch(console.error);


