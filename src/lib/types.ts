export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  author_name: string;
  author_avatar_url: string | null;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  is_breaking: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  reading_time_minutes: number;
  view_count: number;
  category?: Category;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_login_at: string | null;
}
