import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { ArticleCard } from '@/components/ArticleCard';
import { Loading } from '@/components/Loading';
import type { Article, Category } from '@/lib/types';
import { getArticles, getCategories } from '@/lib/api';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const articles = await getArticles({ search: query, limit: 20 });
        setResults(articles);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Search Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-16">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Search Articles
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news, topics, authors..."
                className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 text-lg transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Links */}
          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Browse by category:</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="container-wide py-12">
        {isLoading ? (
          <Loading />
        ) : query && results.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No results found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find any articles matching "{query}"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Try searching for different keywords or browse our categories above.
            </p>
          </div>
        ) : query && results.length > 0 ? (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Found <span className="font-medium text-gray-900 dark:text-white">{results.length}</span> article{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400">
              Enter a search term to find articles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
