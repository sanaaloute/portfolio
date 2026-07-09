import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../lib/types';

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link
        to={`/projects/${project.slug}`}
        className="group surface flex h-full flex-col overflow-hidden transition hover:border-border-strong"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
          {project.cover_url ? (
            <img
              src={project.cover_url}
              alt={project.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent-2/10 text-4xl font-bold text-text-muted">
              {project.title.charAt(0)}
            </div>
          )}
          <div className="absolute right-3 top-3 rounded-full bg-bg/80 p-2 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
            <ArrowUpRight size={16} className="text-text" />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-semibold text-text">{project.title}</h3>
          <p className="mt-1 text-xs text-text-muted">{project.period}</p>
          <p className="mt-3 line-clamp-2 text-sm text-text-muted">{project.summary}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {project.stack.slice(0, 4).map((tech) => (
              <span key={tech} className="rounded-full border border-border bg-bg px-2.5 py-1 text-[10px] font-medium text-text-muted">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
