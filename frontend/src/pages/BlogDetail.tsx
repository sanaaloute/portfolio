import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { blogsApi } from '../lib/api'
import { useApi } from '../hooks/useApi'
import { LoadingState } from '../components/LoadingState'
import { SafeHtml } from '../components/SafeHtml'

export function BlogDetail() {
  const { t, i18n } = useTranslation()
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: post, loading } = useApi(() => blogsApi.get(slug), [slug])

  if (loading) {
    return <LoadingState />
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-text-muted">{t('blog.empty')}</p>
        <Link to="/blog" className="mt-4 inline-block text-accent hover:underline">
          &larr; {t('blog.back')}
        </Link>
      </div>
    )
  }

  const date = post.published_at || post.created_at
  const formattedDate = date
    ? new Date(date).toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link to="/blog" className="text-sm text-accent hover:underline">
        &larr; {t('blog.back')}
      </Link>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-text sm:text-4xl">
        {post.title}
      </h1>

      {formattedDate && (
        <time dateTime={date} className="mt-2 block text-sm text-text-muted">
          {formattedDate}
        </time>
      )}

      {post.cover_url && (
        <img
          src={post.cover_url}
          alt={post.title}
          className="mt-8 w-full rounded-xl object-cover"
        />
      )}

      <div className="mt-8">
        <SafeHtml html={post.body} className="prose prose-invert max-w-none" />
      </div>
    </article>
  )
}
