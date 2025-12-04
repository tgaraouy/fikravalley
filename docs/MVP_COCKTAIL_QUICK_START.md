# MVP Cocktail Framework - Quick Start Guide

## 🎯 What This Does

Helps **Moroccan founders** build **Minimum Valuable Products** (not just viable) by:
1. Identifying the ONE delighter feature that makes their idea different **for the Moroccan market**
2. Defining minimum performance metrics **considering 2G, mobile money, PDPL, etc.**
3. Finding a second axis of "better" **for Moroccan customers**
4. Using existing **Moroccan tools** (M-Wallet, Orange Money, WhatsApp API) instead of building from scratch

> 🇲🇦 **Moroccan Context:** This framework is adapted for Moroccan market realities: 2G/3G connectivity, mobile money, PDPL compliance, multilingual (Darija/Tamazight/French), diaspora market, and cash-friendly payments.

---

## 🚀 Quick Implementation (MVP of MVP Cocktail)

### Step 1: Add Simple Fields to Idea Submission (Moroccan Context)

Add these questions to the voice submission flow (in Darija/French):

1. **"شنو اللي كيخلي فكرتك مختلفة للمغرب؟" / "Quel est votre avantage unique pour le marché marocain?"** → `delighter_feature_morocco`
   - Consider: offline-first, mobile money, multilingual, diaspora connection, PDPL compliance

2. **"شنو الأدنى اللي خاصها تخدم باش تكون جادة؟" / "Quelles sont les performances minimales nécessaires?"** → `minimum_performance_morocco`
   - Consider: 2G/3G compatibility, mobile money integration, Darija support, cash payments

3. **"شنو الأدوات المغربية اللي تقدر تستعمل؟" / "Quels outils marocains pouvez-vous intégrer?"** → `integration_opportunities_morocco`
   - Consider: M-Wallet, Orange Money, WhatsApp API, Amana, SMS Gateway

### Step 2: Display in Idea Detail Page (Moroccan Context)

Add a new section: **"MVP Cocktail (Maroc)"**

Show:
- 🌟 **Delighter pour le Maroc:** [extracted from submission]
  - Example: "Order via WhatsApp voice message in Darija, pay cash on delivery"
- ✅ **Performances minimales:** [extracted from submission]
  - Example: "Works on 2G, 30-min delivery, mobile money integration"
- 🎯 **Deuxième avantage:** [extracted from submission]
  - Example: "Neighborhood-based, driver is your neighbor (trust)"
- 🔗 **Intégrations marocaines:** [extracted from submission]
  - Example: "M-Wallet, Orange Money, WhatsApp API, Amana"

### Step 3: Enhance AI Analysis (Moroccan Context)

Update the existing analysis agent to:
- Extract delighter feature **for Moroccan market** (offline-first, mobile money, multilingual, etc.)
- Suggest minimum performance metrics **considering Moroccan realities** (2G, mobile money, PDPL, cash)
- Identify **Moroccan integration opportunities** (M-Wallet, Orange Money, WhatsApp API, Amana, SMS Gateway)

---

## 📊 Minimum Success Criteria - Quick Start (Moroccan Context)

### Add to Idea Submission (Darija/French):

**"شنو اللي غادي يخلي هاد الفكرة نجاح ف 3 سنين؟" / "Quel est votre objectif à 3 ans?"**
- Field: `founder_success_criteria_morocco` (JSONB)
- Consider: Moroccan market size (37M domestic, 5M diaspora), revenue in MAD, growth rate (2x/5x/10x)

**"شنو الأدنى اللي خاصك ف 90 يوم؟" / "Quelle traction avez-vous besoin dans 90 jours?"**
- Field: `ninety_day_goals_morocco` (JSONB)
- Consider: 10-50 paying customers, 1,000-5,000 views, WhatsApp/Facebook interactions

### Display in Dashboard (Moroccan Context):

Show progress bars:
- **Objectif 3 ans:** "Sur la bonne voie" or "En retard" (with MAD revenue)
- **Objectif 90 jours:** "5/10 clients (50%)" (with Moroccan metrics: WhatsApp messages, Facebook views, etc.)

---

## 🎨 UI Mockup Ideas

### Idea Card Enhancement (Moroccan):
```
┌─────────────────────────────────┐
│ 💡 Food Delivery Platform       │
│ 🌟 Delighter: WhatsApp + Cash  │
│ ✅ Performance: 2G + 30 min     │
│ 📊 Traction: 5/10 clients (50%) │
│ 💰 Revenue: 2,500 MAD          │
└─────────────────────────────────┘
```

### Idea Detail Page - New Tab (Moroccan):
```
┌─ MVP Cocktail (Maroc) ─────────┐
│                                 │
│ 🌟 Delighter pour le Maroc     │
│ Commander via WhatsApp (Darija)│
│ Paiement cash à la livraison    │
│                                 │
│ ✅ Performances minimales       │
│ • Fonctionne sur 2G/3G         │
│ • Livraison en 30 min          │
│ • Intégration mobile money      │
│                                 │
│ 🎯 Deuxième avantage            │
│ Basé sur le quartier (confiance)│
│                                 │
│ 🔗 Intégrations marocaines      │
│ • M-Wallet (paiement)          │
│ • Amana (livraison)            │
│ • WhatsApp Business API         │
└─────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Database Changes (Moroccan Context):

```sql
-- Add Moroccan MVP Cocktail fields
ALTER TABLE marrai_ideas 
ADD COLUMN delighter_feature_morocco TEXT,
ADD COLUMN minimum_performance_morocco JSONB,
ADD COLUMN secondary_delighter_morocco TEXT,
ADD COLUMN integration_opportunities_morocco JSONB;

-- Add Moroccan Success Criteria fields
ALTER TABLE marrai_ideas 
ADD COLUMN founder_success_criteria_morocco JSONB,
ADD COLUMN ninety_day_goals_morocco JSONB;

-- Add Moroccan market context
ALTER TABLE marrai_ideas 
ADD COLUMN market_focus TEXT[] DEFAULT ARRAY['domestic'], -- domestic, regional, diaspora
ADD COLUMN payment_methods TEXT[] DEFAULT ARRAY['mobile_money', 'cash'],
ADD COLUMN language_support TEXT[] DEFAULT ARRAY['Darija', 'French'],
ADD COLUMN connectivity_requirement TEXT DEFAULT '2G/3G',
ADD COLUMN pdpl_compliant BOOLEAN DEFAULT false;
```

### API Changes:

Update `/api/ideas/[id]/analyze` to include:
- MVP Cocktail extraction
- Success criteria validation

### UI Changes:

1. **Submission Flow:** Add 3 new questions (optional)
2. **Idea Detail:** Add "MVP Cocktail" section
3. **Dashboard:** Show delighter badge and traction progress

---

## 📈 Success Metrics

Track:
- **% of ideas with delighter features identified**
- **% of ideas with success criteria defined**
- **Time to first experiment** (should be < 2 weeks)

---

## 🎯 Next Steps

1. **Week 1:** Add fields to database and submission flow
2. **Week 2:** Update AI analysis to extract MVP Cocktail
3. **Week 3:** Add UI to display MVP Cocktail analysis
4. **Week 4:** Add success criteria tracking

---

## 💡 Key Insights (Adapted for Morocco)

### MVP Cocktail Framework (Moroccan):
- **Delighters first** → What makes you different **for Moroccan customers?**
  - Consider: offline-first, mobile money, multilingual, diaspora, PDPL
- **Performance second** → What's the minimum to compete **in Morocco?**
  - Consider: 2G/3G, mobile money, Darija, cash payments
- **Must-haves last** → Use existing **Moroccan tools** (Wizard of Oz MVP)
  - Consider: M-Wallet, Orange Money, WhatsApp API, Amana, SMS Gateway

### Minimum Success Criteria (Moroccan):
- **3-Year Goal** → Why are you doing this? (Consider: 37M domestic, 5M diaspora, MAD revenue)
- **90-Day Goal** → What traction do you need now? (Consider: WhatsApp, Facebook, in-person)
- **Experiment Goal** → What's the smallest win? (2 weeks max, via Moroccan channels)

### Avoid These Traps (Moroccan Context):
1. ❌ Confusing learning with traction (10 interviews ≠ 10 customers)
2. ❌ Waiting for statistical significance (use qualitative + small quantitative)
3. ❌ Over-planning instead of experimenting (start with WhatsApp/Facebook)

### Moroccan-Specific Considerations:
- 🇲🇦 **Market Size:** 37M domestic, 5M diaspora, 100M+ regional
- 💰 **Revenue:** MAD (not USD), low-ticket (10-100 DH), mobile money
- 📱 **Channels:** WhatsApp, Facebook, SMS, in-person (not just web)
- 🌐 **Connectivity:** 2G/3G (offline-first), data costs, SMS fallback
- 🔒 **Compliance:** PDPL (data privacy), Moroccan business laws

---

## 🔗 Related Documents

- `MVP_COCKTAIL_INTEGRATION_PLAN.md` - Full integration plan
- `MVP_COCKTAIL_MOROCCO_ADAPTATION.md` - **Moroccan context adaptation** (comprehensive)
- `PRESEED_FRAMEWORK_INTEGRATION_PLAN.md` - Related pre-seed framework

## 🇲🇦 Moroccan Examples

### Example 1: Food Delivery Platform
- **Delighter:** WhatsApp voice ordering in Darija + cash on delivery
- **Performance:** Works on 2G, 30-min delivery, mobile money integration
- **Integration:** M-Wallet, Amana, WhatsApp Business API

### Example 2: EdTech Platform
- **Delighter:** Offline courses, 10 DH via mobile money, Darija/Tamazight
- **Performance:** < 5MB app, offline mode, mobile money payment
- **Integration:** YouTube (video), Orange Money, SMS Gateway

### Example 3: FinTech App
- **Delighter:** Send money via WhatsApp, mobile money, works offline
- **Performance:** PDPL compliant, 2G compatible, mobile money integration
- **Integration:** M-Wallet API, Orange Money API, WhatsApp Business API

