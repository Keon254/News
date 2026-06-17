import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Eye, Share2, Facebook, Twitter, Linkedin, ArrowLeft, Tag } from 'lucide-react';
import { ArticleCard } from '@/components/ArticleCard';
import { Loading } from '@/components/Loading';
import type { Article } from '@/lib/types';
import { getArticle, getRelatedArticles, incrementViewCount } from '@/lib/api';

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchArticle() {
      try {
        setIsLoading(true);
        const articleData = await getArticle(slug!);

        if (!articleData) {
          setError('Article not found');
          return;
        }

        setArticle(articleData);

        // Increment view count
        incrementViewCount(articleData.id).catch(console.error);

        // Fetch related articles
        const related = await getRelatedArticles(articleData.id, articleData.category_id, 4);
        setRelatedArticles(related);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('Failed to load article');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async (platform: string) => {
    const title = article?.title || '';
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return <Loading className="min-h-screen" />;
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error || 'The requested article could not be found.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = article.published_at
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : 'Recently';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <header className="relative">
        {article.cover_image_url && (
          <div className="absolute inset-0 h-96 lg:h-[500px]">
            <img
              src={article.cover_image_url}
              alt={article.cover_image_alt || article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
        )}
        <div className={`relative ${article.cover_image_url ? 'pt-72 lg:pt-96' : 'pt-24'} pb-8`}>
          <div className="container-narrow">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            {/* Category */}
            {article.category && (
              <Link
                to={`/category/${article.category.slug}`}
                className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-4 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                {article.author_avatar_url && (
                  <img
                    src={article.author_avatar_url}
                    alt={article.author_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-white">{article.author_name}</p>
                  <p className="text-gray-400">{publishedDate}</p>
                </div>
              </div>
              <span className="hidden sm:block">&bull;</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.reading_time_minutes} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {(article.view_count + 1).toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="bg-white dark:bg-gray-950">
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="border-b border-gray-100 dark:border-gray-800">
            <div className="container-narrow py-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                {article.tags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/tag/${tag.slug}`}
                    className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container-narrow py-10">
          {article.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8 font-medium">
              {article.excerpt}
            </p>
          )}

          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
          />
        </div>

        {/* Share Section */}
        <div className="border-t border-gray-100 dark:border-gray-800">
          <div className="container-narrow py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share this article
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900 py-16">
          <div className="container-wide">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArticles.map(relatedArticle => (
                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
