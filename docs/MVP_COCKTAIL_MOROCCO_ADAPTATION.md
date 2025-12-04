# MVP Cocktail & Success Criteria - Moroccan Context Adaptation

## 🇲🇦 Overview

This document adapts the MVP Cocktail and Minimum Success Criteria frameworks specifically for **Moroccan entrepreneurs** and the **Moroccan market context**.

---

## Part 1: Moroccan Market Context

### Key Challenges for Moroccan Entrepreneurs:

1. **Connectivity:** 2G/3G networks, data costs, offline-first needed
2. **Payment:** Mobile money (M-Wallet, Orange Money) vs. credit cards
3. **Regulation:** PDPL compliance, Moroccan business laws
4. **Funding:** Limited VC access, diaspora funding, family/friends
5. **Language:** Darija, Tamazight, French, English (multilingual)
6. **Infrastructure:** Delivery logistics, payment gateways, banking
7. **Market Size:** Smaller domestic market, need for export/regional focus

### Opportunities:

1. **Diaspora:** 5M+ Moroccans abroad (remittances, expertise, market access)
2. **Mobile-First:** High smartphone penetration, mobile money adoption
3. **Youth:** 60% under 35, tech-savvy GenZ
4. **Regional Hub:** Gateway to Africa, EU proximity
5. **Government Support:** Startup Act, incubators, tax incentives

---

## Part 2: MVP Cocktail - Moroccan Adaptations

### Step 1: Delighter Feature (Moroccan Context)

**Key Question:** "What makes your idea categorically different for Moroccan customers?"

**Moroccan-Specific Delighters:**
- **Offline-First:** Works without internet (2G/3G reality)
- **Mobile Money Integration:** M-Wallet, Orange Money, CIH Bank
- **Darija/Tamazight Support:** Native language interface
- **Diaspora Connection:** Links Moroccans abroad with local market
- **PDPL Compliant:** Privacy-first by design
- **Low Data Usage:** Optimized for limited data plans
- **Cash-Friendly:** Supports cash payments, not just digital

**Example - Moroccan E-Commerce Delighter:**
- ❌ **Not a delighter:** "Online store" (everyone has this)
- ✅ **Delighter:** "Order via WhatsApp voice message in Darija, pay cash on delivery, works on 2G"

**Example - Moroccan EdTech Delighter:**
- ❌ **Not a delighter:** "Online courses" (Coursera exists)
- ✅ **Delighter:** "Download courses offline, pay 10 DH via mobile money, learn in Darija/Tamazight"

**Integration into Fikra Valley:**
- Add field: `delighter_feature_morocco` (TEXT)
- AI prompt: "What makes this idea categorically different for Moroccan customers? Consider: offline-first, mobile money, multilingual, diaspora connection, PDPL compliance."
- Display as: "🌟 Delighter pour le marché marocain"

---

### Step 2: Minimum Performance Metrics (Moroccan Context)

**Key Question:** "What's the minimum this needs to do to be taken seriously in Morocco?"

**Moroccan-Specific Performance Metrics:**

1. **Connectivity:**
   - Works on 2G/3G (not just 4G/WiFi)
   - Offline mode available
   - < 5MB app size (data cost consideration)

2. **Payment:**
   - Mobile money integration (M-Wallet, Orange Money)
   - Cash payment option
   - Low minimum payment (10-50 DH)

3. **Language:**
   - Darija support (spoken)
   - French support (written)
   - Tamazight support (if targeting rural areas)

4. **Compliance:**
   - PDPL compliant (data privacy)
   - Moroccan business registration
   - Tax compliance (TVA, etc.)

5. **Accessibility:**
   - Works on low-end smartphones
   - SMS/USSD fallback (for 2G-only users)
   - Voice interface option (for low literacy)

**Example - Moroccan Food Delivery:**
- ❌ **Not enough:** "App for ordering food"
- ✅ **Minimum performance:** "Order via WhatsApp/SMS, pay cash or mobile money, works on 2G, delivery in 30 min"

**Example - Moroccan FinTech:**
- ❌ **Not enough:** "Mobile banking app"
- ✅ **Minimum performance:** "Works offline, integrates M-Wallet/Orange Money, PDPL compliant, supports Darija"

**Integration:**
- Add field: `minimum_performance_morocco` (JSONB)
- Structure:
  ```json
  {
    "connectivity": "2G/3G compatible",
    "payment": "Mobile money + cash",
    "language": ["Darija", "French"],
    "compliance": "PDPL compliant",
    "accessibility": "Low-end smartphone compatible"
  }
  ```

---

### Step 3: Second Axis of "Better" (Moroccan Context)

**Key Question:** "What's a second way your idea is better for Moroccans?"

**Moroccan-Specific Second Axes:**

1. **Price:** "Most affordable" (10 DH vs. 100 DH)
2. **Speed:** "Fastest delivery" (30 min vs. 2 hours)
3. **Accessibility:** "Works everywhere" (rural + urban)
4. **Trust:** "Diaspora-verified" (Moroccans abroad vouch)
5. **Local:** "100% Moroccan" (vs. foreign platforms)
6. **Community:** "Neighborhood-based" (vs. city-wide)

**Example - Moroccan Ride-Sharing:**
- **Delighter 1:** "Offline-first, works on 2G"
- **Delighter 2:** "Neighborhood-based, driver is your neighbor (trust)"

**Example - Moroccan Marketplace:**
- **Delighter 1:** "Mobile money + cash payments"
- **Delighter 2:** "Diaspora can buy for family in Morocco"

**Integration:**
- Add field: `secondary_delighter_morocco` (TEXT)
- Display as: "🎯 Deuxième avantage pour le Maroc"

---

### Step 4: Wizard of Oz MVP - Moroccan Integrations

**Key Question:** "What existing Moroccan tools/platforms can you integrate instead of building?"

**Moroccan Tools to Integrate:**

1. **Payment:**
   - M-Wallet API
   - Orange Money API
   - CIH Bank API
   - Attijariwafa Bank API

2. **Communication:**
   - WhatsApp Business API
   - SMS Gateway (Maroc Telecom, Orange, Inwi)
   - USSD codes

3. **Delivery:**
   - Amana (existing delivery network)
   - Local courier APIs
   - Poste Maroc (La Poste)

4. **Identity/Verification:**
   - CIN (Carte Nationale d'Identité) verification
   - Phone number verification (Moroccan format)

5. **Maps/Location:**
   - Google Maps (works in Morocco)
   - Local address databases

6. **Banking:**
   - Bank APIs (CIH, Attijariwafa, BMCE)
   - Mobile banking integrations

**Example - Moroccan E-Commerce:**
- ❌ **Building from scratch:** Payment gateway, delivery network, SMS system
- ✅ **Wizard of Oz:** Integrate M-Wallet (payment), Amana (delivery), WhatsApp API (communication)

**Example - Moroccan EdTech:**
- ❌ **Building from scratch:** Video platform, payment system, SMS notifications
- ✅ **Wizard of Oz:** Use YouTube (video), Orange Money (payment), SMS Gateway (notifications)

**Integration:**
- Add field: `integration_opportunities_morocco` (JSONB)
- Structure:
  ```json
  {
    "payment": ["M-Wallet", "Orange Money"],
    "communication": ["WhatsApp Business API", "SMS Gateway"],
    "delivery": ["Amana", "Local courier"],
    "verification": ["CIN verification", "Phone verification"]
  }
  ```

---

## Part 3: Minimum Success Criteria - Moroccan Adaptations

### Level 1: Founder-Level (3-Year Goal) - Moroccan Context

**Key Question:** "What would make this idea a success for you in 3 years, considering the Moroccan market?"

**Moroccan-Specific Considerations:**

1. **Market Size:**
   - Domestic market: 37M people
   - Regional market: 100M+ (Maghreb, West Africa)
   - Diaspora market: 5M+ abroad

2. **Revenue Models:**
   - B2C: Mobile money, cash, low-ticket (10-100 DH)
   - B2B: Enterprise sales (longer cycles)
   - B2D: Diaspora market (higher purchasing power)

3. **Funding Reality:**
   - Bootstrap first (family/friends)
   - Angel investors (limited)
   - VC (very limited, need traction)
   - Diaspora investors (growing)

4. **Exit Scenarios:**
   - Acquisition by Moroccan company
   - Regional expansion (Algeria, Tunisia)
   - EU expansion (via diaspora)

**Example - Moroccan Food Delivery Founder Goal:**
- ❌ **Unrealistic:** "$10M ARR in 3 years" (too ambitious for Moroccan market)
- ✅ **Realistic:** "10,000 active users in Casablanca, 50 DH average order, 100 DH/month revenue per user = 10M DH/year (≈$1M)"

**Example - Moroccan EdTech Founder Goal:**
- ❌ **Unrealistic:** "1M users in 3 years" (too broad)
- ✅ **Realistic:** "50,000 paying students at 50 DH/month = 2.5M DH/month (≈$250K/month) = 30M DH/year (≈$3M/year)"

**Integration:**
- Add field: `founder_success_criteria_morocco` (JSONB)
- Structure:
  ```json
  {
    "three_year_goal": "10,000 active users in Casablanca",
    "target_revenue": 10000000,
    "currency": "MAD",
    "market": "domestic|regional|diaspora",
    "revenue_model": "subscription|transaction|advertising",
    "personal_motivation": "Create jobs for Moroccan youth"
  }
  ```

---

### Level 2: 90-Day Cycle - Moroccan Context

**Key Question:** "What's the minimum traction you need in 90 days to prove this works in Morocco?"

**Moroccan-Specific 90-Day Goals:**

1. **Early Stage (First 90 Days):**
   - 10-50 paying customers
   - 1,000-5,000 app downloads/views
   - 100-500 WhatsApp messages/interactions

2. **Validation Stage:**
   - 50-200 paying customers
   - 10,000+ app downloads/views
   - 1,000+ WhatsApp messages/interactions
   - 1-5 partnerships (delivery, payment, etc.)

3. **Growth Stage:**
   - 200-1,000 paying customers
   - 50,000+ app downloads/views
   - 10,000+ WhatsApp messages/interactions
   - 5-10 partnerships

**Moroccan Growth Rate Assumptions:**
- **Conservative:** 2x per year (bootstrap, organic)
- **Moderate:** 5x per year (some marketing, partnerships)
- **Aggressive:** 10x per year (VC-backed, aggressive marketing)

**Example - Moroccan E-Commerce 90-Day Goal:**
- **Year 1 Goal:** 1,000 customers
- **90-Day Goal (10x growth):** 10 customers (first 90 days)
- **90-Day Goal (5x growth):** 20 customers
- **90-Day Goal (2x growth):** 50 customers

**Integration:**
- Add field: `ninety_day_goals_morocco` (JSONB)
- Structure:
  ```json
  {
    "current_cycle": 1,
    "traction_goal": {
      "paying_customers": 10,
      "app_downloads": 1000,
      "whatsapp_interactions": 100,
      "revenue_mad": 5000
    },
    "growth_rate": "10x|5x|2x",
    "market_focus": "Casablanca|Rabat|National"
  }
  ```

---

### Level 3: Experiment Level - Moroccan Context

**Key Question:** "What's the smallest experiment you can run in 2 weeks to validate this in Morocco?"

**Moroccan-Specific Experiments:**

1. **Attention Experiments (2 weeks):**
   - 100 WhatsApp messages sent
   - 50 Facebook/Instagram posts
   - 10 in-person demos (cafés, coworking spaces)
   - 1,000 views on landing page

2. **Trust Experiments (2 weeks):**
   - 10 free trials/demos
   - 5 testimonials collected
   - 1 partnership (delivery, payment provider)
   - 50 sign-ups (email/phone)

3. **Revenue Experiments (2 weeks):**
   - 5 paying customers (via mobile money)
   - 1,000 MAD revenue
   - 1 repeat purchase
   - 1 referral

**Moroccan Experiment Channels:**
- **WhatsApp:** Direct messages, groups, Business API
- **Facebook/Instagram:** Ads, organic posts, groups
- **In-Person:** Cafés, coworking spaces, events
- **SMS:** Bulk SMS campaigns
- **Word of Mouth:** Family, friends, neighborhood

**Example - Moroccan Food Delivery Experiment:**
- **Experiment:** "10 restaurants, 50 orders via WhatsApp, 5,000 MAD revenue"
- **Success Criteria:** "5 paying customers, 1,000 MAD revenue, 1 repeat order"
- **Channel:** WhatsApp Business API + Facebook Ads

**Integration:**
- Add field: `experiment_success_criteria_morocco` (JSONB)
- Structure:
  ```json
  {
    "experiment_name": "WhatsApp ordering test",
    "duration_days": 14,
    "success_criteria": {
      "attention": { "whatsapp_messages": 100, "landing_views": 1000 },
      "trust": { "sign_ups": 50, "demos": 10 },
      "revenue": { "paying_customers": 5, "revenue_mad": 1000 }
    },
    "channels": ["WhatsApp", "Facebook Ads", "In-person"]
  }
  ```

---

## Part 4: Traction Funnel - Moroccan Adaptations

### Moroccan Traction Funnel:

**Attention → Trust → Revenue → Referrals**

**Moroccan-Specific Metrics:**

1. **Attention:**
   - WhatsApp messages sent/received
   - Facebook/Instagram views/engagement
   - Landing page views (mobile)
   - SMS sent/received
   - In-person demos

2. **Trust:**
   - Sign-ups (email/phone)
   - Free trials/demos completed
   - Testimonials collected
   - Partnerships formed
   - PDPL consent given

3. **Revenue:**
   - Paying customers (mobile money/cash)
   - Revenue (MAD)
   - Repeat purchases
   - Average order value (AOV)

4. **Referrals:**
   - Referrals from existing customers
   - Word-of-mouth mentions
   - Social media shares
   - WhatsApp forwards

**Moroccan Conversion Rates (Typical):**
- Attention → Trust: 5-10% (100 views → 5-10 sign-ups)
- Trust → Revenue: 10-20% (10 sign-ups → 1-2 paying customers)
- Revenue → Referrals: 20-30% (10 customers → 2-3 referrals)

**Integration:**
- Add field: `traction_funnel_morocco` (JSONB)
- Structure:
  ```json
  {
    "attention": {
      "whatsapp_messages": 100,
      "facebook_views": 1000,
      "landing_views": 500,
      "target": 1000
    },
    "trust": {
      "sign_ups": 50,
      "demos": 10,
      "testimonials": 5,
      "target": 100
    },
    "revenue": {
      "paying_customers": 5,
      "revenue_mad": 5000,
      "repeat_purchases": 1,
      "target": 10
    },
    "referrals": {
      "referrals": 1,
      "social_shares": 10,
      "whatsapp_forwards": 5,
      "target": 5
    }
  }
  ```

---

## Part 5: Moroccan-Specific Examples

### Example 1: Moroccan Food Delivery Platform

**MVP Cocktail:**
- **Delighter:** "Order via WhatsApp voice message in Darija, pay cash on delivery"
- **Performance:** "Works on 2G, 30-min delivery, 10 DH minimum order"
- **Second Axis:** "Neighborhood-based, driver is your neighbor (trust)"
- **Integration:** "M-Wallet (payment), Amana (delivery), WhatsApp API (communication)"

**Success Criteria:**
- **3-Year Goal:** "10,000 active users in Casablanca, 50 DH average order, 10M MAD/year"
- **90-Day Goal:** "10 paying customers, 1,000 MAD revenue, 1 restaurant partnership"
- **Experiment:** "5 restaurants, 50 orders via WhatsApp, 2,500 MAD revenue"

**Traction Funnel:**
- **Attention:** 1,000 WhatsApp messages, 500 Facebook views
- **Trust:** 50 sign-ups, 10 demos
- **Revenue:** 5 paying customers, 2,500 MAD revenue
- **Referrals:** 2 referrals, 10 WhatsApp forwards

---

### Example 2: Moroccan EdTech Platform

**MVP Cocktail:**
- **Delighter:** "Download courses offline, pay 10 DH via mobile money, learn in Darija/Tamazight"
- **Performance:** "Works offline, < 5MB app size, mobile money payment"
- **Second Axis:** "Diaspora can buy courses for family in Morocco"
- **Integration:** "YouTube (video), Orange Money (payment), SMS Gateway (notifications)"

**Success Criteria:**
- **3-Year Goal:** "50,000 paying students at 50 DH/month = 30M MAD/year"
- **90-Day Goal:** "50 paying students, 2,500 MAD revenue, 1 course published"
- **Experiment:** "10 free trials, 5 paying students, 250 MAD revenue"

**Traction Funnel:**
- **Attention:** 500 app downloads, 1,000 Facebook views
- **Trust:** 100 sign-ups, 10 free trials
- **Revenue:** 5 paying students, 250 MAD revenue
- **Referrals:** 1 referral, 5 social shares

---

### Example 3: Moroccan FinTech App

**MVP Cocktail:**
- **Delighter:** "Send money to family via WhatsApp, pay via mobile money, works offline"
- **Performance:** "PDPL compliant, mobile money integration, 2G compatible"
- **Second Axis:** "Diaspora can send remittances directly to mobile money"
- **Integration:** "M-Wallet API, Orange Money API, WhatsApp Business API"

**Success Criteria:**
- **3-Year Goal:** "100,000 active users, 10M MAD/month transactions, 1% fee = 1.2M MAD/year"
- **90-Day Goal:** "100 users, 10,000 MAD transactions, 1 mobile money partnership"
- **Experiment:** "20 users, 2,000 MAD transactions, 20 MAD revenue"

**Traction Funnel:**
- **Attention:** 2,000 app downloads, 5,000 Facebook views
- **Trust:** 200 sign-ups, 50 KYC verifications
- **Revenue:** 20 paying users, 2,000 MAD transactions
- **Referrals:** 5 referrals, 20 WhatsApp forwards

---

## Part 6: Database Schema - Moroccan Adaptations

```sql
-- Add Moroccan-specific MVP Cocktail fields
ALTER TABLE marrai_ideas 
ADD COLUMN delighter_feature_morocco TEXT,
ADD COLUMN minimum_performance_morocco JSONB,
ADD COLUMN secondary_delighter_morocco TEXT,
ADD COLUMN integration_opportunities_morocco JSONB;

-- Add Moroccan-specific Success Criteria fields
ALTER TABLE marrai_ideas 
ADD COLUMN founder_success_criteria_morocco JSONB,
ADD COLUMN ninety_day_goals_morocco JSONB,
ADD COLUMN traction_funnel_morocco JSONB;

-- Add Moroccan market context
ALTER TABLE marrai_ideas 
ADD COLUMN market_focus TEXT[] DEFAULT ARRAY['domestic'], -- domestic, regional, diaspora
ADD COLUMN payment_methods TEXT[] DEFAULT ARRAY['mobile_money', 'cash'], -- mobile_money, cash, credit_card
ADD COLUMN language_support TEXT[] DEFAULT ARRAY['Darija', 'French'], -- Darija, Tamazight, French, English
ADD COLUMN connectivity_requirement TEXT DEFAULT '2G/3G', -- 2G/3G, 4G, WiFi
ADD COLUMN pdpl_compliant BOOLEAN DEFAULT false;
```

---

## Part 7: AI Agent Prompts - Moroccan Context

### MVP Cocktail Analyzer (Moroccan):

```
Analyze this idea for the Moroccan market:

1. **Delighter Feature:** What makes this categorically different for Moroccan customers? 
   Consider: offline-first, mobile money, multilingual, diaspora connection, PDPL compliance.

2. **Minimum Performance:** What's the minimum this needs to do to be taken seriously in Morocco?
   Consider: 2G/3G compatibility, mobile money integration, Darija support, cash payments.

3. **Second Axis of Better:** What's a second way this is better for Moroccans?
   Consider: price, speed, accessibility, trust, local, community.

4. **Integration Opportunities:** What existing Moroccan tools can be integrated?
   Consider: M-Wallet, Orange Money, WhatsApp API, Amana, SMS Gateway, CIN verification.

Provide specific, actionable recommendations for the Moroccan market.
```

### Success Criteria Validator (Moroccan):

```
Validate this idea's success criteria for the Moroccan market:

1. **3-Year Goal:** Is this realistic for the Moroccan market size (37M domestic, 5M diaspora)?
   Consider: revenue models (B2C/B2B/B2D), funding reality (bootstrap vs VC), exit scenarios.

2. **90-Day Goal:** What's the minimum traction needed in 90 days?
   Consider: growth rate (2x/5x/10x), market focus (city vs national), typical conversion rates.

3. **Experiment Goal:** What's the smallest 2-week experiment?
   Consider: WhatsApp, Facebook, in-person, SMS, word-of-mouth channels.

Provide Moroccan-specific success criteria with realistic numbers.
```

---

## Part 8: UI/UX - Moroccan Adaptations

### Idea Submission Flow (Moroccan):

1. **Basic Idea** (existing)
2. **MVP Cocktail Analysis (Morocco):**
   - "Quel est votre avantage unique pour le marché marocain?" (Darija/French)
   - "Quelles sont les performances minimales nécessaires?" (Darija/French)
   - "Quels outils marocains pouvez-vous intégrer?" (Darija/French)
3. **Success Criteria (Morocco):**
   - "Quel est votre objectif à 3 ans?" (Darija/French)
   - "Quelle traction avez-vous besoin dans 90 jours?" (Darija/French)

### Idea Detail Page (Moroccan):

**New Tab: "MVP Cocktail (Maroc)"**
- 🌟 **Delighter pour le Maroc:** [extracted]
- ✅ **Performances minimales:** [extracted]
- 🎯 **Deuxième avantage:** [extracted]
- 🔗 **Intégrations marocaines:** [M-Wallet, Orange Money, etc.]

**New Tab: "Critères de Succès (Maroc)"**
- 📊 **Objectif 3 ans:** [progress bar]
- 📅 **Objectif 90 jours:** [traction dashboard]
- 🧪 **Expériences:** [experiment timeline]
- 📈 **Traction Funnel:** [visualization]

---

## Part 9: Implementation Priority

### Phase 1: Moroccan MVP Cocktail (Week 1-2)
- [ ] Add Moroccan-specific MVP Cocktail fields
- [ ] Create Moroccan MVP Cocktail Analyzer agent
- [ ] Update idea submission flow (Darija/French)
- [ ] Add "MVP Cocktail (Maroc)" tab to idea detail

### Phase 2: Moroccan Success Criteria (Week 3-4)
- [ ] Add Moroccan success criteria fields
- [ ] Create Moroccan Success Criteria Validator agent
- [ ] Add 90-day traction dashboard (MAD currency)
- [ ] Add experiment tracking (WhatsApp, Facebook, etc.)

### Phase 3: Moroccan Traction Funnel (Week 5-6)
- [ ] Add Moroccan traction funnel fields
- [ ] Build traction funnel visualization (Moroccan metrics)
- [ ] Add conversion rate tracking (Moroccan benchmarks)
- [ ] Add channel tracking (WhatsApp, Facebook, SMS, etc.)

### Phase 4: Integration & Localization (Week 7-8)
- [ ] Localize all UI to Darija/French/Tamazight
- [ ] Integrate with Moroccan tools (M-Wallet, Orange Money, etc.)
- [ ] Add PDPL compliance checks
- [ ] Create Moroccan mentor matching (based on MVP expertise)

---

## Part 10: Success Metrics (Moroccan)

### For Founders:
- **Time to MVP:** Reduced from 6 months → 2 months (using Moroccan integrations)
- **Validation Speed:** Experiments completed in 2 weeks (via WhatsApp/Facebook)
- **Pivot Speed:** Identify failures in 90 days (not 1 year)

### For Fikra Valley:
- **Idea Quality:** Higher delighter scores = better ideas for Moroccan market
- **Engagement:** More experiments = more active Moroccan founders
- **Mentor Matching:** Better matches based on Moroccan MVP expertise
- **Market Fit:** Ideas validated specifically for Moroccan context

---

## Next Steps

1. **Review this adaptation** with Moroccan entrepreneurs
2. **Test with real Moroccan ideas** in Fikra Valley
3. **Iterate based on feedback** from Moroccan founders
4. **Localize UI** to Darija/French/Tamazight
5. **Integrate Moroccan tools** (M-Wallet, Orange Money, WhatsApp API)

---

## References

- MVP Cocktail Framework (adapted for Morocco)
- Minimum Success Criteria (adapted for Morocco)
- Moroccan Market Context (2G, mobile money, PDPL, diaspora)
- Moroccan Business Culture (trust, community, word-of-mouth)

