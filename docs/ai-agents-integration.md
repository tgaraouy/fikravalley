# AI Agents Integration Guide

This document explains how AI agents are integrated into the UI process to help users during idea submission.

## Overview

Three types of AI agents are integrated into the submission form:

1. **AI Agent Chat** - Interactive chat assistant (floating widget)
2. **AI Suggestion Agent** - Real-time suggestions as users type
3. **AI Analysis Agent** - Live analysis and scoring display

---

## 1. AI Agent Chat

**Component:** `components/ai/AIAgentChat.tsx`

**Location:** Floating widget in bottom-right corner of submission page

**Features:**
- Real-time chat with AI assistant
- Context-aware responses based on current step
- Suggestions and action items
- Minimizable/maximizable
- Bilingual support (French/Darija)

**API Endpoint:** `POST /api/ai/chat`

**Usage:**
```tsx
<AIAgentChat
  context={{
    step: currentStep,
    stepName: 'Problème',
    currentData: { problemStatement, ... },
    language: 'fr',
  }}
  onSuggestionApply={(suggestion) => {
    // Apply suggestion to form field
    setProblemStatement(suggestion);
  }}
  position="bottom-right"
/>
```

**User Experience:**
- Users can ask questions about the current step
- AI provides contextual help and suggestions
- Suggestions can be clicked to auto-fill form fields
- Chat history is maintained during session

---

## 2. AI Suggestion Agent

**Component:** `components/ai/AISuggestionAgent.tsx`

**Location:** Appears below form fields as users type

**Features:**
- Real-time suggestions as users type (debounced)
- Confidence scores for suggestions
- Accept/Ignore buttons
- Context-aware improvements
- Auto-dismisses after user interaction

**API Endpoint:** `POST /api/ai/suggest`

**Usage:**
```tsx
<div className="relative">
  <Textarea
    value={problemStatement}
    onChange={(e) => setProblemStatement(e.target.value)}
  />
  <AISuggestionAgent
    fieldName="problemStatement"
    currentValue={problemStatement}
    context={{ category, location }}
    onSuggestionAccept={setProblemStatement}
    language="fr"
    debounceMs={1500}
  />
</div>
```

**User Experience:**
- Suggestions appear after user types 30+ characters
- 1.5 second debounce to avoid excessive API calls
- Suggestions show confidence score
- Users can accept or dismiss suggestions
- Dismissed suggestions don't reappear for 10 seconds

---

## 3. AI Analysis Agent

**Component:** `components/ai/AIAnalysisAgent.tsx`

**Location:** Below form content, shows during steps 2-6

**Features:**
- Live scoring as users fill form
- Real-time clarity and decision scores
- Qualification tier display
- Strengths and weaknesses identification
- Next steps recommendations
- Progress indicators

**API Endpoint:** `POST /api/ai/analyze-live`

**Usage:**
```tsx
<AIAnalysisAgent
  formData={{
    problemStatement,
    asIsAnalysis,
    benefitStatement,
    operationalNeeds,
    category,
    location,
  }}
  language="fr"
  compact={false}
/>
```

**User Experience:**
- Updates automatically as form data changes
- 2 second debounce to avoid excessive calculations
- Shows scores, tiers, and actionable feedback
- Helps users understand what needs improvement
- Only appears when enough data is entered (50+ chars per field)

---

## Integration in Submission Form

**File:** `app/submit/page.tsx`

### Current Integration:

1. **AI Agent Chat** - Always visible (floating)
   ```tsx
   <AIAgentChat
     context={{ step, stepName, currentData, language }}
     onSuggestionApply={handleSuggestion}
     position="bottom-right"
   />
   ```

2. **AI Analysis Agent** - Visible during steps 2-6
   ```tsx
   {(currentStep >= 2 && currentStep <= 6) && (
     <AIAnalysisAgent
       formData={{ problemStatement, asIsAnalysis, ... }}
       language={language}
     />
   )}
   ```

3. **AI Suggestion Agent** - Can be added to individual step components
   ```tsx
   // In Step1Problem.tsx, Step2AsIs.tsx, etc.
   <div className="relative">
     <Textarea value={value} onChange={onChange} />
     <AISuggestionAgent
       fieldName="problemStatement"
       currentValue={value}
       onSuggestionAccept={onChange}
       language={language}
     />
   </div>
   ```

---

## API Endpoints

### POST /api/ai/chat

**Request:**
```json
{
  "message": "Comment améliorer mon problème?",
  "context": {
    "step": 1,
    "stepName": "Problème",
    "currentData": { "problemStatement": "..." },
    "language": "fr",
    "conversationHistory": [...]
  }
}
```

**Response:**
```json
{
  "response": "Pour améliorer votre problème, ajoutez des chiffres...",
  "suggestions": ["Ajoutez le nombre de personnes affectées", ...],
  "actionItems": ["Quantifiez le temps perdu", ...]
}
```

### POST /api/ai/suggest

**Request:**
```json
{
  "field": "problemStatement",
  "currentValue": "Les hôpitaux perdent du temps...",
  "context": { "category": "health" },
  "language": "fr"
}
```

**Response:**
```json
{
  "suggestion": "Les hôpitaux perdent en moyenne 2 heures par jour...",
  "reason": "Ajoutez des chiffres pour quantifier le problème",
  "confidence": 0.85
}
```

### POST /api/ai/analyze-live

**Request:**
```json
{
  "formData": {
    "problemStatement": "...",
    "asIsAnalysis": "...",
    "benefitStatement": "...",
    "operationalNeeds": "...",
    "category": "health",
    "location": "rabat"
  },
  "language": "fr"
}
```

**Response:**
```json
{
  "clarityScore": 7.5,
  "stage1Score": 30,
  "stage2Score": 18,
  "qualificationTier": "qualified",
  "strengths": ["Problème bien quantifié", ...],
  "weaknesses": ["Manque de détails sur le processus", ...],
  "nextSteps": ["1. Ajoutez plus de détails", ...],
  "isAnalyzing": false
}
```

---

## Configuration

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Debounce Settings

- **Suggestion Agent:** 1500ms (1.5 seconds)
- **Analysis Agent:** 2000ms (2 seconds)
- **Chat:** No debounce (immediate)

### Confidence Thresholds

- **Suggestion Agent:** Only shows suggestions with confidence ≥ 0.6
- **Analysis Agent:** Shows analysis when all fields have 50+ characters

---

## User Flow

1. **User starts submission** → AI Agent Chat appears (minimized)
2. **User types in Step 1** → AI Suggestion Agent appears after 30 chars
3. **User moves to Step 2** → AI Analysis Agent appears, shows live scores
4. **User asks question** → Opens AI Agent Chat, gets contextual help
5. **User accepts suggestion** → Form field auto-fills
6. **User continues** → Analysis updates in real-time
7. **User reaches Step 7** → Final review with all AI insights

---

## Customization

### Change Agent Position

```tsx
<AIAgentChat position="bottom-left" /> // or "top-right"
```

### Adjust Debounce Times

```tsx
<AISuggestionAgent debounceMs={2000} /> // 2 seconds
```

### Customize Language

```tsx
<AIAgentChat language="darija" />
<AISuggestionAgent language="darija" />
<AIAnalysisAgent language="darija" />
```

### Compact Mode

```tsx
<AIAnalysisAgent compact={true} /> // Shows only score badge
```

---

## Troubleshooting

### Agents Not Appearing

1. Check `ANTHROPIC_API_KEY` is set
2. Check API endpoints are accessible
3. Check browser console for errors
4. Verify form data meets minimum requirements

### Suggestions Not Showing

1. Ensure field has 30+ characters
2. Check confidence threshold (≥0.6)
3. Verify API response is successful
4. Check if suggestion was dismissed

### Analysis Not Updating

1. Ensure all required fields have 50+ characters
2. Check debounce timer (2 seconds)
3. Verify scoring function is working
4. Check API response format

---

## Future Enhancements

- [ ] Voice input for chat
- [ ] Multi-language support (Arabic)
- [ ] Agent personality customization
- [ ] Learning from user feedback
- [ ] Proactive suggestions (not just reactive)
- [ ] Integration with similar ideas search
- [ ] Real-time collaboration with other users

---

## Best Practices

1. **Debounce API calls** - Avoid excessive requests
2. **Show loading states** - Let users know AI is working
3. **Provide fallbacks** - Handle API failures gracefully
4. **Respect user choices** - Don't force suggestions
5. **Maintain context** - Keep conversation history
6. **Optimize performance** - Cache responses when possible
7. **Test thoroughly** - Validate all agent interactions

