# 🚀 Integration Guide: Multi-Language Search System

Complete guide for integrating the multi-language search system into your Marrai Ideas Database pages.

---

## 📋 Table of Contents

1. [Quick Integration](#quick-integration)
2. [Ideas List Page](#ideas-list-page)
3. [Dashboard Page](#dashboard-page)
4. [Admin Panel](#admin-panel)
5. [Mobile Integration](#mobile-integration)
6. [API Endpoints](#api-endpoints)
7. [Advanced Customization](#advanced-customization)

---

## 🎯 Quick Integration

### Step 1: Import the Component

```typescript
import { MultiLanguageSearch } from '@/components/search/MultiLanguageSearch';
```

### Step 2: Add to Your Page

```typescript
'use client';

import { useState, useEffect } from 'react';
import { MultiLanguageSearch } from '@/components/search/MultiLanguageSearch';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);

  // Fetch ideas
  useEffect(() => {
    async function fetchIdeas() {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      setIdeas(data.ideas || []);
    }
    fetchIdeas();
  }, []);

  return (
    <div className="container mx-auto p-6">
      {/* Search Component */}
      <MultiLanguageSearch
        ideas={ideas}
        onResultClick={(idea) => {
          setSelectedIdea(idea);
          // Or navigate to idea page
          window.location.href = `/ideas/${idea.id}`;
        }}
      />

      {/* Your existing content */}
      <div className="mt-8">
        {/* ... */}
      </div>
    </div>
  );
}
```

### Step 3: Done! ✅

That's it! You now have multi-language search with auto-suggestions.

---

## 📄 Ideas List Page

### Full Integration Example

```typescript
// app/ideas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { MultiLanguageSearch } from '@/components/search/MultiLanguageSearch';
import { useRouter } from 'next/navigation';
import { IdeaCard } from '@/components/IdeaCard';

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [searchResults, setSearchResults] = useState(null);

  // Fetch all ideas
  useEffect(() => {
    async function fetchIdeas() {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      setIdeas(data.ideas || []);
      setFilteredIdeas(data.ideas || []);
    }
    fetchIdeas();
  }, []);

  // Handle search result selection
  const handleResultClick = (idea: any) => {
    router.push(`/ideas/${idea.id}`);
  };

  // Option 1: Navigate on click
  // Option 2: Filter displayed ideas
  const handleSearchChange = (results: any[]) => {
    if (results.length > 0) {
      setFilteredIdeas(results.map(r => r.idea));
    } else {
      setFilteredIdeas(ideas);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-4">💡 Ideas Database</h1>
          
          {/* Search */}
          <MultiLanguageSearch
            ideas={ideas}
            onResultClick={handleResultClick}
            placeholder="🔍 Search ideas in any language..."
          />
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-6 text-gray-600">
          Showing {filteredIdeas.length} of {ideas.length} ideas
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>

        {/* Empty State */}
        {filteredIdeas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No ideas found</h3>
            <p className="text-gray-500">Try adjusting your search</p>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 📊 Dashboard Page

### Integration with Filters

```typescript
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { MultiLanguageSearch } from '@/components/search/MultiLanguageSearch';
import { useSearch } from '@/hooks/useSearch';

export default function DashboardPage() {
  const [ideas, setIdeas] = useState([]);
  const [filters, setFilters] = useState({
    status: [],
    category: null,
    location: null
  });

  // Custom search with filters
  const {
    query,
    setQuery,
    results,
    hasResults
  } = useSearch(ideas, {
    minQueryLength: 2,
    autoSuggest: true
  });

  // Apply both search and filters
  const displayedIdeas = hasResults
    ? results.map(r => r.idea).filter(applyFilters)
    : ideas.filter(applyFilters);

  function applyFilters(idea: any) {
    if (filters.status.length > 0 && !filters.status.includes(idea.status)) {
      return false;
    }
    if (filters.category && idea.category !== filters.category) {
      return false;
    }
    if (filters.location && idea.location !== filters.location) {
      return false;
    }
    return true;
  }

  return (
    <div className="dashboard">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search in any language..."
          className="w-full px-4 py-3 border rounded-lg"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        {/* Status Filter */}
        <select
          value={filters.status[0] || ''}
          onChange={(e) => setFilters({ ...filters, status: [e.target.value] })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Categories</option>
          <option value="Santé">Santé</option>
          <option value="Éducation">Éducation</option>
          <option value="Agriculture">Agriculture</option>
        </select>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedIdeas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}
```

---

## 👨‍💼 Admin Panel

### Admin Search with Bulk Actions

```typescript
// app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@/hooks/useSearch';

export default function AdminDashboard() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    query,
    setQuery,
    results,
    hasResults,
    language,
    resultCount,
    searchTime
  } = useSearch(ideas);

  const displayedIdeas = hasResults ? results.map(r => r.idea) : ideas;

  // Bulk actions
  const handleBulkApprove = async () => {
    await fetch('/api/admin/ideas/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'approve',
        idea_ids: selectedIds
      })
    });
    // Refresh
  };

  return (
    <div className="admin-dashboard">
      {/* Admin Search Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Admin: Ideas Management</h1>
          
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div className="px-4 py-2 bg-blue-50 rounded">
              <span className="font-semibold">{ideas.length}</span> Total
            </div>
            {hasResults && (
              <div className="px-4 py-2 bg-green-50 rounded">
                <span className="font-semibold">{resultCount}</span> Found
                <span className="text-gray-500 ml-2">({searchTime.toFixed(1)}ms)</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Admin search: ID, title, email, status..."
            className="w-full px-6 py-3 border-2 rounded-lg text-lg"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              ✕
            </button>
          )}
        </div>

        {/* Language Detection */}
        {query && (
          <div className="mt-2 text-sm text-gray-600">
            Searching in: <span className="font-semibold">{language}</span>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-yellow-50 border-b p-4 flex items-center justify-between">
          <span>{selectedIds.length} selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              ✓ Approve Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-4">
              <input
                type="checkbox"
                checked={selectedIds.length === displayedIdeas.length}
                onChange={(e) => {
                  setSelectedIds(
                    e.target.checked
                      ? displayedIdeas.map(i => i.id)
                      : []
                  );
                }}
              />
            </th>
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Title</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Score</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedIdeas.map((idea) => (
            <tr key={idea.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(idea.id)}
                  onChange={(e) => {
                    setSelectedIds(
                      e.target.checked
                        ? [...selectedIds, idea.id]
                        : selectedIds.filter(id => id !== idea.id)
                    );
                  }}
                />
              </td>
              <td className="p-4 font-mono text-xs">{idea.id.slice(0, 8)}</td>
              <td className="p-4">{idea.title}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs ${
                  idea.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {idea.status}
                </span>
              </td>
              <td className="p-4">{idea.total_score || 0}</td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 📱 Mobile Integration

### With Bottom Sheet

```typescript
// components/mobile/MobileSearch.tsx
'use client';

import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileSearch({ ideas }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    query,
    setQuery,
    results,
    suggestions,
    clearSearch
  } = useSearch(ideas);

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-3 bg-white rounded-lg shadow flex items-center gap-3"
      >
        <span>🔍</span>
        <span className="text-gray-500">Search ideas...</span>
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white p-4 border-b">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="🔍 Search..."
                  className="w-full px-4 py-3 border rounded-lg"
                  autoFocus
                />
              </div>

              {/* Results */}
              <div className="p-4">
                {results.map((result) => (
                  <button
                    key={result.idea.id}
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = `/ideas/${result.idea.id}`;
                    }}
                    className="w-full text-left p-4 border-b"
                  >
                    <h3 className="font-bold">{result.idea.title}</h3>
                    <p className="text-sm text-gray-600">
                      Score: {result.score.toFixed(1)}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## 🌐 API Endpoints

### Create Search API

```typescript
// app/api/ideas/search/route.ts
import { NextResponse } from 'next/server';
import { searchIdeas } from '@/lib/search/searchEngine';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('limit') || '50');
    const minScore = parseFloat(searchParams.get('min_score') || '0');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters'
      }, { status: 400 });
    }

    // Fetch ideas from database
    const supabase = await createClient();
    const { data: ideas, error } = await supabase
      .from('marrai_ideas')
      .select('*')
      .eq('status', 'approved');

    if (error) throw error;

    // Perform search
    const results = searchIdeas(ideas || [], query, {
      maxResults,
      minScore,
      fuzzyThreshold: 2,
      includePartialMatches: true
    });

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results: results.map(r => ({
        idea: r.idea,
        score: r.score,
        matchedFields: r.matchedFields,
        language: r.language
      }))
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

### Use API from Client

```typescript
// Client-side usage
async function performSearch(query: string) {
  const res = await fetch(`/api/ideas/search?q=${encodeURIComponent(query)}&limit=20`);
  const data = await res.json();
  
  if (data.success) {
    console.log(`Found ${data.count} results for "${data.query}"`);
    return data.results;
  } else {
    console.error('Search failed:', data.error);
    return [];
  }
}
```

---

## 🎨 Advanced Customization

### Custom Styles

```typescript
<MultiLanguageSearch
  ideas={ideas}
  onResultClick={handleClick}
  className="my-custom-search"
  placeholder="Custom placeholder..."
/>
```

```css
/* styles/search.css */
.my-custom-search input {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.my-custom-search input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}
```

### Custom Result Rendering

```typescript
import { useSearch } from '@/hooks/useSearch';

function CustomSearch({ ideas }: any) {
  const { query, setQuery, results } = useSearch(ideas);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      
      {/* Custom Results */}
      <div className="custom-results">
        {results.map((result) => (
          <div key={result.idea.id} className="custom-result-card">
            {/* Your custom design */}
            <img src={result.idea.image_url} />
            <h3>{result.idea.title}</h3>
            <div className="custom-score">
              {result.score > 100 && '🔥'}
              {result.score.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Checklist

- [ ] Import `MultiLanguageSearch` or `useSearch` hook
- [ ] Pass ideas array as prop
- [ ] Handle `onResultClick` event
- [ ] Test with French, Darija, Arabic, English queries
- [ ] Test typos and fuzzy matching
- [ ] Test cross-language keywords
- [ ] Add loading states
- [ ] Add empty states
- [ ] Style to match your design
- [ ] Test on mobile devices

---

## 🎓 Tips

1. **Performance:** For large datasets (1000+ ideas), consider server-side search with the API endpoint
2. **Caching:** Cache search results for repeated queries
3. **Analytics:** Track popular search terms to improve keyword mappings
4. **A/B Testing:** Test different debounce delays and min query lengths
5. **Accessibility:** Ensure keyboard navigation works (↑/↓/Enter/Esc)

---

## 🐛 Common Issues

### Issue: Search is slow
**Solution:** Increase `debounceMs` or reduce `maxResults`

### Issue: No suggestions appearing
**Solution:** Check `autoSuggest: true` and `minQueryLength`

### Issue: Cross-language not working
**Solution:** Verify keyword mappings in `searchUtils.ts`

### Issue: Mobile keyboard covering results
**Solution:** Adjust `max-h-[90vh]` or use `useIsMobile` hook

---

**Happy Searching! 🎉**

