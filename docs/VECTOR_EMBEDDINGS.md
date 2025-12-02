# Vector Embeddings for Idea Similarity

## Overview

This system uses OpenAI's `text-embedding-3-small` model to generate vector embeddings for ideas, enabling semantic similarity search. Similar ideas can be found based on their semantic meaning, not just keyword matching.

## Architecture

### Database (PostgreSQL + pgvector)

- **Extension**: `pgvector` for vector similarity search
- **Column**: `marrai_ideas.embedding` (vector(1536))
- **Index**: HNSW index for fast approximate nearest neighbor search
- **Function**: `find_similar_ideas()` for cosine similarity queries

### Embedding Model

- **Model**: `text-embedding-3-small` (OpenAI)
- **Dimensions**: 1536
- **Input**: Title + Problem Statement + Proposed Solution + Category
- **Cost**: ~$0.02 per 1M tokens (very affordable)

## Usage

### 1. Enable pgvector Extension

Run the migration in Supabase SQL Editor:

```sql
-- Run: supabase/migrations/013_add_vector_embeddings.sql
```

This will:
- Enable `pgvector` extension
- Add `embedding` column to `marrai_ideas`
- Create HNSW index for fast similarity search
- Create `find_similar_ideas()` function

### 2. Generate Embedding for a Single Idea

**API Endpoint:**
```bash
POST /api/ideas/[id]/embedding
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/ideas/abc123/embedding
```

**Response:**
```json
{
  "success": true,
  "ideaId": "abc123",
  "embeddingDimensions": 1536
}
```

### 3. Find Similar Ideas

**API Endpoint:**
```bash
GET /api/ideas/[id]/similar?limit=5&threshold=0.7
```

**Parameters:**
- `limit` (default: 5): Maximum number of similar ideas to return
- `threshold` (default: 0.7): Minimum similarity score (0-1)

**Example:**
```bash
curl http://localhost:3000/api/ideas/abc123/similar?limit=5&threshold=0.7
```

**Response:**
```json
{
  "items": [
    {
      "id": "def456",
      "title": "Similar Idea Title",
      "problem_statement": "...",
      "proposed_solution": "...",
      "similarity": 0.85
    }
  ],
  "count": 1
}
```

### 4. Generate Embeddings for All Ideas (Bulk)

**Script:**
```bash
npm run generate:embeddings
```

This will:
- Fetch all ideas without embeddings
- Generate embeddings in batches of 10
- Save progress to `scripts/embedding-progress.json`
- Resume from where it left off if interrupted

**Progress Tracking:**
- Progress saved to `scripts/embedding-progress.json`
- Can be safely interrupted and resumed
- Skips ideas that already have embeddings

## Implementation Details

### Embedding Generation

The embedding is generated from:
```
Title + Problem Statement + Proposed Solution + Category
```

This ensures semantic similarity captures:
- What problem the idea solves
- How it solves it
- What domain it belongs to

### Similarity Calculation

Uses **cosine similarity** (1 - cosine distance):
- Range: 0 to 1
- 1.0 = Identical meaning
- 0.7+ = Very similar
- 0.5-0.7 = Somewhat similar
- <0.5 = Not similar

### Performance

- **HNSW Index**: Fast approximate nearest neighbor search
- **Query Time**: <100ms for similarity search
- **Storage**: ~6KB per embedding (1536 floats × 4 bytes)

## API Integration

### Generate Embedding (On-Demand)

```typescript
import { generateIdeaEmbedding } from '@/lib/ai/embeddings';

const embedding = await generateIdeaEmbedding({
  title: 'My Idea',
  problem_statement: 'The problem...',
  proposed_solution: 'The solution...',
  category: 'tech',
});
```

### Find Similar Ideas (Client-Side)

```typescript
const response = await fetch(`/api/ideas/${ideaId}/similar?limit=5`);
const { items } = await response.json();

items.forEach((similar: any) => {
  console.log(`${similar.title} - ${(similar.similarity * 100).toFixed(0)}% similar`);
});
```

## Cost Estimation

**OpenAI Pricing** (as of 2024):
- `text-embedding-3-small`: $0.02 per 1M tokens

**Typical Idea:**
- ~500 tokens per idea
- Cost: ~$0.00001 per embedding
- 1000 ideas: ~$0.01

**Very affordable!** 🎉

## Next Steps

1. **Run Migration**: Enable pgvector in Supabase
2. **Generate Embeddings**: Run `npm run generate:embeddings`
3. **Test Similarity**: Use `/api/ideas/[id]/similar` endpoint
4. **Add UI**: Display similar ideas on idea detail pages

## Troubleshooting

### "pgvector extension not found"
- Run the migration SQL in Supabase SQL Editor
- Ensure you have admin access to create extensions

### "OPENAI_API_KEY not configured"
- Add `OPENAI_API_KEY` to `.env.local`
- Get API key from https://platform.openai.com/api-keys

### "Idea does not have an embedding"
- Generate embedding first: `POST /api/ideas/[id]/embedding`
- Or run bulk generation: `npm run generate:embeddings`

### Low Similarity Scores
- Normal! Ideas are unique
- Try lowering threshold to 0.5-0.6
- Similarity >0.7 is very rare

## Future Enhancements

- [ ] Auto-generate embeddings when ideas are created
- [ ] Update embeddings when ideas are edited
- [ ] Add similarity threshold slider in UI
- [ ] Show similarity reasons (what makes them similar)
- [ ] Cluster ideas by similarity
- [ ] Recommend ideas to users based on their interests

