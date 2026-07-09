import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Blog } from '../lib/types';

export function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link
        to={`/blog/${blog.slug}`}
        className="group surface flex h-full flex-col overflow-hidden transition hover:border-border-strong"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
          {blog.cover_url ? (
            <img src={blog.cover_url} alt={blog.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-2/10 text-3xl font-bold text-text-muted">
              {blog.title.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Calendar size={12} />
            <span>{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Draft'}</span>
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold text-text">{blog.title}</h3>
          {blog.summary && <p className="mt-2 line-clamp-2 text-sm text-text-muted">{blog.summary}</p>}
          <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-medium text-accent group-hover:text-accent-2">
            Read article <ArrowUpRight size={14} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
