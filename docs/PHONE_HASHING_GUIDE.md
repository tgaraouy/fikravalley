# 📞 Guide: Hash des Numéros de Téléphone

## 🔐 Principe

Les numéros de téléphone sont **hashés** (et non chiffrés) pour respecter la **PDPL** (loi marocaine sur la protection des données). 

**Important:** Les hashs sont **à sens unique** - on ne peut **PAS** "déhasher" un hash. On peut seulement **vérifier** si un numéro correspond à un hash.

## 🛠️ Comment ça fonctionne

### 1. Hash (sens unique)
```typescript
import bcrypt from 'bcrypt';

const phone = '+212661234567';
const hash = await bcrypt.hash(phone, 12); // 12 rounds de salt
// Résultat: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0
```

### 2. Vérification (comparaison)
```typescript
const phone = '+212661234567';
const storedHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0';

const matches = await bcrypt.compare(phone, storedHash);
// true si le numéro correspond, false sinon
```

## 📝 Scripts Disponibles

### 1. Hasher un seul numéro
```bash
tsx scripts/hash-phone.ts +212661234567
```

**Sortie:**
```
🔐 Hash du numéro de téléphone...

Numéro: +212661234567

Hash (bcrypt, 12 rounds):
$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0

📋 Pour SQL:
'$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0'
```

### 2. Vérifier un numéro contre un hash
```bash
tsx scripts/hash-phone.ts +212661234567 $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0
```

**Sortie:**
```
🔍 Vérification du numéro...

✅ Le numéro correspond au hash!
```

### 3. Hasher plusieurs numéros (batch)
```bash
tsx scripts/hash-phone-batch.ts
```

**Modifiez** le tableau `PHONE_NUMBERS` dans le script avec vos numéros, puis exécutez.

## 🔍 Utilisation dans le Code

### Dans `lib/privacy/secure-storage.ts`

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// Hash
async function hashPhone(phone: string): Promise<string> {
  return bcrypt.hash(phone.trim(), SALT_ROUNDS);
}

// Vérification
async function comparePhone(phone: string, hash: string): Promise<boolean> {
  return bcrypt.compare(phone.trim(), hash);
}
```

### Recherche d'un utilisateur par numéro

```typescript
// ❌ IMPOSSIBLE (on ne peut pas déhasher)
const user = await supabase
  .from('marrai_secure_users')
  .select('*')
  .eq('phone_hash', phone); // ❌ Ne fonctionne pas!

// ✅ CORRECT (comparaison avec tous les hashs)
const { data: users } = await supabase
  .from('marrai_secure_users')
  .select('*');

for (const user of users) {
  const matches = await bcrypt.compare(phone, user.phone_hash);
  if (matches) {
    return user; // Trouvé!
  }
}
```

## 📊 Pour le Seed Data

### Générer les hashs pour vos use cases

1. **Modifiez** `scripts/hash-phone-batch.ts`:
```typescript
const PHONE_NUMBERS = [
  '+212661234567', // Use Case 1
  '+212661234568', // Use Case 2
  // ... etc
];
```

2. **Exécutez:**
```bash
tsx scripts/hash-phone-batch.ts
```

3. **Copiez** les hashs dans votre SQL:
```sql
INSERT INTO marrai_secure_users (id, phone_hash, ...) VALUES
('10000000-0000-0000-0000-000000000001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0', ...)
```

## ⚠️ Points Importants

### 1. Hashs Uniques
Chaque hash est **unique** même pour le même numéro (à cause du salt). Mais la **vérification** fonctionne toujours:
```typescript
const hash1 = await bcrypt.hash('+212661234567', 12);
const hash2 = await bcrypt.hash('+212661234567', 12);
// hash1 !== hash2 (différents à cause du salt)

await bcrypt.compare('+212661234567', hash1); // ✅ true
await bcrypt.compare('+212661234567', hash2); // ✅ true
```

### 2. Performance
La recherche par numéro nécessite de **comparer avec tous les hashs** (pas de recherche directe). Pour de grandes bases, considérez:
- Index sur d'autres colonnes
- Cache des résultats
- Limitation du nombre de comparaisons

### 3. Format du Numéro
Normalisez toujours les numéros avant de hasher:
```typescript
const normalized = phone.trim().replace(/\s+/g, '');
```

## 🔒 Sécurité

- **Salt Rounds:** 12 (équilibre sécurité/performance)
- **Algorithme:** bcrypt (résistant aux attaques par force brute)
- **Conformité:** PDPL (Protection des Données Personnelles au Maroc)

## 📚 Références

- Code source: `lib/privacy/secure-storage.ts`
- Documentation bcrypt: https://www.npmjs.com/package/bcrypt
- PDPL: Loi 09-08 sur la protection des données personnelles

