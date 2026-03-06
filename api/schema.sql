-- TechBlog Database Schema
-- Execute: wrangler d1 execute techblog-db --file=./schema.sql

-- Media table (images stored as Base64, served via /api/media/:id)
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mime_type TEXT NOT NULL,
  original_name TEXT,
  data TEXT NOT NULL,        -- Base64-encoded image data
  size INTEGER DEFAULT 0,   -- Original file size (bytes)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  type TEXT NOT NULL DEFAULT 'blog' CHECK(type IN ('blog', 'wiki')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('published', 'draft')),
  cover_image TEXT,
  view_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Article-Category association
CREATE TABLE IF NOT EXISTS article_categories (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

-- Article-Tag association
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- FTS5 full-text search virtual table (unicode61 tokenizer for character-level tokenization)
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
  title,
  content,
  excerpt,
  content='articles',
  content_rowid='id',
  tokenize='unicode61'
);

-- Auto-sync FTS triggers
CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts(rowid, title, content, excerpt)
  VALUES (new.id, new.title, new.content, COALESCE(new.excerpt, ''));
END;

CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
  UPDATE articles_fts
  SET title = new.title, content = new.content, excerpt = COALESCE(new.excerpt, '')
  WHERE rowid = new.id;
END;

CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
  DELETE FROM articles_fts WHERE rowid = old.id;
END;

-- Updated-at trigger
CREATE TRIGGER IF NOT EXISTS articles_update_time AFTER UPDATE ON articles BEGIN
  UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_type_status ON articles(type, status);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Seed data
INSERT OR IGNORE INTO categories (name, slug, description, color) VALUES
  ('Artificial Intelligence', 'ai', 'Cutting-edge AI technology and applications', '#6366f1'),
  ('Large Language Models', 'llm', 'LLM-related technology and research', '#8b5cf6'),
  ('Dev Tools', 'tools', 'Developer tools and engineering practices', '#06b6d4'),
  ('Industry News', 'news', 'Latest tech industry updates', '#10b981');

INSERT OR IGNORE INTO tags (name, slug) VALUES
  ('ChatGPT', 'chatgpt'),
  ('Claude', 'claude'),
  ('Gemini', 'gemini'),
  ('RAG', 'rag'),
  ('Agent', 'agent'),
  ('Prompt', 'prompt'),
  ('Fine-tuning', 'fine-tuning'),
  ('Open Source', 'open-source'),
  ('Cloudflare', 'cloudflare'),
  ('Python', 'python');

-- Sample articles
INSERT OR IGNORE INTO articles (slug, title, content, excerpt, type, status) VALUES
(
  'welcome',
  'Welcome to My Tech & AI Knowledge Base',
  '# Welcome to My Tech & AI Knowledge Base

This is where I document my thoughts and explorations on artificial intelligence, large language models, and cutting-edge technology.

## About This Site

This site is divided into two sections:

- **Blog**: Sharing original articles, technical insights, and industry analysis
- **Wiki**: Organizing systematic knowledge notes for easy reference and learning

## Current Focus Areas

1. **Large Language Models (LLM)**: Capabilities and applications of GPT-4, Claude 3, Gemini, and more
2. **AI Agents**: Architecture design and implementation of autonomous agents
3. **RAG Systems**: Engineering implementation of Retrieval-Augmented Generation
4. **Multimodal AI**: Unified understanding of text, images, and audio

## Start Exploring

Use the top navigation to switch between Blog and Wiki, or use the search feature to find content that interests you.

---

> "AI is not magic, it''s mathematics. But the results can feel like magic."',
  'Welcome to this personal knowledge base for AI and tech insights, featuring Blog articles and Wiki notes.',
  'blog',
  'published'
),
(
  'llm-architecture-overview',
  'LLM Architecture Overview: From Transformer to Modern Large Models',
  '# LLM Architecture Overview: From Transformer to Modern Large Models

## Transformer Fundamentals

In 2017, Google published *Attention is All You Need*, and the Transformer architecture changed the NLP landscape forever.

### Core Components

```python
import torch
import torch.nn as nn

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, x):
        Q = self.W_q(x)
        K = self.W_k(x)
        V = self.W_v(x)

        # Scaled Dot-Product Attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.d_k ** 0.5)
        attn = torch.softmax(scores, dim=-1)
        return torch.matmul(attn, V)
```

## Key Technologies in Modern LLMs

### 1. RoPE (Rotary Position Embedding)

RoPE offers better extrapolation to longer sequences compared to traditional absolute position encodings.

### 2. GQA (Grouped Query Attention)

Reduces the number of KV heads in Multi-Head Attention, significantly lowering memory usage during inference:
- MHA: Same number of Q/K/V heads
- MQA: Only 1 K/V head
- **GQA**: K/V head count is 1/G of Q heads (used in Llama 3)

### 3. SwiGLU Activation Function

Replaces traditional ReLU in the FFN layer with a gating mechanism for improved expressiveness.

## Major Model Comparison

| Model | Parameters | Context Length | Highlights |
|-------|-----------|---------------|------------|
| GPT-4 | Undisclosed | 128K | Strongest overall capability |
| Claude 3.5 | Undisclosed | 200K | Long context understanding |
| Llama 3.1 | 405B | 128K | Best open-source model |
| Gemini 1.5 | Undisclosed | 1M | Ultra-long context |

## Conclusion

LLM technology is evolving rapidly. Understanding the underlying principles is key to making sound decisions at the application layer.',
  'A deep dive into the Transformer architecture and key modern LLM technologies including RoPE, GQA, and SwiGLU.',
  'blog',
  'published'
),
(
  'rag-system-guide',
  'Complete Guide to RAG Systems',
  '# Complete Guide to RAG Systems

Retrieval-Augmented Generation (RAG) is one of the most practical LLM application architectures today.

## Core Pipeline

```
User Query -> Vectorization -> Vector Search -> Relevant Documents -> LLM Generation -> Answer
```

## Key Components

### 1. Document Processing Pipeline

Documents go through: Chunking -> Embedding -> Storage in a vector database

### 2. Retrieval Strategies

- **Semantic Search**: Based on vector similarity
- **Keyword Search**: BM25 algorithm
- **Hybrid Search**: Combining both for optimal results

### 3. Reranking

Uses Cross-Encoder models to re-score initial retrieval results for improved precision.

## Best Practices

1. Recommended chunk size: 512-1024 tokens with overlap
2. Use multilingual embedding models like BGE-M3
3. Use Qdrant or Weaviate as the vector store in production
4. Incorporate query rewriting and HyDE to improve recall',
  'Core architecture, key components, and best practices for RAG systems, from document processing to vector retrieval.',
  'wiki',
  'published'
);
