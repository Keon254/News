-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_breaking BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reading_time_minutes INTEGER DEFAULT 5,
  view_count INTEGER DEFAULT 0
);

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create article_tags junction table
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create admin_users table for authentication
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX idx_articles_featured ON articles(is_featured, is_published);
CREATE INDEX idx_articles_breaking ON articles(is_breaking, is_published);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "categories_public_read" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- RLS Policies for articles (public read published, admin can do all)
CREATE POLICY "articles_public_read" ON articles FOR SELECT
  TO anon, authenticated USING (is_published = true);

CREATE POLICY "articles_admin_all" ON articles FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- RLS Policies for tags (public read)
CREATE POLICY "tags_public_read" ON tags FOR SELECT
  TO anon, authenticated USING (true);

-- RLS Policies for article_tags (public read)
CREATE POLICY "article_tags_public_read" ON article_tags FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "article_tags_admin_all" ON article_tags FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- RLS Policies for admin_users (only admin can access)
CREATE POLICY "admin_users_admin_only" ON admin_users FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for articles
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default categories
INSERT INTO categories (name, slug, description, color) VALUES
  ('Politics', 'politics', 'Political news and analysis', '#dc2626'),
  ('Technology', 'technology', 'Tech industry news and innovations', '#059669'),
  ('Business', 'business', 'Business and economy coverage', '#2563eb'),
  ('Science', 'science', 'Scientific discoveries and research', '#7c3aed'),
  ('Health', 'health', 'Health and wellness news', '#ec4899'),
  ('Entertainment', 'entertainment', 'Entertainment and culture', '#f59e0b'),
  ('Sports', 'sports', 'Sports news and updates', '#16a34a'),
  ('World', 'world', 'International news', '#6366f1');

-- Insert default admin user (password: admin123 - will be hashed in app)
INSERT INTO admin_users (email, password_hash, name) VALUES
  ('admin@chronicle.com', '$2a$10$placeholder', 'Chronicle Admin');

-- Insert default tags
INSERT INTO tags (name, slug) VALUES
  ('Breaking News', 'breaking-news'),
  ('Exclusive', 'exclusive'),
  ('Analysis', 'analysis'),
  ('Opinion', 'opinion'),
  ('Investigation', 'investigation'),
  ('Trending', 'trending');
