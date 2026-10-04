"use client";

import { motion } from "framer-motion";
import ContinueButton from "./ContinueButton";

const AnimatedContinueButton = motion(ContinueButton);

interface IntroScreenProps {
  onContinue: () => void;
}

export default function IntroScreen({ onContinue }: IntroScreenProps) {
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white px-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[95vw] space-y-8"
      >
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-extrabold tracking-tighter leading-[1.1]">
          Your RER life, condensed into stats.
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-400 font-medium max-w-5xl mx-auto">
          Real-time and historical analysis of your daily delays with IDFM.
        </p>
      </motion.div>

      <AnimatedContinueButton
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        onClick={onContinue}
        text="Continue"
      />
    </motion.div>
  );
}
