# 📊 AI Startup Ideas Dataset

## Overview

This dataset contains **36 structured AI startup ideas** based on comprehensive analysis of AI startup opportunities. The ideas are categorized across five sectors and ready for insertion into Supabase.

## Dataset Structure

### Categories

1. **Productivity & Workflow** (6 ideas)
   - AI Meeting Assistant
   - Email Inbox Copilot
   - AI Sales Email Generator
   - AI Knowledge Base Updater
   - Voice-to-Action Assistant
   - AI Productivity Analytics Dashboard

2. **Healthcare & Biotech** (8 ideas)
   - AI Symptom Checker
   - AI Radiology Assistant
   - Personalized Treatment Advisor
   - AI Drug Discovery Platform
   - Virtual Mental Health Therapist
   - Wearable Health Data Monitor
   - AI Clinical Trial Optimizer
   - Elder Care Companion Bot
   - AI-Powered Genomic Analysis

3. **Infrastructure & Tools** (2 ideas)
   - AI Model Monitoring Platform
   - AI Data Labeling Platform

4. **Finance & Business** (10 ideas)
   - AI Fraud Detection System
   - AI Personal Finance Copilot
   - Automated AI Accountant for SMBs
   - AI Loan Underwriting Assistant
   - AI-Powered Trading Assistant
   - AI Contract Review Platform
   - AI Customer Support Agent for Banks/Fintechs
   - AI Business Intelligence Dashboard
   - AI Tax Filing Assistant
   - AI Risk & Compliance Monitor

5. **Education & Learning** (10 ideas)
   - Personalized AI Tutor
   - Essay Feedback & Writing Coach
   - AI Classroom Assistant for Teachers
   - Adaptive Test Prep Platform
   - AI-Powered Language Learning App
   - AI Career & Skills Coach
   - AI Flashcard & Revision Generator
   - Virtual AI Study Group
   - AI STEM Lab Simulator
   - AI Parent Dashboard

## Key Insights Captured

### 1. The "Gold Rush" vs "Shovel Sellers" Framework
- **Gold Miners**: AI-first startups (apps, agents, copilots)
- **Shovel Sellers**: Infrastructure and tooling startups
- Both approaches have opportunities

### 2. Types of AI Businesses
- AI SaaS Platforms
- AI Agents & Automations
- Vertical AI (Industry-Specific)
- AI Marketplaces & Ecosystems
- AI for Consumers (B2C)
- AI Infrastructure & Developer Tools

### 3. Opportunity Recognition Framework
- Look for pain points, not just cool tech
- Find market gaps where AI gives an edge
- Validate demand quickly
- Spot inefficiencies in old industries
- Pay attention to emerging AI capabilities
- Follow the money and adoption trends

## Files

### 1. TypeScript Script
**Location:** `scripts/seed-ai-startup-ideas.ts`

**Usage:**
```bash
npm run seed:ai-ideas
```

**Features:**
- Type-safe insertion
- Error handling
- Progress reporting
- Uses service role key (bypasses RLS)

### 2. SQL Script
**Location:** `supabase/seed_ai_startup_ideas.sql`

**Usage:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy/paste the SQL file content
4. Run the query

**Features:**
- Direct database insertion
- Includes verification query
- Can be run multiple times (ON CONFLICT DO NOTHING)

## Data Schema

Each idea includes:
- `title`: Clear, descriptive title
- `problem_statement`: Detailed problem description
- `proposed_solution`: AI-powered solution
- `category`: 'tech', 'health', 'finance', etc.
- `location`: 'other' (global ideas)
- `current_manual_process`: How it's done now
- `digitization_opportunity`: How AI can improve it
- `submitter_name`: 'AI Startup Research'
- `submitter_email`: 'research@fikravalley.com'
- `submitter_type`: 'entrepreneur'
- `submitted_via`: 'web'
- `status`: 'submitted'

## Business Models Included

- **SaaS Subscriptions**: $15-60/user/month
- **B2B Enterprise**: $500-2,000/month
- **Freemium Mobile**: Free + $10/month premium
- **Enterprise SaaS**: $5-20/employee/month
- **B2B Licensing**: Per-patient or per-company

## Tech Stacks Referenced

- OpenAI API / GPT models
- Whisper API (speech-to-text)
- Computer Vision (CNNs)
- Medical LLMs
- Deep Learning models
- NLP for text analysis
- ML-based analytics
- Various API integrations (Zoom, Slack, Notion, LinkedIn, Gmail, etc.)

## Use Cases

1. **Testing**: Use these ideas to test the full pipeline (Agent 1 → Agent 2 → Agent 5 → etc.)
2. **Demo Data**: Showcase the platform with real-world examples
3. **Training**: Use for training agents and improving extraction
4. **Analysis**: Analyze patterns across different AI startup categories

## Verification

After insertion, verify with:

```sql
SELECT 
  COUNT(*) as total,
  category,
  status
FROM marrai_ideas
WHERE submitter_email = 'research@fikravalley.com'
GROUP BY category, status;
```

Expected: 36 ideas total
- 6 tech ideas (Productivity & Infrastructure)
- 8 health ideas
- 10 finance ideas
- 10 education ideas

## Next Steps

1. **Insert the dataset** using one of the methods above
2. **Run Agent 2** to analyze feasibility and impact
3. **Run Agent 5** to match with mentors
4. **Review in admin dashboard** to approve matches
5. **Test the full journey** from submission to mentor acceptance

## Notes

- All ideas use `submitted_via: 'web'` (valid constraint value)
- All ideas use `location: 'other'` (global/not location-specific)
- Ideas are structured to be analyzed by Agent 2A-C
- Ideas include both problem and solution (ready for Agent 1 extraction)
- All fields follow the `marrai_ideas` schema constraints

