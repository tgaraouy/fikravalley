# 🔧 Guide de Correction SQL - Use Cases

## Erreurs Identifiées

### 1. `workshop_conversation` → `workshop`
**Erreur:** `submitted_via, 'workshop_conversation'`  
**Correction:** `submitted_via, 'workshop'`  
**Raison:** La contrainte CHECK n'accepte que `'web'`, `'whatsapp'`, ou `'workshop'`

### 2. `currentrole` → `current_role`
**Erreur:** `currentrole,`  
**Correction:** `current_role,`  
**Raison:** Le nom de colonne dans `marrai_mentors` est `current_role` (avec underscore)

### 3. `ON CONFLICT DO NULL` → `DO NOTHING`
**Erreur:** `ON CONFLICT (id) DO NULL;`  
**Correction:** `ON CONFLICT (id) DO NOTHING;`  
**Raison:** PostgreSQL n'accepte pas `DO NULL`, utilisez `DO NOTHING`

### 4. `submitter_type` Invalides
**Erreurs:**
- `'cooperative_leader'` → `'entrepreneur'`
- `'farmer'` → `'entrepreneur'`
- `'community_leader'` → `'entrepreneur'`

**Raison:** La contrainte CHECK n'accepte que:
- `'student'`, `'professional'`, `'diaspora'`, `'entrepreneur'`, `'government'`, `'researcher'`, `'other'`

### 5. `max_cofund_amount` Format
**Erreur:** `max_cofund_amount, '75000 EUR'`  
**Correction:** `max_cofund_amount, 75000.00`  
**Raison:** La colonne est `NUMERIC(10,2)`, pas `TEXT`

**Toutes les valeurs à corriger:**
- `'75000 EUR'` → `75000.00`
- `'50000 EUR'` → `50000.00`
- `'100000 EUR'` → `100000.00`
- `'60000 EUR'` → `60000.00`
- `'40000 EUR'` → `40000.00`
- `'30000 EUR'` → `30000.00`
- `'70000 EUR'` → `70000.00`

### 6. `current_role` Format (ARRAY → TEXT)
**Erreur:** `current_role, ARRAY['CEO', 'Cooperative Founder']`  
**Correction:** `current_role, 'CEO'`  
**Raison:** La colonne est `TEXT`, pas `TEXT[]`. Utilisez la première valeur ou concaténez.

**Toutes les valeurs à corriger:**
- `ARRAY['CEO', 'Cooperative Founder']` → `'CEO'`
- `ARRAY['Head of Product']` → `'Head of Product'`
- `ARRAY['E-commerce Director']` → `'E-commerce Director'`
- `ARRAY['CTO', 'Blockchain Lead']` → `'CTO'`
- `ARRAY['VP Engineering']` → `'VP Engineering'`
- `ARRAY['Head of AgTech']` → `'Head of AgTech'`
- `ARRAY['Lead Engineer']` → `'Lead Engineer'`
- `ARRAY['Founder', 'NLP Engineer']` → `'Founder'`
- `ARRAY['Event Tech Lead']` → `'Event Tech Lead'`
- `ARRAY['Marine Tech Director']` → `'Marine Tech Director'`

## Script de Correction Automatique

Utilisez le script PowerShell `scripts/fix-use-cases-sql.ps1`:

```powershell
# 1. Copiez votre SQL dans le fichier
# 2. Exécutez le script
.\scripts\fix-use-cases-sql.ps1
```

## Corrections Manuelles

Si vous préférez corriger manuellement, utilisez les remplacements suivants dans votre éditeur:

### Rechercher/Remplacer (Tous)

1. `'workshop_conversation'` → `'workshop'`
2. `currentrole,` → `current_role,`
3. `ON CONFLICT (id) DO NULL;` → `ON CONFLICT (id) DO NOTHING;`
4. `'cooperative_leader'` → `'entrepreneur'`
5. `'farmer'` → `'entrepreneur'`
6. `'community_leader'` → `'entrepreneur'`
7. `max_cofund_amount, '75000 EUR'` → `max_cofund_amount, 75000.00`
8. `max_cofund_amount, '50000 EUR'` → `max_cofund_amount, 50000.00`
9. `max_cofund_amount, '100000 EUR'` → `max_cofund_amount, 100000.00`
10. `max_cofund_amount, '60000 EUR'` → `max_cofund_amount, 60000.00`
11. `max_cofund_amount, '40000 EUR'` → `max_cofund_amount, 40000.00`
12. `max_cofund_amount, '30000 EUR'` → `max_cofund_amount, 30000.00`
13. `max_cofund_amount, '70000 EUR'` → `max_cofund_amount, 70000.00`
14. `ARRAY['CEO', 'Cooperative Founder']` → `'CEO'`
15. `ARRAY['CTO', 'Blockchain Lead']` → `'CTO'`
16. `ARRAY['Founder', 'NLP Engineer']` → `'Founder'`
17. Tous les autres `ARRAY['...']` → `'...'` (première valeur)

## Vérification

Après correction, vérifiez que:
- ✅ Tous les `submitted_via` sont `'web'`, `'whatsapp'`, ou `'workshop'`
- ✅ Tous les `submitter_type` sont dans la liste valide
- ✅ Tous les `max_cofund_amount` sont des nombres (pas de texte)
- ✅ Tous les `current_role` sont du texte simple (pas d'ARRAY)
- ✅ Tous les `ON CONFLICT` utilisent `DO NOTHING`

## Exemple Avant/Après

### Avant (❌ Erreur)
```sql
INSERT INTO marrai_ideas (..., submitted_via, ...) VALUES
(..., 'workshop_conversation', ...)
ON CONFLICT (id) DO NULL;

INSERT INTO marrai_mentors (..., currentrole, max_cofund_amount, ...) VALUES
(..., ARRAY['CEO', 'Cooperative Founder'], '75000 EUR', ...)
ON CONFLICT (id) DO NULL;
```

### Après (✅ Corrigé)
```sql
INSERT INTO marrai_ideas (..., submitted_via, ...) VALUES
(..., 'workshop', ...)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentors (..., current_role, max_cofund_amount, ...) VALUES
(..., 'CEO', 75000.00, ...)
ON CONFLICT (id) DO NOTHING;
```

