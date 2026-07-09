import { motion } from 'framer-motion';
import type { SkillGroup as SkillGroupType } from '../lib/types';

export function SkillGroup({ group, index }: { group: SkillGroupType; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="surface p-6"
    >
      <h3 className="font-display text-base font-semibold text-text">{group.category}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {group.items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border bg-bg px-3 py-1 text-xs font-medium text-text-muted"
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
