# Darija NLP Engine

Comprehensive natural language processing engine for Moroccan Darija with code-switching support.

## Features

### 1. Keyword Detection
- **Pain Words**: Detects expressions of frustration and problems
- **Frequency**: Identifies temporal frequency indicators
- **Willingness**: Detects willingness to pay/act
- **Negation**: Finds negation patterns

### 2. Number Parsing
- **Arabic Numerals**: ٠, ١, ٢, ٣, etc.
- **Darija Words**: "wa7d", "joj", "tlata", "miya", "alf"
- **French Numbers**: "un", "deux", "trois", "cent", "mille"
- **Mixed Formats**: "3 miliون", "200 ألف"

### 3. Sentiment Analysis
- **Positive**: "mizyan", "zwwin", "7asan"
- **Negative**: "khayb", "ma-kaynsh"
- **Frustrated**: "gal3a", "telbara", "s7ab"
- **Neutral**: Default when no strong indicators

### 4. Entity Extraction
- **Locations**: Moroccan cities and regions
- **Organizations**: Ministries, hospitals, schools
- **People**: Names and roles
- **Amounts**: Money (MAD/EUR), time, quantities

### 5. Intent Detection
- **Problem Description**: User describing a problem
- **Solution Proposal**: User proposing a solution
- **Question**: User asking a question
- **Complaint**: User complaining
- **Request**: User requesting help
- **Feedback**: User providing feedback

### 6. Code-Switching Detection
- Identifies language switches within text
- Tracks Darija-French-Arabic mixing
- Provides position information for each segment

## Usage

### Basic Analysis

```typescript
import { analyzeDarijaText } from '@/lib/nlp';

const text = 'Gal3a rasi, kaykhdaw bzaf dyal wa9t bach y7alou l-mochkil';
const analysis = analyzeDarijaText(text);

console.log(analysis.sentiment); // 'frustrated'
console.log(analysis.keywords.pain); // ['gal3a rasi', 'mochkil']
console.log(analysis.intent); // 'problem_description'
```

### Extract Keywords

```typescript
import { extractKeywords } from '@/lib/nlp';

const keywords = extractKeywords('Khlass dfa3 50 dh kol shahar');
console.log(keywords.willingness); // ['khlass', 'dfa3']
```

### Parse Numbers

```typescript
import { parseNumbers } from '@/lib/nlp';

const numbers = parseNumbers('juj tlata rb3a khamsa miya');
// Returns: [
//   { value: 2, original: 'juj', type: 'darija_word' },
//   { value: 3, original: 'tlata', type: 'darija_word' },
//   { value: 100, original: 'miya', type: 'darija_word' }
// ]
```

### Extract Entities

```typescript
import { extractEntities } from '@/lib/nlp';

const entities = extractEntities('L-fellahin f Casablanca kaykhdaw bzaf');
console.log(entities.locations); // ['casablanca']
```

### Batch Processing

```typescript
import { batchAnalyzeDarijaTexts, getAnalysisSummary } from '@/lib/nlp';

const texts = [
  'Gal3a rasi, mochkil bzaf',
  'Mizyan bzaf, had l-idea zwina',
  'Khlass dfa3 50 dh',
];

const analyses = batchAnalyzeDarijaTexts(texts);
const summary = getAnalysisSummary(analyses);

console.log(summary.sentimentDistribution);
console.log(summary.mostCommonKeywords);
```

## Language Support

### Darija
- Full support for Moroccan Arabic dialect
- Handles common expressions and idioms
- Recognizes Darija-specific number words

### French
- Detects French words and phrases
- Parses French numbers
- Identifies French code-switching

### Arabic
- Supports Modern Standard Arabic
- Recognizes Arabic numerals (٠-٩)
- Handles Arabic script

### Mixed
- Detects code-switching between languages
- Provides language boundaries
- Maintains context across switches

## Examples

### Problem Description
```typescript
const text = 'Gal3a rasi, l-fellahin kaykhdaw bzaf dyal wa9t bach y7alou l-mochkil dyal l-m7asla';
const analysis = analyzeDarijaText(text);
// Intent: 'problem_description'
// Sentiment: 'frustrated'
// Keywords: { pain: ['gal3a rasi', 'mochkil'], frequency: ['bzaf'], ... }
```

### Willingness to Pay
```typescript
const text = 'Khlass dfa3 50 dh kol shahar bach y7al had l-mochkil';
const analysis = analyzeDarijaText(text);
// Keywords: { willingness: ['khlass', 'dfa3'], ... }
// Numbers: [{ value: 50, type: 'arabic_numeral' }]
// Entities: { amounts: { money: [{ value: 50, currency: 'MAD' }] } }
```

### Code-Switching
```typescript
const text = 'Le problème c\'est que kaykhdaw bzaf dyal temps';
const analysis = analyzeDarijaText(text);
// Language: 'mixed'
// CodeSwitching: [
//   { text: 'Le problème c\'est que', language: 'french', start: 0, end: 4 },
//   { text: 'kaykhdaw bzaf dyal temps', language: 'darija', start: 5, end: 8 }
// ]
```

## Integration

The NLP engine is used by:
- **WhatsApp Handler**: Processes incoming messages
- **Self-Ask Chain**: Extracts structured data from responses
- **Idea Scoring**: Analyzes problem statements
- **Feedback System**: Detects sentiment and issues

## Future Enhancements

- Integration with HuggingFace Darija models
- Named Entity Recognition (NER) models
- Sentiment analysis models
- Machine translation support
- Spell correction for Darija

