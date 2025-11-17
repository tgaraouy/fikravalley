# Morocco Priority → SDG Mappings

## Complete Mapping Reference

This document shows how each Morocco government priority automatically maps to UN Sustainable Development Goals (SDGs).

### 1. Green Morocco Plan (المغرب الأخضر)
**Priority ID**: `green_morocco`

**SDG Mappings**:
- **SDG 7**: Affordable and Clean Energy
- **SDG 13**: Climate Action
- **SDG 15**: Life on Land

**Keywords**: climate, energy, solar, environment, carbon, renewable, agriculture, farm, akhdar, green, bi2a, manakh

**Use Cases**:
- Renewable energy projects
- Climate adaptation solutions
- Sustainable agriculture
- Environmental protection

---

### 2. Digital Morocco 2025 (المغرب الرقمي)
**Priority ID**: `digital_morocco`

**SDG Mappings**:
- **SDG 9**: Industry, Innovation and Infrastructure

**Keywords**: digital, technology, internet, app, software, online, tech, AI, raqami, numérique, e-government, e-gouvernement

**Use Cases**:
- Digital transformation projects
- E-government platforms
- Tech innovation
- Digital infrastructure

---

### 3. Vision 2030 (رؤية 2030)
**Priority ID**: `vision_2030`

**SDG Mappings**:
- **SDG 8**: Decent Work and Economic Growth
- **SDG 9**: Industry, Innovation and Infrastructure

**Keywords**: economy, growth, development, competitiveness, iqtisad, tanmiya, croissance

**Use Cases**:
- Economic development projects
- Competitiveness initiatives
- Human capital development

---

### 4. Youth Employment Priority (أولوية تشغيل الشباب)
**Priority ID**: `youth_employment`

**SDG Mappings**:
- **SDG 8**: Decent Work and Economic Growth

**Keywords**: youth, shabab, job, khdma, employment, entrepreneur, startup, jeune, tashghil, emploi

**Use Cases**:
- Job creation for young people
- Entrepreneurship programs
- Startup support
- Youth skills development

---

### 5. Women Entrepreneurship (ريادة الأعمال النسائية)
**Priority ID**: `women_empowerment`

**SDG Mappings**:
- **SDG 5**: Gender Equality
- **SDG 8**: Decent Work and Economic Growth

**Keywords**: women, mra, nisa, female, gender, equality, mosawat, femme, égalité

**Use Cases**:
- Women-led businesses
- Gender equality initiatives
- Economic empowerment of women
- Women's entrepreneurship support

---

### 6. Rural Development (التنمية القروية)
**Priority ID**: `rural_development`

**SDG Mappings**:
- **SDG 1**: No Poverty
- **SDG 2**: Zero Hunger
- **SDG 6**: Clean Water and Sanitation
- **SDG 11**: Sustainable Cities and Communities

**Keywords**: rural, village, qrya, countryside, farmer, fellah, qrawi, rural, campagne

**Use Cases**:
- Rural infrastructure projects
- Agricultural development
- Water access in rural areas
- Village connectivity

---

### 7. Healthcare Improvement (تحسين الصحة)
**Priority ID**: `health_system`

**SDG Mappings**:
- **SDG 3**: Good Health and Well-being

**Keywords**: health, si7a, hospital, sbitar, medical, doctor, tbib, nurse, santé, patient

**Use Cases**:
- Healthcare access improvement
- Hospital management systems
- Telemedicine
- Public health initiatives

---

### 8. Quality Education (التعليم الجيد)
**Priority ID**: `education_quality`

**SDG Mappings**:
- **SDG 4**: Quality Education

**Keywords**: education, ta3lim, school, madrasa, university, student, talib, teacher, prof, éducation

**Use Cases**:
- Educational technology
- School management systems
- Online learning platforms
- Teacher training programs

---

## Auto-Tagging Confidence Levels

### High Confidence (0.9)
SDGs mapped directly from Morocco priorities:
- User selects "Green Morocco" → SDG 7, 13, 15 (confidence: 0.9 each)
- User selects "Youth Employment" → SDG 8 (confidence: 0.9)
- User selects "Women Empowerment" → SDG 5, 8 (confidence: 0.9 each)

### Medium Confidence (0.2-0.8)
SDGs detected from text analysis:
- Text contains "health", "hospital", "doctor" → SDG 3 (confidence: 0.2-0.8 based on keyword matches)
- Text contains "education", "school", "student" → SDG 4
- Text contains "climate", "environment" → SDG 13

### Selection Criteria
- Only SDGs with confidence ≥ 0.5 are included
- Top 3 SDGs by confidence are returned
- Priority-based SDGs (0.9) always take precedence over text-based (max 0.8)

---

## Strategic Fit Scoring Impact

### Base Score from Priorities
- 0 priorities → Score: 1
- 1 priority → Score: 2
- 2 priorities → Score: 3
- 3 priorities → Score: 4
- 4+ priorities → Score: 5

### Bonuses from SDG Tags
- Has SDG tags: +0.2
- Multiple SDGs (2+): +0.2
- High SDG confidence (avg ≥ 0.8): +0.3
- High-priority sector: +0.3

**High-priority sectors**: `youth_employment`, `women_empowerment`, `green_morocco`

---

## Funding Eligibility Rules

### EU Grant Eligibility
**Requirement**: 2+ SDG tags
```typescript
euGrantEligible = alignment.sdgTags.length >= 2
```

### Climate Fund Eligibility
**Requirement**: SDG 13 (Climate Action) OR `green_morocco` priority
```typescript
climateFundEligible = 
  alignment.sdgTags.includes(13) || 
  alignment.moroccoPriorities.includes('green_morocco')
```

### Intilaka Probability
Based on Stage 2 score:
- ≥32 → 80%
- ≥28 → 60%
- ≥25 → 40%
- ≥20 → 20%
- <20 → 10%

Reduced if break-even > 9 months (×0.7) or > 12 months (×0.5)

---

## Example Scenarios

### Scenario 1: Solar Energy Project
**User selects**: `green_morocco`
**Auto-tagged SDGs**: [7, 13, 15]
**Strategic Fit**: High (base 2 + bonuses)
**Funding**: ✅ EU Grant eligible, ✅ Climate Fund eligible

### Scenario 2: Youth Startup Platform
**User selects**: `youth_employment`
**Auto-tagged SDGs**: [8]
**Strategic Fit**: Medium (base 2 + bonuses)
**Funding**: ❌ EU Grant (needs 2+ SDGs), ❌ Climate Fund

### Scenario 3: Women's Health App
**User selects**: `women_empowerment`, `health_system`
**Auto-tagged SDGs**: [5, 8, 3]
**Strategic Fit**: High (base 3 + bonuses)
**Funding**: ✅ EU Grant eligible (3 SDGs), ❌ Climate Fund

---

## Notes

- **Users never see SDG complexity** - they only interact with Morocco priorities
- **SDG tags are auto-generated** but can be manually edited if needed
- **Confidence scores** show how SDGs were determined (0.9 = from priority, 0.2-0.8 = from text)
- **Top 3 SDGs** are returned to keep it focused and relevant

