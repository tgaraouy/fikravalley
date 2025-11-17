# Custom Categories and Locations Feature

This document describes the implementation of custom categories and locations for idea submission.

## Overview

Users can now:
1. **Select from comprehensive lists** of predefined categories and Moroccan cities
2. **Add custom values** if their category or location is not in the list
3. **Search and filter** through options using autocomplete

## Implementation

### 1. Combobox Component

**File:** `components/ui/combobox.tsx`

A reusable combobox component that provides:
- Autocomplete search
- Keyboard navigation
- Custom value input
- Click-outside to close
- Accessible UI

**Features:**
- Search/filter options as you type
- Click to select from list
- "Add custom" button to enter new value
- Visual feedback for selected option

### 2. Categories Data

**File:** `lib/categories.ts`

**Predefined Categories (24 total):**
- health (Santé)
- education (Éducation)
- agriculture (Agriculture)
- tech (Technologie)
- infrastructure (Infrastructure)
- administration (Administration)
- logistics (Logistique)
- finance (Finance)
- customer_service (Service Client)
- inclusion (Inclusion Sociale)
- transport (Transport)
- energy (Énergie)
- water (Eau & Assainissement)
- waste (Gestion des Déchets)
- tourism (Tourisme)
- culture (Culture & Patrimoine)
- sports (Sports & Loisirs)
- security (Sécurité)
- justice (Justice)
- environment (Environnement)
- housing (Logement)
- employment (Emploi)
- social_services (Services Sociaux)
- other (Autre)

**Multilingual Support:**
- French labels (default)
- Arabic labels (labelAr)
- Darija labels (labelDarija)

### 3. Moroccan Cities Data

**File:** `lib/categories.ts`

**Predefined Cities (60+ total):**
- Major cities: Casablanca, Rabat, Fès, Marrakech, Tanger, Agadir, Meknès, Oujda, Kénitra
- Regional capitals and important cities
- All 12 regions represented
- "Other" option for custom locations

**Cities include:**
- Casablanca, Rabat, Fès, Marrakech, Tanger, Agadir
- Meknès, Oujda, Kénitra, Tétouan, Safi, Mohammedia
- El Jadida, Nador, Beni Mellal, Taza, Khouribga, Settat
- Larache, Khemisset, Berrechid, Taourirt, Errachidia
- Ouarzazate, Laâyoune, Dakhla, Guelmim, Tiznit, Taroudant
- Essaouira, Azilal, Ifrane, Chefchaouen, Asilah, Ouazzane
- And many more...

### 4. Database Migration

**File:** `supabase/migrations/006_allow_custom_categories_locations.sql`

Removes CHECK constraints to allow custom values:
- Removes `marrai_ideas_category_check` constraint
- Removes `marrai_ideas_location_check` constraint
- Adds documentation comments

**Important:** Run this migration before using custom values:
```sql
-- In Supabase SQL Editor
-- Run: supabase/migrations/006_allow_custom_categories_locations.sql
```

## Usage

### In Submission Form

```tsx
<Combobox
  options={CATEGORIES.map(cat => ({
    value: cat.value,
    label: language === 'ar' && cat.labelAr ? cat.labelAr :
           language === 'darija' && cat.labelDarija ? cat.labelDarija :
           cat.label
  }))}
  value={category}
  onChange={setCategory}
  placeholder="Sélectionnez une catégorie..."
  allowCustom={true}
  customLabel="Ajouter une catégorie"
/>
```

### User Flow

1. **User clicks on category/location field**
   - Dropdown opens with searchable list

2. **User types to search**
   - Options filter in real-time
   - Matching options highlighted

3. **User selects from list**
   - Value is set
   - Dropdown closes

4. **User wants custom value**
   - Clicks "Ajouter une catégorie/ville"
   - Input field appears
   - Types custom value
   - Clicks "Ajouter" or presses Enter
   - Custom value is saved

## Database Considerations

### Before Migration
- Categories limited to: health, education, agriculture, tech, infrastructure, administration, logistics, finance, customer_service, inclusion, other
- Locations limited to: casablanca, rabat, marrakech, kenitra, tangier, agadir, fes, meknes, oujda, other
- Custom values would be rejected by CHECK constraint

### After Migration
- Any TEXT value accepted for category
- Any TEXT value accepted for location
- Custom values stored as lowercase (normalized)
- Predefined values still recommended for consistency

## Helper Functions

**File:** `lib/categories.ts`

```typescript
// Get localized category label
getCategoryLabel('health', 'darija') // Returns 'S7a'

// Get location label
getLocationLabel('casablanca') // Returns 'Casablanca'

// Check if value is custom
isCustomCategory('my_custom_category') // Returns true
isCustomLocation('my_custom_city') // Returns true
```

## Best Practices

1. **Normalize custom values**
   - Convert to lowercase
   - Remove extra spaces
   - Use consistent format

2. **Validate custom values**
   - Check length (min 2, max 50 chars)
   - Sanitize input
   - Prevent SQL injection

3. **Display custom values**
   - Show with capital first letter
   - Indicate it's custom (optional badge)
   - Allow editing later

4. **Analytics**
   - Track which custom values are used
   - Consider adding popular custom values to predefined list
   - Monitor for typos or duplicates

## Future Enhancements

- [ ] Auto-suggest similar categories when typing custom value
- [ ] Show usage count for each category/location
- [ ] Allow admins to promote custom values to predefined list
- [ ] Fuzzy matching for typos
- [ ] Category/location aliases (e.g., "Casa" → "Casablanca")
- [ ] Regional grouping for locations
- [ ] Category icons/colors

