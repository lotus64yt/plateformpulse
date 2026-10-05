"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NextStationSelector from "@/components/NextStationSelector";
import IntroScreen from "@/components/IntroScreen";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("trip=")) {
      setShowIntro(false);
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-900 font-sans min-h-screen">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroScreen onContinue={() => setShowIntro(false)} />
        ) : (
          <motion.main
            key="main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16"
          >
            <NextStationSelector />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
