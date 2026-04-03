"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export function SplashScreen() {
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShown(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-page pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <Image
            src="/san-lucas-logo.png"
            alt="San Lucas"
            width={180}
            height={180}
            priority
            className="object-contain"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
