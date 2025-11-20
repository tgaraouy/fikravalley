# 🔍 Multi-Language Search System

Comprehensive search engine for the Marrai Ideas Database with support for **French**, **Darija** (Latin script), **Arabic**, and **English**.

---

## ✨ Features

### 🌍 Multi-Language Support
- **French:** Full text search with diacritic normalization (é → e)
- **Darija:** Transliteration support (sseha, t3lim, etc.)
- **Arabic:** Right-to-left text with character normalization
- **English:** Standard text search

### 🎯 Smart Matching
- **Exact Match:** Direct string matching
- **Fuzzy Match:** Handles typos (Levenshtein distance ≤ 2)
- **Partial Match:** Finds words within text
- **Keyword Match:** Cross-language semantic search

### 🏆 Intelligent Ranking
- Title matches (highest weight)
- Description/solution matches
- Category/location matches
- Tag matches
- Boost by idea quality (score, receipts, likes)
- Position-based ranking

### 💡 Auto-Suggestions
- Real-time query suggestions
- Keyboard navigation (↑/↓/Enter/Esc)
- Maximum 5 suggestions by default
- Learns from existing content

---

## 📦 Installation

The search system is already integrated. No additional installation needed.

---

## 🚀 Quick Start

### Basic Usage (React Hook)

```typescript
import { useSearch } from '@/hooks/useSearch';

function SearchComponent({ ideas }) {
  const {
    query,
    setQuery,
    results,
    isSearching,
    hasResults,
    suggestions,
    language,
    searchTime
  } = useSearch(ideas);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search in any language..."
      />
      
      {isSearching && <div>Searching...</div>}
      
      {hasResults && (
        <div>
          <p>Found {results.length} ideas in {searchTime.toFixed(2)}ms</p>
          <p>Detected language: {language}</p>
          
          {results.map(result => (
            <div key={result.idea.id}>
              <h3>{result.idea.title}</h3>
              <p>Score: {result.score.toFixed(2)}</p>
              <p>Matched fields: {result.matchedFields.join(', ')}</p>
            </div>
          ))}
        </div>
      )}
      
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, i) => (
            <li key={i} onClick={() => setQuery(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Direct API Usage

```typescript
import { searchIdeas } from '@/lib/search/searchEngine';

// Basic search
const results = searchIdeas(ideas, 'santé');

// With options
const results = searchIdeas(ideas, 'health', {
  fuzzyThreshold: 2,        // Allow 2-character typos
  minScore: 10,             // Minimum relevance score
  maxResults: 20,           // Limit results
  includePartialMatches: true
});

// Access result data
results.forEach(result => {
  console.log(result.idea.title);        // Idea object
  console.log(result.score);             // Relevance score
  console.log(result.matches);           // Match details
  console.log(result.matchedFields);     // Fields that matched
  console.log(result.language);          // Detected language
});
```

---

## 🎓 Examples

### Example 1: French Search

```typescript
// Query: "santé"
const results = searchIdeas(ideas, 'santé');

// Finds:
// - Ideas with "santé" in title
// - Ideas with "santé" in description
// - Ideas in category "Santé"
// - Related: "médical", "hôpital", etc.
```

### Example 2: Darija Search

```typescript
// Query: "sseha"
const results = searchIdeas(ideas, 'sseha');

// Finds:
// - Ideas with "sseha" in Darija fields
// - Cross-language: Also finds "santé" (French)
// - Cross-language: Also finds "صحة" (Arabic)
```

### Example 3: Arabic Search

```typescript
// Query: "صحة"
const results = searchIdeas(ideas, 'صحة');

// Finds:
// - Ideas with "صحة" in Arabic fields
// - Normalized forms: "صِحّة", "صحه"
// - Cross-language matches
```

### Example 4: Typo Handling

```typescript
// Query: "helth" (typo)
const results = searchIdeas(ideas, 'helth');

// Finds:
// - "health" (fuzzy match)
// - "santé" (via keyword mapping)
// - Related health ideas
```

### Example 5: Multi-Term Search

```typescript
// Query: "application mobile santé"
const results = searchIdeas(ideas, 'application mobile santé');

// Finds:
// - Ideas matching all three terms (highest score)
// - Ideas matching two terms (medium score)
// - Ideas matching one term (lower score)
```

---

## 🔧 Configuration

### Hook Options

```typescript
useSearch(ideas, {
  debounceMs: 300,           // Debounce delay (ms)
  minQueryLength: 2,         // Minimum query length
  autoSuggest: true,         // Enable suggestions
  maxSuggestions: 5,         // Max suggestions
  fuzzyThreshold: 2,         // Fuzzy match tolerance
  minScore: 0,               // Minimum relevance score
  maxResults: 100,           // Maximum results
  includePartialMatches: true // Include partial matches
});
```

### Field Weights

Default weights for relevance scoring:

```typescript
{
  title: 100,               // Highest priority
  title_darija: 100,
  problem_statement: 50,
  problem_statement_darija: 50,
  proposed_solution: 40,
  proposed_solution_darija: 40,
  category: 30,
  location: 20,
  tags: 15
}
```

---

## 🗂️ Keyword Domains

### Health
- **FR:** santé, médical, hôpital, clinique
- **Darija:** sseha, sbitar, tbib
- **AR:** صحة, طب, مستشفى
- **EN:** health, medical, hospital

### Education
- **FR:** éducation, école, université
- **Darija:** t3lim, mdrasa, jami3a
- **AR:** تعليم, مدرسة, جامعة
- **EN:** education, school, university

### Agriculture
- **FR:** agriculture, ferme, agriculteur
- **Darija:** filaha, ferma, fallah
- **AR:** فلاحة, مزرعة, فلاح
- **EN:** agriculture, farm, farmer

### Technology
- **FR:** technologie, numérique, digital
- **Darija:** teknolojia, tech, internet
- **AR:** تكنولوجيا, تقنية, رقمي
- **EN:** technology, tech, digital

### Fintech
- **FR:** fintech, finance, banque
- **Darija:** banque, flous, drahim
- **AR:** تكنولوجيا مالية, بنك
- **EN:** fintech, finance, bank

*...and more (tourism, environment, social, food, e-commerce)*

---

## 🧪 Testing

```bash
# Run all search tests
npm test -- lib/search/__tests__/searchEngine.test.ts

# Run specific test suite
npm test -- -t "searchIdeas"

# Run with coverage
npm test -- --coverage lib/search
```

### Test Coverage

- ✅ Text normalization (French, Arabic, Darija)
- ✅ Fuzzy matching (Levenshtein distance)
- ✅ Language detection
- ✅ Keyword domain mapping
- ✅ Search with exact/fuzzy/partial/keyword matches
- ✅ Result ranking
- ✅ Suggestions generation
- ✅ Multi-language integration

---

## 📊 Performance

### Benchmarks (1000 ideas)

- **Simple query:** ~2-5ms
- **Complex query (3+ terms):** ~10-15ms
- **Fuzzy matching:** ~15-25ms
- **With suggestions:** ~20-30ms

### Optimization Tips

1. **Debounce user input** (default: 300ms)
2. **Limit maxResults** for large datasets
3. **Increase minScore** to filter low-relevance results
4. **Disable fuzzy matching** if not needed
5. **Cache normalized text** for repeated searches

---

## 🎯 Best Practices

### 1. User Input Handling

```typescript
// ✅ Good: Debounced with minimum length
const { query, setQuery } = useSearch(ideas, {
  debounceMs: 300,
  minQueryLength: 2
});

// ❌ Bad: No debounce, instant search on every keystroke
onChange={(e) => search(e.target.value)}
```

### 2. Display Results

```typescript
// ✅ Good: Show relevance and matched fields
<div>
  <h3>{result.idea.title}</h3>
  <small>Score: {result.score} | Matched: {result.matchedFields.join(', ')}</small>
</div>

// ❌ Bad: No context for user
<div>{result.idea.title}</div>
```

### 3. Empty States

```typescript
// ✅ Good: Clear feedback
{query && !isSearching && results.length === 0 && (
  <div>No results for "{query}". Try different keywords.</div>
)}

// ❌ Bad: Silent failure
{results.length === 0 ? null : <Results />}
```

### 4. Language Indicators

```typescript
// ✅ Good: Show detected language
<div>Searching in {languageNames[language]}</div>

// ❌ Bad: User doesn't know how their input is interpreted
```

---

## 🐛 Troubleshooting

### No Results Found

**Problem:** Search returns empty array

**Solutions:**
1. Check `minQueryLength` (default: 2 characters)
2. Verify ideas array is not empty
3. Lower `minScore` threshold
4. Check for typos in query
5. Try different language keywords

### Slow Performance

**Problem:** Search takes > 100ms

**Solutions:**
1. Increase `debounceMs`
2. Reduce `maxResults`
3. Disable fuzzy matching for large datasets
4. Filter ideas before searching
5. Implement pagination

### Wrong Language Detection

**Problem:** Query detected as wrong language

**Solutions:**
1. Use language-specific characters (é for French, 3 for Darija, ص for Arabic)
2. Add explicit language parameter
3. Update `detectLanguage()` logic
4. Use keyword mappings instead

### Missing Cross-Language Results

**Problem:** French query doesn't find Arabic ideas

**Solutions:**
1. Ensure keyword mappings are complete
2. Check if ideas have multiple language fields
3. Verify `findKeywordDomain()` returns correct domain
4. Add more keywords to mappings

---

## 🔄 API Reference

### `searchIdeas(ideas, query, options)`

Main search function.

**Parameters:**
- `ideas: Idea[]` - Array of ideas to search
- `query: string` - Search query
- `options: SearchOptions` - Optional configuration

**Returns:** `SearchResult[]`

### `generateSuggestions(ideas, partialQuery, maxSuggestions)`

Generate search suggestions.

**Parameters:**
- `ideas: Idea[]` - Array of ideas
- `partialQuery: string` - Partial query
- `maxSuggestions: number` - Max suggestions (default: 5)

**Returns:** `string[]`

### `normalizeText(text)`

Normalize text for searching.

**Parameters:**
- `text: string` - Text to normalize

**Returns:** `string`

### `detectLanguage(text)`

Detect language of text.

**Parameters:**
- `text: string` - Text to analyze

**Returns:** `'fr' | 'darija' | 'ar' | 'en'`

### `findKeywordDomain(query)`

Find keyword domain for query.

**Parameters:**
- `query: string` - Search query

**Returns:** `string | null`

---

## 🤝 Contributing

### Adding New Keywords

Edit `lib/search/searchUtils.ts`:

```typescript
export const keywordMappings = {
  // ... existing
  newDomain: {
    fr: ['mot1', 'mot2'],
    darija: ['kelma1', 'kelma2'],
    ar: ['كلمة١', 'كلمة٢'],
    en: ['word1', 'word2']
  }
};
```

### Adding New Languages

1. Update `detectLanguage()` in `searchUtils.ts`
2. Add normalization function if needed
3. Update keyword mappings
4. Add tests

---

## 📝 License

Part of Marrai Ideas Database.

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review test cases for examples
3. Open an issue on GitHub

---

**Happy Searching! 🎉**

