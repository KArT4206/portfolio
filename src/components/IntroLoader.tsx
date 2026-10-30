"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function IntroLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            karthik.b
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
