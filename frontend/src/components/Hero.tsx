import { motion } from 'framer-motion';
import { ArrowRight, Download, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Profile } from '../lib/types';

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 opacity-60">
        <div className="h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 md:flex-row md:items-start md:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative flex-shrink-0"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent to-accent-2 opacity-30 blur-2xl" />
          <div className="relative h-40 w-40 overflow-hidden rounded-full border-2 border-border-strong bg-surface md:h-52 md:w-52">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-text-muted">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>
        </motion.div>

        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {profile.location && (
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3 py-1 text-xs font-medium text-text-muted">
                <MapPin size={12} />
                {profile.location}
              </span>
            )}
            <h1 className="font-display text-4xl font-bold leading-[1.1] text-text md:text-6xl">
              {profile.name}
            </h1>
            <p className="mt-3 text-lg font-medium text-accent md:text-xl">{profile.headline}</p>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-muted md:mx-0">
              {profile.tagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start"
          >
            <Link to="/projects" className="btn-primary">
              View Projects <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn-secondary">
              Let&apos;s Talk
            </Link>
            {profile.resume_url && (
              <a href={profile.resume_url} className="btn-secondary" download>
                <Download size={16} /> Resume
              </a>
            )}
          </motion.div>

          {profile.hero_stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8 md:max-w-md"
            >
              {profile.hero_stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl font-bold text-text md:text-3xl">{stat.value}</div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
