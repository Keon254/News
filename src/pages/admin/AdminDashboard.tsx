import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, TrendingUp, Plus, Edit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import type { Article } from '@/lib/types';
import { getAdminArticles, getTrendingArticles } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Stats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
}

export function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [trending, setTrending] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesData, trendingData] = await Promise.all([
          getAdminArticles(),
          getTrendingArticles(5),
        ]);

        setArticles(articlesData);
        setTrending(trendingData);

        setStats({
          totalArticles: articlesData.length,
          publishedArticles: articlesData.filter(a => a.is_published).length,
          draftArticles: articlesData.filter(a => !a.is_published).length,
          totalViews: articlesData.reduce((sum, a) => sum + (a.view_count || 0), 0),
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  const recentArticles = articles.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your news overview.
          </p>
        </div>
        <Link to="/admin/articles/new">
          <Button size="lg">
            <Plus className="w-5 h-5" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalArticles}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Articles</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.publishedArticles}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.draftArticles}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Articles */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Articles
                </h2>
                <Link
                  to="/admin/articles"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentArticles.map(article => (
                <div
                  key={article.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {article.is_published ? (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded">
                            Draft
                          </span>
                        )}
                        {article.is_featured && (
                          <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded">
                            Featured
                          </span>
                        )}
                        {article.is_breaking && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                            Breaking
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{article.category?.name || 'Uncategorized'}</span>
                        <span>Updated {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.view_count?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/admin/articles/${article.id}`}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Top Performing
            </h2>
            <div className="space-y-4">
              {trending.slice(0, 5).map((article, index) => (
                <Link
                  key={article.id}
                  to={`/admin/articles/${article.id}`}
                  className="flex items-start gap-3 group"
                >
                  <span className="text-2xl font-bold text-gray-200 dark:text-gray-700 group-hover:text-primary-500 transition-colors">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Eye className="w-3 h-3" />
                      {article.view_count?.toLocaleString() || 0}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                to="/admin/articles/new"
                className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New Article
              </Link>
              <Link
                to="/"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Eye className="w-5 h-5" />
                View Live Site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
