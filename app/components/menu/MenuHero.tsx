"use client";

import { motion } from "motion/react";

type Props = {
  title: string;
  subtitle: string;
};

export function MenuHero({ title, subtitle }: Props) {
  return (
    <div className="px-4 pt-6 pb-2">
      <motion.h1
        className="text-xl font-bold text-white leading-snug"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {title}
      </motion.h1>
      <motion.p
        className="text-white/70 text-sm mt-1 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
