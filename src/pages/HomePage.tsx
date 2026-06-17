import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { ArticleCard } from '@/components/ArticleCard';
import { Loading } from '@/components/Loading';
import type { Article, Category } from '@/lib/types';
import { getArticles, getCategories, getTrendingArticles } from '@/lib/api';

export function HomePage() {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<Record<string, Article[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [featuredData, breakingData, latestData, trendingData, categoriesData] = await Promise.all([
          getArticles({ isFeatured: true, limit: 1 }),
          getArticles({ isBreaking: true, limit: 3 }),
          getArticles({ limit: 6 }),
          getTrendingArticles(5),
          getCategories(),
        ]);

        setFeaturedArticle(featuredData[0] || null);
        setBreakingNews(breakingData);
        setLatestArticles(latestData);
        setTrendingArticles(trendingData);
        setCategories(categoriesData);

        // Fetch one article per category
        const categoryArticlesData: Record<string, Article[]> = {};
        for (const category of categoriesData) {
          const articles = await getArticles({ categoryId: category.id, limit: 4 });
          if (articles.length > 0) {
            categoryArticlesData[category.id] = articles;
          }
        }
        setCategoryArticles(categoryArticlesData);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <Loading className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Breaking News Banner */}
      {breakingNews.length > 0 && (
        <div className="bg-red-600 dark:bg-red-700 text-white py-2.5">
          <div className="container-wide">
            <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="flex items-center gap-2 bg-white/20 px-2 py-1 rounded text-sm font-semibold">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  BREAKING
                </span>
              </div>
              {breakingNews.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="flex items-center gap-3 text-sm hover:underline whitespace-nowrap"
                >
                  <span>{article.title}</span>
                  {index < breakingNews.length - 1 && <span className="text-white/50">|</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container-wide py-8">
        {/* Featured Section */}
        {featuredArticle && (
          <section className="mb-10">
            <ArticleCard article={featuredArticle} variant="featured" />
          </section>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Latest News Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest News</h2>
                <Link
                  to="/category/latest"
                  className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestArticles.slice(0, 4).map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              {latestArticles.length > 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {latestArticles.slice(4, 6).map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Trending Section */}
            <section className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending</h3>
              </div>
              <div className="space-y-5">
                {trendingArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="group flex gap-4 items-start"
                  >
                    <span className="text-3xl font-bold text-gray-200 dark:text-gray-700 group-hover:text-primary-500 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      {article.category && (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: article.category.color }}
                        >
                          {article.category.name}
                        </span>
                      )}
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mt-1">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{article.reading_time_minutes} min read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Newsletter */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Stay Informed</h3>
              <p className="text-primary-100 text-sm mb-4">
                Get breaking news and top stories delivered to your inbox.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="w-full px-4 py-2.5 rounded-lg bg-white text-primary-700 font-semibold hover:bg-primary-50 transition-colors">
                  Subscribe
                </button>
              </form>
            </section>
          </aside>
        </div>

        {/* Category Sections */}
        {categories.map(category => {
          const articles = categoryArticles[category.id];
          if (!articles || articles.length === 0) return null;

          return (
            <section key={category.id} className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <Link
                  to={`/category/${category.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <div
                    className="w-1 h-8 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {category.name}
                  </h2>
                </Link>
                <Link
                  to={`/category/${category.slug}`}
                  className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  More in {category.name} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {articles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
