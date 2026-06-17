import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import { ArticleCard } from '@/components/ArticleCard';
import { Loading } from '@/components/Loading';
import type { Tag as TagType, Article } from '@/lib/types';
import { getTag, getArticlesByTag } from '@/lib/api';

export function TagPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tag, setTag] = useState<TagType | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchTag() {
      try {
        setIsLoading(true);
        const tagData = await getTag(slug!);
        if (tagData) {
          setTag(tagData);
          const articlesData = await getArticlesByTag(tagData.id);
          setArticles(articlesData);
        }
      } catch (error) {
        console.error('Failed to fetch tag:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTag();
  }, [slug]);

  if (isLoading) {
    return <Loading className="min-h-screen" />;
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Tag Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The requested tag could not be found.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="py-16 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-b from-gray-100/50 to-transparent dark:from-gray-800/50">
        <div className="container-wide">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <Tag className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {tag.name}
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {articles.length} article{articles.length !== 1 ? 's' : ''} tagged with "{tag.name}"
          </p>
        </div>
      </header>

      {/* Articles Grid */}
      <div className="container-wide py-12">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No articles found with this tag.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
