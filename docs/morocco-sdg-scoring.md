# Morocco/SDG Hybrid Scoring System

## Overview

The scoring system uses **Morocco's government priorities as the primary framework**, with SDG tags auto-generated as secondary metadata for funders. Users never see SDG complexity - they only interact with Morocco priorities.

## Core Philosophy

- **Primary**: Morocco government priorities (user-facing, what users select)
- **Secondary**: SDG tags (auto-generated, for funders)
- **User Experience**: Simple, Morocco-focused
- **Funder Experience**: Rich SDG metadata automatically available

## Morocco Priorities

### 1. Green Morocco Plan (المغرب الأخضر)
- **SDG Mapping**: 7 (Clean Energy), 13 (Climate Action), 15 (Life on Land)
- **Keywords**: climate, energy, solar, environment, agriculture, farm
- **Focus**: Climate action, renewable energy, sustainable agriculture

### 2. Digital Morocco 2025 (المغرب الرقمي)
- **SDG Mapping**: 9 (Industry, Innovation, Infrastructure)
- **Keywords**: digital, technology, internet, app, software, e-government
- **Focus**: Digital transformation, e-government, tech innovation

### 3. Vision 2030 (رؤية 2030)
- **SDG Mapping**: 8 (Decent Work), 9 (Innovation)
- **Keywords**: economy, growth, development, competitiveness
- **Focus**: Economic development, competitiveness, human capital

### 4. Youth Employment Priority (أولوية تشغيل الشباب)
- **SDG Mapping**: 8 (Decent Work)
- **Keywords**: youth, shabab, job, khdma, employment, entrepreneur, startup
- **Focus**: Job creation for young people, entrepreneurship

### 5. Women Entrepreneurship (ريادة الأعمال النسائية)
- **SDG Mapping**: 5 (Gender Equality), 8 (Decent Work)
- **Keywords**: women, mra, nisa, female, gender, equality
- **Focus**: Economic empowerment of women, gender equality

### 6. Rural Development (التنمية القروية)
- **SDG Mapping**: 1 (No Poverty), 2 (Zero Hunger), 6 (Clean Water), 11 (Sustainable Cities)
- **Keywords**: rural, village, qrya, countryside, farmer, fellah
- **Focus**: Infrastructure and services for rural areas

### 7. Healthcare Improvement (تحسين الصحة)
- **SDG Mapping**: 3 (Good Health)
- **Keywords**: health, si7a, hospital, medical, doctor, patient
- **Focus**: Better healthcare access and quality

### 8. Quality Education (التعليم الجيد)
- **SDG Mapping**: 4 (Quality Education)
- **Keywords**: education, ta3lim, school, university, student, teacher
- **Focus**: Improved education access and outcomes

## Auto-Tagging Logic

### Step 1: From Morocco Priorities (High Confidence = 0.9)
When a user selects a Morocco priority, the system automatically maps it to SDGs:
- Green Morocco → SDG 7, 13, 15 (confidence: 0.9 each)
- Youth Employment → SDG 8 (confidence: 0.9)
- Women Empowerment → SDG 5, 8 (confidence: 0.9 each)

### Step 2: From Text Analysis (Medium Confidence, Max 0.8)
The system analyzes the problem statement and benefit statement for SDG keywords:
- Health keywords → SDG 3 (confidence: 0.2-0.8 based on matches)
- Education keywords → SDG 4
- Climate keywords → SDG 13
- etc.

### Step 3: Return Top 3 SDGs
- Only SDGs with confidence ≥ 0.5 are included
- Sorted by confidence (highest first)
- Top 3 are returned

## Strategic Fit Scoring

### Base Score (1-5)
Based on number of Morocco priorities:
- 0 priorities → 1
- 1 priority → 2
- 2 priorities → 3
- 3 priorities → 4
- 4+ priorities → 5

### Bonuses (Max +1.0)
- Has SDG tags: +0.2
- High-priority sector (youth_employment, women_empowerment, green_morocco): +0.3
- Multiple SDGs (2+): +0.2
- High SDG confidence (avg ≥ 0.8): +0.3

### Final Score
`min(5, baseScore + bonus)`

## Funding Eligibility

### Intilaka Probability
Based on Stage 2 score and break-even:
- Score ≥ 32 → 80% probability
- Score ≥ 28 → 60% probability
- Score ≥ 25 → 40% probability
- Score ≥ 20 → 20% probability
- Score < 20 → 10% probability

Reduced if break-even > 9 months (×0.7) or > 12 months (×0.5)

### EU Grant Eligibility
- Requires 2+ SDG tags
- `euGrantEligible = sdgTags.length >= 2`

### Climate Fund Eligibility
- Has SDG 13 (Climate Action) OR
- Has "green_morocco" priority
- `climateFundEligible = sdgTags.includes(13) || moroccoPriorities.includes('green_morocco')`

## Usage Examples

### Example 1: Green Morocco Project
```typescript
const input: IdeaScoringInput = {
  problemStatement: 'Climate change affecting agriculture. Need renewable energy.',
  // ... other fields
  alignment: {
    moroccoPriorities: ['green_morocco'],
    sdgTags: [], // Will be auto-tagged
    sdgAutoTagged: false,
    sdgConfidence: {}
  }
};

const result = scoreIdeaComplete(input);
// result.alignment.sdgTags = [7, 13, 15] (auto-tagged)
// result.funding.climateFundEligible = true
```

### Example 2: Youth Employment Project
```typescript
const input: IdeaScoringInput = {
  problemStatement: 'Young people need jobs. Creating startup opportunities.',
  // ... other fields
  alignment: {
    moroccoPriorities: ['youth_employment'],
    sdgTags: [],
    sdgAutoTagged: false,
    sdgConfidence: {}
  }
};

const result = scoreIdeaComplete(input);
// result.alignment.sdgTags = [8] (auto-tagged)
// result.funding.euGrantEligible = false (only 1 SDG)
```

### Example 3: Health Project (Auto-detected)
```typescript
const input: IdeaScoringInput = {
  problemStatement: 'Hospitals need better patient management. Doctors spend too much time on paperwork.',
  // ... other fields
  alignment: {
    moroccoPriorities: [], // Will be auto-detected
    sdgTags: [],
    sdgAutoTagged: false,
    sdgConfidence: {}
  }
};

const result = scoreIdeaComplete(input);
// result.alignment.moroccoPriorities = ['health_system'] (auto-detected)
// result.alignment.sdgTags = [3] (auto-tagged from priority + text)
```

## API Reference

### `autoTagSDGs(input: IdeaScoringInput)`
Auto-tags SDGs from Morocco priorities and text analysis.

**Returns:**
```typescript
{
  sdgTags: number[]; // Top 3 SDGs with confidence ≥ 0.5
  sdgConfidence: { [sdg: number]: number }; // 0-1 confidence scores
}
```

### `scoreStrategicFit(input: IdeaScoringInput)`
Scores strategic alignment (1-5) based on Morocco priorities and SDG tags.

**Returns:** `number` (1-5)

### `scoreIdeaComplete(input: IdeaScoringInput)`
Complete scoring with funding eligibility.

**Returns:** `CompleteScoringResult` with:
- All standard scoring results
- `funding`: Intilaka probability, EU grant eligibility, climate fund eligibility
- `alignment`: Morocco priorities and SDG tags

## Testing

See `lib/idea-bank/scoring/two-stage-scorer.test.ts` for comprehensive test cases covering:
1. Green Morocco → SDG 7, 13, 15
2. Youth Employment → SDG 8
3. Women Empowerment → SDG 5, 8
4. Health keywords → SDG 3
5. No priorities → Low strategic fit
6. Multiple priorities → High strategic fit
7. Auto-detection from text
8. Funding eligibility

## Benefits

1. **User-Friendly**: Users only see Morocco priorities (simple, relevant)
2. **Funder-Ready**: SDG tags automatically available for grant applications
3. **Accurate**: High confidence from priorities, medium from text analysis
4. **Flexible**: Users can manually edit SDG tags if needed
5. **Transparent**: Confidence scores show how SDGs were determined

