import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ArticleCard } from '@/components/ArticleCard';
import { Loading } from '@/components/Loading';
import type { Category, Article } from '@/lib/types';
import { getCategory, getArticles } from '@/lib/api';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchCategory() {
      try {
        setIsLoading(true);
        const categoryData = await getCategory(slug!);
        if (categoryData) {
          setCategory(categoryData);
          const articlesData = await getArticles({ categoryId: categoryData.id, limit: 20 });
          setArticles(articlesData);
        }
      } catch (error) {
        console.error('Failed to fetch category:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategory();
  }, [slug]);

  if (isLoading) {
    return <Loading className="min-h-screen" />;
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Category Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The requested category could not be found.</p>
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
      <header
        className="py-16 border-b border-gray-100 dark:border-gray-800"
        style={{ background: `linear-gradient(135deg, ${category.color}15 0%, transparent 100%)` }}
      >
        <div className="container-wide">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
          </div>
          {category.description && (
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
              {category.description}
            </p>
          )}
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
              No articles found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
