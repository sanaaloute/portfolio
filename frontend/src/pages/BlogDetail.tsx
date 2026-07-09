import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/PageWrapper';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { SafeHtml } from '../components/SafeHtml';
import { useApi } from '../hooks/useApi';
import { blogsApi } from '../lib/api';

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, loading, error, refetch } = useApi(() => blogsApi.get(slug!), [slug]);

  if (loading) return <LoadingState message="Loading article..." />;
  if (error || !blog) return <ErrorState message={error || 'Article not found'} retry={refetch} />;

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
          <ArrowLeft size={16} /> Back to blog
        </Link>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Calendar size={14} />
            <span>{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Draft'}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-text md:text-5xl">{blog.title}</h1>
          {blog.summary && <p className="mt-4 text-lg text-text-muted">{blog.summary}</p>}

          {blog.cover_url && (
            <div className="mt-8 overflow-hidden rounded-3xl">
              <img src={blog.cover_url} alt={blog.title} className="w-full object-cover" />
            </div>
          )}

          <div className="mt-8">
            <SafeHtml html={blog.body} className="prose-content" />
          </div>
        </motion.article>
      </div>
    </PageWrapper>
  );
}
