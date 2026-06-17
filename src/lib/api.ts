import { supabase } from './supabase';
import type { Article, Category, Tag, AdminUser } from './types';

// Fetch all categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

// Fetch single category by slug
export async function getCategory(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

// Fetch all tags
export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

// Fetch single tag by slug
export async function getTag(slug: string): Promise<Tag | null> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

// Fetch published articles with optional filters
export async function getArticles(options?: {
  categoryId?: string;
  tagId?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options?.isFeatured !== undefined) {
    query = query.eq('is_featured', options.isFeatured);
  }

  if (options?.isBreaking !== undefined) {
    query = query.eq('is_breaking', options.isBreaking);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%,content.ilike.%${options.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform the tags from junction table
  return (data || []).map(article => ({
    ...article,
    tags: article.tags?.map((t: { tag: Tag }) => t.tag).filter(Boolean) || []
  }));
}

// Fetch articles by tag
export async function getArticlesByTag(tagId: string, limit = 20): Promise<Article[]> {
  const { data, error } = await supabase
    .from('article_tags')
    .select(`
      article:articles(
        *,
        category:categories(*),
        tags:article_tags(tag:tags(*))
      )
    `)
    .eq('tag_id', tagId)
    .eq('article.is_published', true)
    .order('article.published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((item: any) => {
    const article = item.article;
    if (!article) return null;
    return {
      ...article,
      tags: (article.tags || []).map((t: { tag: Tag }) => t.tag).filter(Boolean)
    };
  }).filter(Boolean);
}

// Fetch single article by slug
export async function getArticle(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) return null;

  return {
    ...data,
    tags: data.tags?.map((t: { tag: Tag }) => t.tag).filter(Boolean) || []
  };
}

// Increment view count
export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_view_count', { article_id: id });
  if (error) {
    // Silently fail - view count is not critical
    console.error('Failed to increment view count:', error);
  }
}

// Fetch related articles (same category, excluding current article)
export async function getRelatedArticles(articleId: string, categoryId: string | null, limit = 4): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .eq('is_published', true)
    .neq('id', articleId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(article => ({
    ...article,
    tags: article.tags?.map((t: { tag: Tag }) => t.tag).filter(Boolean) || []
  }));
}

// Admin: Fetch all articles (including unpublished)
export async function getAdminArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(article => ({
    ...article,
    tags: article.tags?.map((t: { tag: Tag }) => t.tag).filter(Boolean) || []
  }));
}

// Admin: Create article
export async function createArticle(article: Partial<Article>): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .insert(article)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Admin: Update article
export async function updateArticle(id: string, article: Partial<Article>): Promise<Article> {
  const { data, error } = await supabase
    .from('articles')
    .update(article)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Admin: Delete article
export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Admin: Set article tags
export async function setArticleTags(articleId: string, tagIds: string[]): Promise<void> {
  // First delete existing tags
  await supabase
    .from('article_tags')
    .delete()
    .eq('article_id', articleId);

  // Then insert new tags
  if (tagIds.length > 0) {
    const { error } = await supabase
      .from('article_tags')
      .insert(tagIds.map(tagId => ({ article_id: articleId, tag_id: tagId })));

    if (error) throw error;
  }
}

// Admin login
export async function adminLogin(email: string, password: string): Promise<AdminUser | null> {
  // In a real app, password verification would happen server-side
  // For this demo, we'll use a simple check
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return null;

  // Simple password check (in production, use proper bcrypt comparison server-side)
  // For demo purposes, we'll use a basic comparison
  const bcrypt = await import('bcryptjs');
  const isValid = await bcrypt.compare(password, data.password_hash);

  if (!isValid) return null;

  // Update last login
  await supabase
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.id);

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    created_at: data.created_at,
    last_login_at: data.last_login_at
  };
}

// Get trending articles (by view count)
export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(article => ({
    ...article,
    tags: article.tags?.map((t: { tag: Tag }) => t.tag).filter(Boolean) || []
  }));
}
