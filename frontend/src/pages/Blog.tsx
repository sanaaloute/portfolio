import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { blogsApi } from '../lib/api'
import { useApi } from '../hooks/useApi'
import { SectionHeading } from '../components/SectionHeading'
import { LoadingState } from '../components/LoadingState'

export function Blog() {
  const { t } = useTranslation()
  const { data: blogs, loading } = useApi(() => blogsApi.list())

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading title={t('blog.title')} />

      {loading ? (
        <LoadingState />
      ) : !blogs?.length ? (
        <p className="py-16 text-center text-text-muted">{t('blog.empty')}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="block h-full">
              <div className="surface flex h-full flex-col overflow-hidden">
                {post.cover_url && (
                  <img
                    src={post.cover_url}
                    alt={post.title}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-text">{post.title}</h3>
                  {post.summary && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                      {post.summary}
                    </p>
                  )}
                  <span className="mt-4 text-sm font-medium text-accent">
                    {t('blog.readMore')} &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
