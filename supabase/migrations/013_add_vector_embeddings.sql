-- ============================================
-- VECTOR EMBEDDINGS FOR IDEA SIMILARITY
-- ============================================
-- Enable pgvector extension for vector similarity search
-- Add embedding column to marrai_ideas table

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to marrai_ideas
-- Using OpenAI's text-embedding-3-small (1536 dimensions) or text-embedding-3-large (3072 dimensions)
-- We'll use text-embedding-3-small (1536) for better performance and lower cost
ALTER TABLE marrai_ideas
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add index for vector similarity search (HNSW index for fast approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_embedding_hnsw 
ON marrai_ideas 
USING hnsw (embedding vector_cosine_ops);

-- Add comment
COMMENT ON COLUMN marrai_ideas.embedding IS 'Vector embedding for semantic similarity search. Generated from title + problem_statement + proposed_solution using OpenAI text-embedding-3-small (1536 dimensions).';

-- Add function to find similar ideas using cosine similarity
CREATE OR REPLACE FUNCTION find_similar_ideas(
  target_embedding vector(1536),
  idea_id_to_exclude UUID,
  similarity_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  problem_statement TEXT,
  proposed_solution TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.problem_statement,
    i.proposed_solution,
    1 - (i.embedding <=> target_embedding) AS similarity
  FROM marrai_ideas i
  WHERE 
    i.embedding IS NOT NULL
    AND i.id != idea_id_to_exclude
    AND i.visible = true
    AND (1 - (i.embedding <=> target_embedding)) >= similarity_threshold
  ORDER BY i.embedding <=> target_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_similar_ideas IS 'Find similar ideas using cosine similarity on vector embeddings. Returns ideas with similarity >= threshold, ordered by similarity descending.';

