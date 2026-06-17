import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input, Textarea, Select } from '@/components/Input';
import { Loading } from '@/components/Loading';
import type { Article, Category, Tag } from '@/lib/types';
import { getArticle, getCategories, getTags, createArticle, updateArticle, setArticleTags } from '@/lib/api';

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  cover_image_alt: string;
  author_name: string;
  author_avatar_url: string;
  category_id: string;
  is_published: boolean;
  is_featured: boolean;
  is_breaking: boolean;
  reading_time_minutes: number;
}

const initialFormData: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  cover_image_alt: '',
  author_name: 'Chronicle Staff',
  author_avatar_url: '',
  category_id: '',
  is_published: false,
  is_featured: false,
  is_breaking: false,
  reading_time_minutes: 5,
};

export function ArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [formData, setFormData] = useState<ArticleFormData>(initialFormData);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate reading time based on content
  const calculatedReadingTime = useMemo(() => {
    const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [formData.content]);

  // Generate slug from title
  useEffect(() => {
    if (isNew && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isNew]);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getTags(),
        ]);
        setCategories(categoriesData);
        setTags(tagsData);

        if (!isNew) {
          const article = await getArticle(id!);
          if (!article) {
            navigate('/admin/articles');
            return;
          }
          setFormData({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt || '',
            content: article.content,
            cover_image_url: article.cover_image_url || '',
            cover_image_alt: article.cover_image_alt || '',
            author_name: article.author_name,
            author_avatar_url: article.author_avatar_url || '',
            category_id: article.category_id || '',
            is_published: article.is_published,
            is_featured: article.is_featured,
            is_breaking: article.is_breaking,
            reading_time_minutes: article.reading_time_minutes,
          });
          setSelectedTags(article.tags?.map(t => t.id) || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, [id, isNew, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (!formData.author_name.trim()) {
      newErrors.author_name = 'Author name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (publish = false) => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const articleData = {
        ...formData,
        reading_time_minutes: calculatedReadingTime,
        is_published: publish ? true : formData.is_published,
        published_at: publish && !formData.is_published ? new Date().toISOString() : undefined,
        category_id: formData.category_id || null,
      };

      let savedArticle: Article;
      if (isNew) {
        savedArticle = await createArticle(articleData);
      } else {
        savedArticle = await updateArticle(id!, articleData);
      }

      // Update tags
      await setArticleTags(savedArticle.id, selectedTags);

      navigate('/admin/articles');
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/articles"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isNew ? 'New Article' : 'Edit Article'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isNew ? 'Create a new article' : 'Modify existing article'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-5 h-5" />}
            {formData.is_published ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter article title"
              error={errors.title}
            />
            <div className="mt-4">
              <Input
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="article-url-slug"
                error={errors.slug}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL: /article/{formData.slug || 'your-slug'}
              </p>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <Textarea
              label="Excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief summary of the article"
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <Textarea
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your article content here..."
              rows={20}
              error={errors.content}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Estimated reading time: {calculatedReadingTime} min
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cover Image</h3>
            <Input
              label="Image URL"
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            {formData.cover_image_url && (
              <div className="mt-4 aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={formData.cover_image_url}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="mt-4">
              <Input
                label="Alt Text"
                name="cover_image_alt"
                value={formData.cover_image_alt}
                onChange={handleChange}
                placeholder="Describe the image"
              />
            </div>
          </div>

          {/* Author */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Author</h3>
            <Input
              label="Author Name"
              name="author_name"
              value={formData.author_name}
              onChange={handleChange}
              error={errors.author_name}
            />
            <div className="mt-4">
              <Input
                label="Author Avatar URL"
                name="author_avatar_url"
                value={formData.author_avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Category</h3>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select a category' },
                ...categories.map(c => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
            <div className="space-y-2">
              {tags.map(tag => (
                <label
                  key={tag.id}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags(prev => [...prev, tag.id]);
                      } else {
                        setSelectedTags(prev => prev.filter(id => id !== tag.id));
                      }
                    }}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Featured Article</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_breaking"
                  checked={formData.is_breaking}
                  onChange={handleChange}
                  className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Breaking News</span>
              </label>
              {formData.is_published && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm">
                    Currently Published
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
