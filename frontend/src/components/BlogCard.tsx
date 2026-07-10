import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Blog } from '../lib/types';

function formatDate(value: string | undefined | null, locale: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function BlogCard({ post, index }: { post: Blog; index: number }) {
  const { i18n } = useTranslation();
  const date = formatDate(post.published_at || post.created_at, i18n.language);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group surface flex h-full flex-col overflow-hidden transition hover:border-border-strong"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
          {post.cover_url ? (
            <img
              src={post.cover_url}
              alt={post.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-2/10 text-4xl font-bold text-text-muted">
              {post.title.charAt(0)}
            </div>
          )}
          <div className="absolute right-3 top-3 rounded-full bg-bg/80 p-2 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
            <ArrowUpRight size={16} className="text-text" />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          {date && <p className="text-xs text-text-muted">{date}</p>}
          <h3 className="mt-1 font-display text-lg font-semibold text-text">{post.title}</h3>
          {post.summary && <p className="mt-3 line-clamp-2 text-sm text-text-muted">{post.summary}</p>}
        </div>
      </Link>
    </motion.div>
  );
}
