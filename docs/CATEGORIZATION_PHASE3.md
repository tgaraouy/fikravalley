# 🎯 Phase 3: SDG Alignment & Auto-Categorization

## Overview

**Phase 1** ✅: Database migration (`009_add_moroccan_priorities_and_metadata.sql`)
- Added `moroccan_priorities` (JSONB), `budget_tier`, `location_type`, `complexity`, `sdg_alignment` (JSONB)

**Phase 2** ✅: Admin UI + Public Filters
- Admin categorization page (`/admin/categorize-ideas`)
- AI priority suggester (`lib/ai/priority-aligner.ts`)
- Public filter sidebar (Morocco-first, with budget/complexity/location)
- Backfill script for existing ~550 ideas

**Phase 3** ⏳: SDG Alignment & Auto-Categorization

---

## Phase 3 Components

### 1. **SDG Alignment Filtering** (Public Sidebar)

**Current Status**: Placeholder exists in `FilterSidebar.tsx`:
```tsx
{/* 🌍 ODD (secondaire) */}
<div>
  <h3 className="font-bold text-slate-900 mb-3">
    🌍 ODD (Objectifs de Développement Durable)
  </h3>
  <p className="text-xs text-slate-500 italic">
    Filtre secondaire - À venir
  </p>
</div>
```

**Implementation**:
- Parse `sdg_alignment` JSONB from ideas (format: `{ "sdgTags": [1, 3, 8], ... }`)
- Add multi-select checkboxes for SDG goals 1-17
- Filter ideas by selected SDG tags in `/api/ideas/search`
- Display SDG badges on `IdeaCard` (secondary to Morocco priorities)

**SDG Mapping Reference**:
- See `docs/morocco-priority-sdg-mappings.md` for Morocco Priority → SDG mappings
- Each Morocco priority maps to 1-3 SDG goals

---

### 2. **Auto-Categorization on Submission**

**Current Status**: New ideas are submitted without automatic categorization

**Implementation**:
- Hook into idea submission flow (`app/api/analyze-idea/route.ts` or `app/api/ideas/route.ts`)
- After idea is created, automatically:
  1. Run `ruleBasedPriorities()` from `scripts/categorization-rules.ts`
  2. If no priorities found, call `suggestMoroccanPriorities()` (AI fallback)
  3. Set `budget_tier`, `location_type`, `complexity` using rule-based functions
  4. Auto-generate `sdg_alignment` from Morocco priorities (using mapping)

**Files to Modify**:
- `app/api/ideas/route.ts` (POST handler) - Add auto-categorization after insert
- Or create `lib/ai/auto-categorize-idea.ts` utility function

**Example Flow**:
```typescript
// After idea.insert()
const autoCategorized = await autoCategorizeIdea({
  problem: idea.problem_statement,
  solution: idea.proposed_solution,
  category: idea.category,
  location: idea.location,
  estimated_cost: idea.estimated_cost,
});

await supabase
  .from('marrai_ideas')
  .update(autoCategorized)
  .eq('id', idea.id);
```

---

### 3. **SDG Badges on Idea Cards**

**Current Status**: `IdeaCard` shows Morocco priority badges, but no SDG badges

**Implementation**:
- Parse `idea.sdg_alignment.sdgTags` (array of numbers 1-17)
- Display small SDG badges below Morocco priorities (secondary visual layer)
- Use official SDG colors/icons (or simplified versions)
- Tooltip on hover: "ODD 8: Travail décent et croissance économique"

**SDG Badge Component**:
```tsx
// components/ideas/SDGBadge.tsx
export function SDGBadge({ sdgNumber }: { sdgNumber: number }) {
  const sdgInfo = SDG_INFO[sdgNumber]; // Map of SDG numbers to names/colors
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
      <span>🌍</span>
      <span>ODD {sdgNumber}</span>
    </span>
  );
}
```

---

### 4. **Categorization Analytics Dashboard**

**Current Status**: No visibility into categorization coverage

**Implementation**:
- New admin page: `/admin/categorization-stats`
- Show:
  - % of ideas with `moroccan_priorities` populated
  - % with `budget_tier`, `location_type`, `complexity`
  - Most common priorities (bar chart)
  - Priority distribution by category
  - SDG alignment coverage
  - Ideas missing categorization (actionable list)

**API Endpoint**:
- `app/api/admin/categorization-stats/route.ts`
- Aggregate queries on `marrai_ideas` table

---

## Implementation Priority

### **Week 1: Auto-Categorization** (High Impact)
1. Create `lib/ai/auto-categorize-idea.ts` utility
2. Integrate into idea submission flow
3. Test with new idea submissions

### **Week 2: SDG Filtering & Badges** (User-Facing)
1. Implement SDG filter in `FilterSidebar.tsx`
2. Add SDG filtering to `/api/ideas/search`
3. Create `SDGBadge` component
4. Add SDG badges to `IdeaCard` (below Morocco priorities)

### **Week 3: Analytics Dashboard** (Admin Tool)
1. Create `/admin/categorization-stats` page
2. Build aggregation queries
3. Add charts/visualizations

---

## Files to Create/Modify

### **New Files**:
- `lib/ai/auto-categorize-idea.ts` - Auto-categorization utility
- `components/ideas/SDGBadge.tsx` - SDG badge component
- `lib/constants/sdg-info.ts` - SDG metadata (names, colors, icons)
- `app/admin/categorization-stats/page.tsx` - Analytics dashboard
- `app/api/admin/categorization-stats/route.ts` - Stats API

### **Files to Modify**:
- `components/ideas/FilterSidebar.tsx` - Implement SDG filter
- `app/api/ideas/search/route.ts` - Add SDG filtering
- `components/ideas/IdeaCard.tsx` - Add SDG badges
- `app/api/ideas/route.ts` - Add auto-categorization hook
- `lib/constants/moroccan-priorities.ts` - Add SDG mapping helper

---

## Success Criteria

✅ **Auto-Categorization**:
- 100% of new ideas get `moroccan_priorities` automatically
- 90%+ get `budget_tier`, `location_type`, `complexity`
- AI fallback works when rules don't match

✅ **SDG Filtering**:
- Users can filter by SDG goals in public sidebar
- Filter works correctly in search API
- SDG badges visible on idea cards (secondary to Morocco priorities)

✅ **Analytics**:
- Admin can see categorization coverage
- Can identify uncategorized ideas
- Can see priority distribution trends

---

## Notes

- **Morocco-first philosophy**: SDG tags are secondary metadata for funders. Users interact with Morocco priorities.
- **Auto-categorization**: Rule-based first (fast, free), AI fallback (slower, costs API calls)
- **SDG badges**: Small, unobtrusive, below Morocco priority badges
- **Analytics**: Helps identify gaps in categorization coverage

---

**Ready to implement Phase 3?** 🚀

