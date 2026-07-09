import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'left', action }: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`mb-10 flex flex-col gap-3 ${alignClass} md:mb-14 ${action ? 'md:flex-row md:items-end md:justify-between' : ''}`}
    >
      <div>
        {eyebrow && (
          <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-3xl font-bold leading-tight text-text md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
