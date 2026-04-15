"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";

const fadeLeft = (delay: number) => ({
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

export function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-start justify-center px-8 overflow-hidden bg-[url('/bgImage.jpeg')] bg-cover bg-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-sm w-full">
        {/* Logo */}
        <motion.div {...fadeLeft(0)} className="mb-6">
          <Image
            src="/san-lucas-logo.png"
            alt="San Lucas"
            width={80}
            height={80}
            priority
            className="object-contain"
          />
        </motion.div>

        {/* Cafe name */}
        <motion.h1
          {...fadeLeft(0.15)}
          className="text-4xl font-bold text-white leading-tight mb-2"
        >
          San Lucas
          <br />
          <span className="text-brand-light">Cafe</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...fadeLeft(0.28)}
          className="text-white/70 text-base leading-relaxed mb-6"
        >
          Lezzetli içecekler ve
          <br />
          sıcak anlar sizi bekliyor.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.38 }}
          className="w-16 h-0.5 bg-brand-light mb-8"
          style={{ transformOrigin: "left" }}
        />

        {/* Instructional text */}
        <motion.p
          {...fadeLeft(0.45)}
          className="text-white/50 text-xs uppercase tracking-widest mb-4"
        >
          Masanızdaki QR kodu okutun
        </motion.p>

        {/* CTA button */}
        <motion.div {...fadeLeft(0.55)}>
          <Link
            href="/menu?table=1"
            className="inline-flex items-center gap-2 bg-brand-light text-brand font-bold px-6 py-3 rounded-pill text-sm shadow-lg active:scale-95 transition-transform"
          >
            Menüyü Gör
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
