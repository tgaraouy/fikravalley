/**
 * Script pour générer des numéros de téléphone marocains et leurs hashs
 * Usage: node scripts/generate-phone-hashes.js
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

// Générer 10 numéros de téléphone marocains uniques
function generateMoroccanPhones() {
  const phones = [];
  const baseNumber = 661234567; // Numéro de base
  
  for (let i = 0; i < 10; i++) {
    // Générer des numéros séquentiels mais variés
    const lastDigits = String(baseNumber + i).padStart(9, '0');
    phones.push(`+212${lastDigits}`);
  }
  
  return phones;
}

async function hashPhone(phone) {
  return bcrypt.hash(phone.trim(), SALT_ROUNDS);
}

async function main() {
  console.log('📞 Génération de numéros de téléphone marocains et leurs hashs...\n');
  
  const phones = generateMoroccanPhones();
  const mappings = [];
  
  for (let i = 0; i < phones.length; i++) {
    const phone = phones[i];
    process.stdout.write(`[${i + 1}/${phones.length}] Hash de ${phone}... `);
    
    const hash = await hashPhone(phone);
    mappings.push({ phone, hash });
    
    console.log('✅');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 NUMÉROS ET HASHS GÉNÉRÉS');
  console.log('='.repeat(80) + '\n');
  
  mappings.forEach((mapping, index) => {
    console.log(`Use Case ${index + 1}:`);
    console.log(`  Phone: ${mapping.phone}`);
    console.log(`  Hash:  ${mapping.hash}`);
    console.log('');
  });
  
  console.log('='.repeat(80));
  console.log('📋 POUR SQL (copier-coller)');
  console.log('='.repeat(80) + '\n');
  
  mappings.forEach((mapping, index) => {
    console.log(`-- Use Case ${index + 1}: ${mapping.phone}`);
    console.log(`'${mapping.hash}'`);
    if (index < mappings.length - 1) {
      console.log('');
    }
  });
  
  // Générer aussi un fichier JSON pour référence
  const fs = require('fs');
  const jsonOutput = {
    generated_at: new Date().toISOString(),
    salt_rounds: SALT_ROUNDS,
    mappings: mappings
  };
  
  fs.writeFileSync(
    'scripts/phone-hashes.json',
    JSON.stringify(jsonOutput, null, 2)
  );
  
  console.log('\n✅ Hashs sauvegardés dans: scripts/phone-hashes.json');
}

main().catch(console.error);


