# Content Moderation System

## Overview

Comprehensive content moderation system to prevent abuse, filter inappropriate content, and respect traditional norms and protocols across the entire application.

---

## Features

### 1. **Real-Time Content Filtering**
- ✅ Blocks abusive words/phrases in real-time
- ✅ Filters profanity (English, French, Darija)
- ✅ Blocks hate speech and discrimination
- ✅ Prevents violence and threats
- ✅ Blocks illegal activities references
- ✅ Filters inappropriate sexual content
- ✅ Detects scams and fraud

### 2. **Cultural Sensitivity**
- ✅ Respects Moroccan/Muslim cultural norms
- ✅ Flags religious references for context review
- ✅ Flags political content for review
- ✅ Encourages positive content (innovation, entrepreneurship)

### 3. **Voice Recording Protection**
- ✅ Real-time moderation during voice transcription
- ✅ Blocks inappropriate content before it's saved
- ✅ Shows clear error messages
- ✅ Prevents submission of blocked content

### 4. **API-Level Protection**
- ✅ All API endpoints check content before saving
- ✅ Rate limiting to prevent spam
- ✅ Content sanitization
- ✅ Returns helpful error messages

### 5. **User Experience**
- ✅ Clear error messages
- ✅ Suggestions for reformulation
- ✅ Visual indicators (red/yellow/green)
- ✅ Real-time feedback

---

## Implementation

### Core Moderation Service

**File:** `lib/moderation/content-moderation.ts`

**Functions:**
- `moderateContent()` - Main moderation function
- `sanitizeContent()` - Clean and sanitize text
- `checkRateLimit()` - Prevent spam/abuse
- `containsBlockedWords()` - Check for blocked words
- `checkCulturalSensitivity()` - Flag sensitive content

### Blocked Categories

1. **Profanity** (English, French, Darija)
2. **Hate Speech** (discrimination, racism, etc.)
3. **Violence** (threats, attacks, etc.)
4. **Illegal Activities** (drugs, etc.)
5. **Sexual Content** (inappropriate for platform)
6. **Scams** (fraud, pyramid schemes, etc.)

### Cultural Sensitivity

- **Religious References:** Flagged for context review (not blocked)
- **Political Content:** Flagged for review (not blocked)
- **Positive Patterns:** Encouraged (innovation, business, etc.)

---

## Integration Points

### 1. Voice Components

**Files:**
- `components/submission/SimpleVoiceSubmit.tsx`
- `components/mentor/VoiceMentorSearch.tsx`

**Features:**
- Real-time moderation during transcription
- Blocks inappropriate content immediately
- Shows error messages
- Prevents submission

### 2. API Endpoints

**Files:**
- `app/api/ideas/route.ts` - Idea submission
- `app/api/moderation/check/route.ts` - Public moderation check

**Features:**
- Content moderation before saving
- Rate limiting
- Content sanitization
- Detailed error responses

### 3. Wrapper Component

**File:** `components/moderation/ContentModerationWrapper.tsx`

**Usage:**
```tsx
<ContentModerationWrapper>
  {({ value, onChange }) => (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} />
  )}
</ContentModerationWrapper>
```

---

## Moderation Result

```typescript
interface ModerationResult {
  allowed: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  flaggedWords?: string[];
  suggestions?: string[];
}
```

### Severity Levels

- **low:** Cultural sensitivity flags (review recommended)
- **medium:** Quality issues, spam detection
- **high:** Blocked words detected
- **critical:** Severe violations (hate speech, threats)

---

## Rate Limiting

**Default Limits:**
- 10 requests per minute per IP/user
- Prevents spam and abuse
- Returns 429 status when exceeded

**Implementation:**
```typescript
const rateLimit = checkRateLimit(userId, 10, 60000);
if (!rateLimit.allowed) {
  return error('Too many requests');
}
```

---

## Content Sanitization

**Removes:**
- Excessive whitespace
- Excessive punctuation
- Script injection attempts
- Potentially harmful HTML

**Preserves:**
- Content meaning
- Legitimate punctuation
- Normal formatting

---

## User Messages

### Blocked Content
```
⚠️ Contenu bloqué
[Reason]
Veuillez reformuler votre message en respectant les normes de la communauté.
```

### Flagged Content
```
⚠️ Contenu signalé pour révision
[Reason]
Mots détectés: [words]
```

### Success
```
✅ Contenu conforme
```

---

## API Endpoints

### Check Content
```
POST /api/moderation/check
{
  "text": "Content to check",
  "type": "voice" | "text" | "idea" | "comment",
  "strict": true | false
}

Response:
{
  "allowed": true | false,
  "reason": "...",
  "severity": "low" | "medium" | "high" | "critical",
  "flaggedWords": [...],
  "suggestions": [...],
  "sanitized": "..." // if sanitization changed content
}
```

---

## Blocked Words List

### Profanity
- English: fuck, shit, damn, bitch, asshole, bastard
- French: merde, putain, salope, connard, enculé
- Darija: kess, zbel, 7mar, kelb

### Hate Speech
- nazi, hitler, terrorist, jihad, islamist
- antisemitic, racist, sexist

### Violence
- kill, murder, bomb, attack, violence
- tuer, assassiner, bombe, attaque

### Illegal Activities
- drugs, cocaine, heroin, marijuana, cannabis
- drogue, cocaïne, haschich

### Sexual Content
- porn, sex, xxx, nude, naked
- porno, sexe, nu

### Scams
- scam, fraud, pyramid, ponzi, get rich quick
- arnaque, fraude, pyramide

---

## Cultural Norms

### Respected:
- ✅ Traditional Moroccan values
- ✅ Islamic cultural context
- ✅ Professional language
- ✅ Respectful communication
- ✅ Positive entrepreneurship content

### Flagged for Review:
- Religious references (context-dependent)
- Political content (context-dependent)

### Encouraged:
- Innovation, entrepreneurship
- Business solutions
- Community support
- Morocco development

---

## Testing

### Test Cases:

1. **Profanity Test:**
   - Input: "This is a test with bad words"
   - Expected: Blocked with high severity

2. **Violence Test:**
   - Input: "I want to attack..."
   - Expected: Blocked with high severity

3. **Spam Test:**
   - Input: Repeated same word 50 times
   - Expected: Blocked with medium severity

4. **Cultural Sensitivity:**
   - Input: "Allah help me..."
   - Expected: Flagged (not blocked) in normal mode, blocked in strict mode

5. **Positive Content:**
   - Input: "I want to start a business in Morocco"
   - Expected: Allowed

---

## Future Enhancements

1. **Machine Learning:**
   - Train model on Moroccan content
   - Context-aware moderation
   - Better false positive reduction

2. **Admin Dashboard:**
   - View flagged content
   - Manual review queue
   - Moderation statistics

3. **User Reporting:**
   - Report inappropriate content
   - Community moderation
   - Trust scores

4. **Advanced Filtering:**
   - Image content moderation
   - Audio content analysis
   - Video content screening

---

## Summary

**Problem:** Users could abuse the system with inappropriate content in voice recordings and text inputs.

**Solution:**
- ✅ Comprehensive word/phrase filtering
- ✅ Real-time moderation in voice components
- ✅ API-level protection
- ✅ Rate limiting
- ✅ Cultural sensitivity
- ✅ Clear user feedback

**Result:**
- System is protected from abuse
- Traditional norms respected
- Clear feedback for users
- Ready for production use

**Status:** ✅ **IMPLEMENTED AND READY**

