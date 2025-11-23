# Voice-Driven Mentor Matching System

## Overview

Transformed the mentor finding experience to be **voice-driven** where users describe their background and motivation, and an AI agent analyzes and recommends mentors from the database.

---

## What Changed

### 1. **Voice-Driven User Input**

**Before:** Form-based (idea description, category, location)

**Now:** Voice-driven conversation
- User describes **background** (experience, skills, sector)
- User describes **motivation** (why they need a mentor, what help they want)
- AI agent analyzes and extracts relevant attributes
- Matches with mentors from `marrai_mentors` database

### 2. **AI Agent Integration**

The mentor agent now:
- ✅ Fetches mentors from `marrai_mentors` table (not mock data)
- ✅ Analyzes user background and motivation via voice/text
- ✅ Extracts: sector, skills, location, needs
- ✅ Matches with mentors based on expertise and experience
- ✅ Returns personalized recommendations

### 3. **Mentor Registration System**

Created complete mentor engagement system:
- ✅ Registration page (`/become-mentor`)
- ✅ Registration API endpoint
- ✅ Benefits showcase
- ✅ Form to collect mentor profile
- ✅ Links from find-mentor page

---

## User Flow

### Finding a Mentor

```
1. User goes to /find-mentor
   ↓
2. Voice-driven interface:
   - 🎤 Describe background (voice or text)
   - 🎯 Describe motivation (voice or text)
   ↓
3. Click "Trouver mes mentors (IA)"
   ↓
4. AI agent:
   - Analyzes background and motivation
   - Extracts: sector, skills, location, needs
   - Queries marrai_mentors database
   - Matches based on expertise
   ↓
5. Shows recommended mentors with:
   - Match score
   - Reasons for match
   - Mentor profile
   - Request introduction button
```

### Becoming a Mentor

```
1. User clicks "S'inscrire comme Mentor"
   ↓
2. Registration page (/become-mentor):
   - Benefits showcase
   - Registration form
   ↓
3. Fill form:
   - Personal info (name, email, phone, location)
   - Professional info (role, company, experience)
   - Expertise (domains, skills)
   - Engagement (hours available, co-funding interest)
   ↓
4. Submit → Saved to marrai_mentors table
   ↓
5. Mentor becomes available for matching
```

---

## Files Created/Modified

### New Files:
- `components/mentor/VoiceMentorSearch.tsx` - Voice-driven search component
- `app/become-mentor/page.tsx` - Mentor registration page
- `app/api/mentors/register/route.ts` - Registration API

### Modified Files:
- `app/find-mentor/page.tsx` - Updated to use voice-driven search
- `app/api/agents/mentor/route.ts` - Updated to:
  - Fetch from `marrai_mentors` table
  - Support `find_matches_by_profile` action
  - Transform database mentors to Mentor interface

---

## Database Integration

### Mentor Agent Now Uses:
- **Table:** `marrai_mentors` (from migration 002)
- **Fields Used:**
  - `name`, `email`, `phone`
  - `location`, `moroccan_city`
  - `current_role`, `company`
  - `years_experience`
  - `expertise` (array)
  - `skills` (array)
  - `willing_to_mentor`
  - `available_hours_per_month`
  - `ideas_matched`, `ideas_funded`

### Matching Logic:
1. Fetch mentors where `willing_to_mentor = true`
2. Transform to Mentor interface
3. Use existing matching algorithm
4. Score based on expertise, location, experience
5. Return top matches

---

## Voice Input Features

### Background Section:
- User describes: experience, skills, sector
- Voice recognition (Darija/French)
- Text editing available
- Confidence indicator

### Motivation Section:
- User describes: why they need mentor, what help they want
- Voice recognition
- Text editing available
- Confidence indicator

### AI Analysis:
- Extracts sector from background
- Extracts skills from background
- Extracts location from background
- Extracts needs from motivation
- Matches with relevant mentors

---

## Mentor Registration Form

### Sections:
1. **Personal Info:**
   - Name, email, phone
   - Current location
   - Moroccan city of origin

2. **Professional Info:**
   - Current role, company
   - Years of experience
   - Available hours/month

3. **Expertise:**
   - Domains (comma-separated)
   - Technical skills (comma-separated)
   - Bio/presentation

4. **Engagement:**
   - Willing to co-fund (checkbox)
   - Max co-funding amount
   - MGL chapter

5. **Links:**
   - LinkedIn URL
   - Website URL

---

## API Endpoints

### 1. Find Mentors by Profile
```
POST /api/agents/mentor
{
  "action": "find_matches_by_profile",
  "data": {
    "background": "User's background description",
    "motivation": "User's motivation description"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [/* MentorMatch[] */],
  "profile": {
    "background": "...",
    "motivation": "..."
  }
}
```

### 2. Register Mentor
```
POST /api/mentors/register
{
  "name": "...",
  "email": "...",
  "expertise": ["healthcare", "tech"],
  "willing_to_mentor": true,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inscription réussie!",
  "mentor": {
    "id": "...",
    "name": "...",
    "email": "..."
  }
}
```

---

## Benefits for Mentors

### Why Register:
- ✅ **Real Impact:** Help entrepreneurs transform ideas into businesses
- ✅ **Network:** Connect with next generation of Moroccan entrepreneurs
- ✅ **Flexibility:** Choose hours and number of ideas to mentor
- ✅ **Recognition:** Profile visible, receive targeted requests
- ✅ **Optional Co-funding:** Can indicate interest in co-funding

---

## Next Steps (Future Enhancements)

1. **Claude API Integration:**
   - Use Claude to analyze background/motivation
   - Extract structured attributes
   - Better matching accuracy

2. **Email Notifications:**
   - Welcome email for new mentors
   - Notify mentors of new matches
   - Notify users when mentor accepts

3. **Mentor Dashboard:**
   - View matched ideas
   - Accept/reject requests
   - Track mentorship progress

4. **Matching Improvements:**
   - Use vector embeddings for semantic search
   - Better intimacy rating calculation
   - Track mentor success rates

---

## Summary

**Problem:** Mentor finding was form-based, not engaging for users or mentors.

**Solution:**
- ✅ Voice-driven user input (background + motivation)
- ✅ AI agent analyzes and matches with database mentors
- ✅ Mentor registration system to engage mentors
- ✅ Complete flow from registration to matching

**Result:**
- Users can describe themselves naturally (voice or text)
- AI finds the best mentors automatically
- Mentors can easily register and become available
- System is ready for real mentor database

**Status:** ✅ **IMPLEMENTED AND READY**

