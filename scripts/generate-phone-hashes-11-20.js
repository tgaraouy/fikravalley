/**
 * Script pour générer des hashs pour les use cases 11-20
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

// Générer 10 numéros de téléphone marocains pour use cases 11-20
function generatePhones() {
  const phones = [];
  const baseNumber = 661234577; // Starting from use case 11
  
  for (let i = 0; i < 10; i++) {
    const lastDigits = String(baseNumber + i).padStart(9, '0');
    phones.push(`+212${lastDigits}`);
  }
  
  return phones;
}

async function hashPhone(phone) {
  return bcrypt.hash(phone.trim(), SALT_ROUNDS);
}

async function main() {
  console.log('📞 Génération de numéros de téléphone marocains (Use Cases 11-20)...\n');
  
  const phones = generatePhones();
  const mappings = [];
  
  for (let i = 0; i < phones.length; i++) {
    const phone = phones[i];
    const useCaseNum = 11 + i;
    process.stdout.write(`[${i + 1}/${phones.length}] Use Case ${useCaseNum}: ${phone}... `);
    
    const hash = await hashPhone(phone);
    mappings.push({ phone, hash, useCase: useCaseNum });
    
    console.log('✅');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 HASHS POUR SQL (Use Cases 11-20)');
  console.log('='.repeat(80) + '\n');
  
  mappings.forEach((mapping) => {
    console.log(`-- Use Case ${mapping.useCase}: ${mapping.phone}`);
    console.log(`'${mapping.hash}'`);
    console.log('');
  });
  
  // Sauvegarder en JSON
  const fs = require('fs');
  const jsonOutput = {
    generated_at: new Date().toISOString(),
    salt_rounds: SALT_ROUNDS,
    use_cases: '11-20',
    mappings: mappings
  };
  
  fs.writeFileSync(
    'scripts/phone-hashes-11-20.json',
    JSON.stringify(jsonOutput, null, 2)
  );
  
  console.log('✅ Hashs sauvegardés dans: scripts/phone-hashes-11-20.json');
}

main().catch(console.error);


