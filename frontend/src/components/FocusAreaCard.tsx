import { motion } from 'framer-motion';

interface FocusAreaCardProps {
  title: string;
  description: string;
  index: number;
}

export function FocusAreaCard({ title, description, index }: FocusAreaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="surface-2 p-6 transition hover:border-border-strong"
    >
      <h3 className="font-display text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
    </motion.div>
  );
}
