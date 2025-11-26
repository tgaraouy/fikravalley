#!/usr/bin/env tsx
/**
 * Script pour hasher les numéros de téléphone
 * Usage: tsx scripts/hash-phone.ts <phone_number>
 * Exemple: tsx scripts/hash-phone.ts +212661234567
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Même valeur que dans lib/privacy/secure-storage.ts

async function hashPhone(phone: string): Promise<string> {
  // Normaliser le numéro (enlever espaces, garder le format)
  const normalizedPhone = phone.trim();
  return bcrypt.hash(normalizedPhone, SALT_ROUNDS);
}

async function comparePhone(phone: string, hash: string): Promise<boolean> {
  return bcrypt.compare(phone.trim(), hash);
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: tsx scripts/hash-phone.ts <phone_number> [hash_to_verify]');
    console.log('');
    console.log('Exemples:');
    console.log('  # Hasher un numéro:');
    console.log('  tsx scripts/hash-phone.ts +212661234567');
    console.log('');
    console.log('  # Vérifier un numéro contre un hash:');
    console.log('  tsx scripts/hash-phone.ts +212661234567 $2b$12$...');
    process.exit(1);
  }

  const phone = args[0];
  const hashToVerify = args[1];

  if (hashToVerify) {
    // Mode vérification
    console.log('🔍 Vérification du numéro...\n');
    const matches = await comparePhone(phone, hashToVerify);
    if (matches) {
      console.log('✅ Le numéro correspond au hash!');
    } else {
      console.log('❌ Le numéro ne correspond PAS au hash.');
    }
  } else {
    // Mode hash
    console.log('🔐 Hash du numéro de téléphone...\n');
    console.log(`Numéro: ${phone}`);
    const hash = await hashPhone(phone);
    console.log(`\nHash (bcrypt, ${SALT_ROUNDS} rounds):`);
    console.log(hash);
    console.log('\n📋 Pour SQL:');
    console.log(`'${hash}'`);
  }
}

main().catch(console.error);


