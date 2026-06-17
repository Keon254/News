import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  showCategory?: boolean;
}

export function ArticleCard({ article, variant = 'default', showCategory = true }: ArticleCardProps) {
  const formattedDate = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : 'Recently';

  if (variant === 'featured') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group block relative overflow-hidden rounded-2xl aspect-[16/9] bg-gray-100 dark:bg-gray-800"
      >
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt={article.cover_image_alt || article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          {showCategory && article.category && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </span>
          )}
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-primary-300 transition-colors">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-gray-300 line-clamp-2 mb-4 max-w-2xl">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="font-medium text-white">{article.author_name}</span>
            <span>&bull;</span>
            <span>{formattedDate}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.reading_time_minutes} min read
            </span>
          </div>
        </div>
        {article.is_breaking && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold animate-pulse-slow">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            BREAKING
          </div>
        )}
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group flex gap-4 items-start"
      >
        <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {article.cover_image_url && (
            <img
              src={article.cover_image_url}
              alt={article.cover_image_alt || article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {showCategory && article.category && (
            <span
              className="text-xs font-semibold"
              style={{ color: article.category.color }}
            >
              {article.category.name}
            </span>
          )}
          <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mt-1">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{formattedDate}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group block"
      >
        {showCategory && article.category && (
          <span
            className="text-xs font-semibold"
            style={{ color: article.category.color }}
          >
            {article.category.name}
          </span>
        )}
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mt-1">
          {article.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.reading_time_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {(article.view_count || 0).toLocaleString()}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group block bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 border border-gray-100 dark:border-gray-800"
    >
      <div className="aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt={article.cover_image_alt || article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-5">
        {showCategory && article.category && (
          <span
            className="text-xs font-semibold"
            style={{ color: article.category.color }}
          >
            {article.category.name}
          </span>
        )}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mt-2 leading-snug">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">{article.author_name}</span>
          <span>&bull;</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
}
