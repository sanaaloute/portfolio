import { PageWrapper } from '../components/PageWrapper';
import { SectionHeading } from '../components/SectionHeading';
import { BlogCard } from '../components/BlogCard';
import { LoadingState, ErrorState } from '../components/LoadingState';
import { useApi } from '../hooks/useApi';
import { blogsApi } from '../lib/api';

export function BlogPage() {
  const { data: blogs, loading, error, refetch } = useApi(blogsApi.list);

  return (
    <PageWrapper>
      <div className="mx-auto max-w-6xl px-6 pt-32 pb-24">
        <SectionHeading title="Blog" subtitle="Thoughts on AI, engineering, and building products." align="center" />
        {loading && <LoadingState message="Loading articles..." />}
        {error && <ErrorState message={error} retry={refetch} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs?.map((blog, i) => (
              <BlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </div>
        )}
        {!loading && !error && blogs?.length === 0 && (
          <p className="py-12 text-center text-text-muted">No articles published yet.</p>
        )}
      </div>
    </PageWrapper>
  );
}
