const API_URL = "http://localhost:8787";
async function getArticles(params) {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.category) query.set("category", params.category);
  if (params.tag) query.set("tag", params.tag);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  const res = await fetch(`${API_URL}/api/articles?${query}`);
  if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
  return res.json();
}
async function getArticle(slug) {
  const res = await fetch(`${API_URL}/api/articles/${slug}`);
  if (!res.ok) throw new Error(`Article not found: ${slug}`);
  return res.json();
}
async function searchArticles(q, type) {
  const query = new URLSearchParams({ q });
  if (type) query.set("type", type);
  const res = await fetch(`${API_URL}/api/search?${query}`);
  return res.json();
}
async function getCategories() {
  const res = await fetch(`${API_URL}/api/categories`);
  return res.json();
}
async function getTags() {
  const res = await fetch(`${API_URL}/api/tags`);
  return res.json();
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function splitComma(str) {
  if (!str) return [];
  return str.split(",").filter(Boolean);
}

export { getArticles as a, getCategories as b, getTags as c, searchArticles as d, formatDate as f, getArticle as g, splitComma as s };
