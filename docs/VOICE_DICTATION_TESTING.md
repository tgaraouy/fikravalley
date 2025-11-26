# 🎤 Voice Dictation Testing Guide

## Overview

The test pages now support **voice dictation** with **near real-time agent processing**. Speak your ideas instead of typing, and agents process automatically as you speak.

## 🎯 Features

### ✅ Voice Dictation
- **Browser-based speech-to-text** (Web Speech API)
- **Multi-language support**: French, Darija (Arabic), English
- **Live transcription**: See text appear as you speak
- **Continuous listening**: Keeps listening until you stop

### ✅ Real-Time Agent Processing
- **Auto-process mode**: Agents run automatically as you speak
- **Debounced processing**: Waits 2 seconds after speech stops
- **Near real-time**: Results appear within 2-3 seconds of speaking

## 🚀 How to Use

### Step 1: Open Test Page

```
http://localhost:3000/test-agent-1
```
or
```
http://localhost:3000/test-agents
```

### Step 2: Enable Voice Dictation

1. **Find the "Speaker Quote" field**
2. **Click "🎤 Start Dictation"** button
3. **Allow microphone permission** when prompted
4. **Start speaking** your idea

### Step 3: Enable Auto-Processing (Optional)

1. **Check "Auto-process (real-time)"** checkbox
2. **Continue speaking**
3. **Agent processes automatically** 2 seconds after you stop speaking

### Step 4: View Results

- **Live transcription** appears in text field
- **Agent results** appear automatically (if auto-process enabled)
- **Or click "Test Agent"** manually after speaking

## 🎙️ Voice Dictation Controls

### Start Dictation
- Click **"🎤 Start Dictation"** button
- Red pulsing dot appears: "Listening... Speak now"
- Text field updates in real-time as you speak

### Stop Dictation
- Click **"⏹️ Stop Dictation"** button
- Transcription stops
- Final text remains in field

### Auto-Process Mode
- **Enabled**: Agent runs automatically 2 seconds after speech stops
- **Disabled**: Manual "Test Agent" button required
- **Best for**: Real-time testing and demonstrations

## 🌍 Language Support

### Supported Languages

The Web Speech API supports:
- **French** (`fr-FR`) - Default
- **Arabic** (`ar-MA`) - For Darija
- **English** (`en-US`)
- **Tamazight** (may need custom setup)

### Change Language

Currently set to `fr-FR`. To change:

1. Edit `app/test-agent-1/page.tsx`
2. Find: `recognition.lang = 'fr-FR';`
3. Change to: `recognition.lang = 'ar-MA';` (for Darija)

## ⚡ Real-Time Processing Flow

```
User Speaks
    ↓
Web Speech API transcribes
    ↓
Text appears in field (live)
    ↓
[If auto-process enabled]
    ↓
Wait 2 seconds (debounce)
    ↓
Auto-trigger Agent 1
    ↓
Results appear automatically
```

## 📋 Testing Scenarios

### Scenario 1: Voice Dictation Only

1. Click "🎤 Start Dictation"
2. Speak: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس"
3. Click "⏹️ Stop Dictation"
4. Click "🚀 Test Agent 1" manually
5. View results

### Scenario 2: Real-Time Auto-Processing

1. Check "Auto-process (real-time)"
2. Click "🎤 Start Dictation"
3. Speak: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط"
4. **Stop speaking** (wait 2 seconds)
5. **Agent processes automatically**
6. Results appear without clicking button

### Scenario 3: Continuous Conversation

1. Enable auto-process
2. Start dictation
3. Speak multiple sentences
4. Pause between sentences
5. Each pause triggers processing
6. See incremental results

## 🎯 Best Practices

### For Best Results

1. **Speak clearly** and at moderate pace
2. **Use quiet environment** (reduces errors)
3. **Pause between sentences** (helps transcription)
4. **Check transcription** before processing
5. **Use Chrome/Edge** (best Web Speech API support)

### Browser Compatibility

- ✅ **Chrome/Edge**: Full support
- ✅ **Safari**: Good support
- ⚠️ **Firefox**: Limited support (may need fallback)
- ❌ **Mobile browsers**: Varies by device

## 🔧 Troubleshooting

### Microphone Not Working

1. **Check browser permissions**: Settings → Privacy → Microphone
2. **Use HTTPS**: Web Speech API requires secure context
3. **Try different browser**: Chrome/Edge recommended
4. **Check system microphone**: Ensure it's not muted

### Transcription Not Appearing

1. **Check microphone permission**: Browser should show permission prompt
2. **Verify browser support**: Use Chrome or Edge
3. **Check console errors**: Open DevTools → Console
4. **Try manual typing**: Verify form works without voice

### Auto-Process Not Triggering

1. **Verify checkbox is checked**: "Auto-process (real-time)"
2. **Wait 2 seconds**: Processing is debounced
3. **Check text length**: Minimum 20 characters required
4. **Check console**: Look for errors

### Poor Transcription Quality

1. **Speak clearly**: Enunciate words
2. **Reduce background noise**: Use quiet environment
3. **Speak closer to microphone**: Better audio quality
4. **Try different language**: Some languages transcribe better

## 🎨 UI Features

### Visual Indicators

- **🎤 Start Dictation**: Green/outline button
- **⏹️ Stop Dictation**: Red button
- **Pulsing red dot**: "Listening... Speak now"
- **Auto-process checkbox**: Enable/disable real-time processing

### Real-Time Feedback

- **Live transcription**: Text appears as you speak
- **Interim results**: Gray text (not final)
- **Final results**: Black text (confirmed)
- **Auto-processing**: Results appear automatically

## 📊 Performance

### Processing Times

- **Transcription**: Instant (browser-based)
- **Agent processing**: 2-5 seconds (API call)
- **Total latency**: 2-7 seconds from speech to results

### Optimization Tips

1. **Debounce delay**: 2 seconds (adjustable)
2. **Minimum text length**: 20 characters (prevents premature processing)
3. **Continuous mode**: Keeps listening until stopped
4. **Interim results**: Shows live transcription

## 🔄 Integration with Other Agents

Currently, voice dictation is available for:
- ✅ **Agent 1**: Full support with auto-processing

Future enhancements:
- Agent 2A/2B: Voice input for idea analysis
- Agent 5: Voice search for mentors
- All agents: Voice-enabled interfaces

## 📚 Code Reference

### Key Files

- `app/test-agent-1/page.tsx` - Agent 1 test page with voice
- `app/test-agents/page.tsx` - Unified dashboard with voice
- `components/VoiceRecorder.tsx` - Reusable voice component

### Key Functions

- `startDictation()` - Start speech recognition
- `stopDictation()` - Stop speech recognition
- `handleTest()` - Process agent (auto or manual)

---

## 🚀 Quick Start

1. **Open**: `http://localhost:3000/test-agent-1`
2. **Click**: "🎤 Start Dictation"
3. **Allow**: Microphone permission
4. **Speak**: Your idea in Darija/French/English
5. **Watch**: Text appears and agent processes automatically!

**Happy voice testing! 🎤**

