-- TechBlog Database Schema
-- 执行: wrangler d1 execute techblog-db --file=./schema.sql

-- 媒体文件表（图片存 Base64，通过 /api/media/:id 提供访问）
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mime_type TEXT NOT NULL,
  original_name TEXT,
  data TEXT NOT NULL,        -- Base64 编码的图片数据
  size INTEGER DEFAULT 0,   -- 原始文件大小（字节）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
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

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 文章-分类关联
CREATE TABLE IF NOT EXISTS article_categories (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

-- 文章-标签关联
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- FTS5 全文搜索虚拟表（支持中文按字符分词）
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
  title,
  content,
  excerpt,
  content='articles',
  content_rowid='id',
  tokenize='unicode61'
);

-- 自动同步 FTS 触发器
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

-- 更新时间触发器
CREATE TRIGGER IF NOT EXISTS articles_update_time AFTER UPDATE ON articles BEGIN
  UPDATE articles SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

-- 索引
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_type_status ON articles(type, status);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- 初始种子数据
INSERT OR IGNORE INTO categories (name, slug, description, color) VALUES
  ('人工智能', 'ai', 'AI 前沿技术与应用', '#6366f1'),
  ('大语言模型', 'llm', 'LLM 相关技术与研究', '#8b5cf6'),
  ('开发工具', 'tools', '开发工具与工程实践', '#06b6d4'),
  ('行业动态', 'news', '科技行业最新动态', '#10b981');

INSERT OR IGNORE INTO tags (name, slug) VALUES
  ('ChatGPT', 'chatgpt'),
  ('Claude', 'claude'),
  ('Gemini', 'gemini'),
  ('RAG', 'rag'),
  ('Agent', 'agent'),
  ('Prompt', 'prompt'),
  ('Fine-tuning', 'fine-tuning'),
  ('开源', 'open-source'),
  ('Cloudflare', 'cloudflare'),
  ('Python', 'python');

-- 示例文章
INSERT OR IGNORE INTO articles (slug, title, content, excerpt, type, status) VALUES
(
  'welcome',
  '欢迎来到我的科技AI知识库',
  '# 欢迎来到我的科技AI知识库

这里记录我对人工智能、大语言模型和前沿科技的思考与探索。

## 关于本站

本站分为两个部分：

- **Blog**：分享我的原创文章、技术心得和行业洞察
- **Wiki**：整理系统性的知识笔记，方便查阅和学习

## 近期关注方向

1. **大语言模型 (LLM)**：GPT-4、Claude 3、Gemini 等模型的能力边界与应用场景
2. **AI Agent**：自主智能体的架构设计与实践
3. **RAG 系统**：检索增强生成的工程实现
4. **多模态 AI**：文字、图像、音频的融合理解

## 开始探索

使用顶部导航在 Blog 和 Wiki 之间切换，或者使用搜索功能找到你感兴趣的内容。

---

> "AI is not magic, it''s mathematics. But the results can feel like magic." — 某位工程师',
  '欢迎来到这个记录AI与科技思考的个人知识库，这里有Blog原创文章和Wiki系统笔记。',
  'blog',
  'published'
),
(
  'llm-architecture-overview',
  'LLM 架构全景：从 Transformer 到现代大模型',
  '# LLM 架构全景：从 Transformer 到现代大模型

## Transformer 基础

2017年，Google 发表了 *Attention is All You Need*，Transformer 架构从此改变了 NLP 领域。

### 核心组件

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

## 现代 LLM 的关键技术

### 1. RoPE 位置编码

旋转位置编码（Rotary Position Embedding）相比传统绝对位置编码，能更好地外推到更长的序列。

### 2. GQA（Grouped Query Attention）

将 Multi-Head Attention 的 KV heads 数量减少，大幅降低推理时的显存占用：
- MHA: Q/K/V heads 数量相同
- MQA: 只有 1 个 K/V head
- **GQA**: K/V heads 数量为 Q 的 1/G（Llama 3 使用此方案）

### 3. SwiGLU 激活函数

替代传统 ReLU，在 FFN 层使用门控机制提升表达能力。

## 主流模型对比

| 模型 | 参数量 | 上下文长度 | 特点 |
|------|--------|-----------|------|
| GPT-4 | 未公开 | 128K | 最强综合能力 |
| Claude 3.5 | 未公开 | 200K | 长上下文理解 |
| Llama 3.1 | 405B | 128K | 开源最强 |
| Gemini 1.5 | 未公开 | 1M | 超长上下文 |

## 结语

LLM 技术发展迅猛，关键是理解底层原理，才能在应用层做出正确判断。',
  'Transformer 架构详解，以及 RoPE、GQA、SwiGLU 等现代 LLM 关键技术的原理分析。',
  'blog',
  'published'
),
(
  'rag-system-guide',
  'RAG 系统完整指南',
  '# RAG 系统完整指南

检索增强生成（Retrieval-Augmented Generation）是目前最实用的 LLM 应用架构之一。

## 核心流程

```
用户问题 → 向量化 → 向量检索 → 相关文档 → LLM 生成 → 答案
```

## 关键组件

### 1. 文档处理管道

文档需要经过：切块（Chunking）→ 向量化（Embedding）→ 存储到向量数据库

### 2. 检索策略

- **语义检索**：基于向量相似度
- **关键词检索**：BM25 算法
- **混合检索**：两者结合，效果最佳

### 3. 重排序（Reranking）

使用 Cross-Encoder 模型对初步检索结果重新打分，提升精度。

## 实践建议

1. Chunk size 建议 512-1024 tokens，带 overlap
2. 使用 BGE-M3 等多语言 Embedding 模型
3. 生产环境使用 Qdrant 或 Weaviate 作为向量库
4. 加入 Query 改写和 HyDE 技术提升召回率',
  'RAG 系统的核心架构、关键组件和最佳实践，从文档处理到向量检索的完整指南。',
  'wiki',
  'published'
);
