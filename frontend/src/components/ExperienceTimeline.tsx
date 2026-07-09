import { motion } from 'framer-motion';
import type { Experience } from '../lib/types';

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  return (
    <div className="relative space-y-8 md:space-y-12">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border md:left-1/2" />
      {experiences.map((exp, index) => {
        const period = exp.end_date
          ? `${new Date(exp.start_date).getFullYear()} – ${new Date(exp.end_date).getFullYear()}`
          : `${new Date(exp.start_date).getFullYear()} – Present`;
        const isLeft = index % 2 === 0;
        return (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`relative flex flex-col gap-6 md:flex-row ${isLeft ? 'md:flex-row-reverse' : ''}`}
          >
            <div className="flex-1 md:text-right">
              <div className={`surface p-6 ${isLeft ? 'md:text-left' : 'md:text-right'}`}>
                <span className="text-xs font-medium text-accent">{period}</span>
                <h3 className="mt-1 font-display text-lg font-semibold text-text">{exp.role}</h3>
                <p className="text-sm text-text-muted">{exp.company}</p>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{exp.description}</p>
                {exp.highlights.length > 0 && (
                  <ul className={`mt-3 space-y-1 text-sm text-text-muted ${isLeft ? '' : 'md:ml-auto'}`}>
                    {exp.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className={`flex gap-2 ${isLeft ? '' : 'md:flex-row-reverse'}`}>
                        <span className="text-accent">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="absolute left-4 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-bg bg-accent md:left-1/2" />
            <div className="hidden flex-1 md:block" />
          </motion.div>
        );
      })}
    </div>
  );
}
