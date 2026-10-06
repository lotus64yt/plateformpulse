"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NextStationSelector, {
  ValidTripStep,
} from "@/components/NextStationSelector";
import IntroScreen from "@/components/IntroScreen";
import DateRangeSelector from "@/components/DateRangeSelector";
import { Loader } from "lucide-react";

interface WrappedData {
  Trip: ValidTripStep[];
  From: string;
  To: string;
}

export default function Home() {
  const [step, setStep] = useState<number>(0);

  const getWrappedData = (): WrappedData => {
    const url = new URL(window.location.href);
    const tripData = url.searchParams.get("trip");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const tripDecoded = JSON.parse(decodeURIComponent(atob(tripData || "")));

    if (to == null || from == null) {
      throw new Error("Invalid date");
    }

    return {
      Trip: tripDecoded,
      To: to,
      From: from,
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      if (search.includes("trip=")) {
        if (search.includes("from=") && search.includes("to=")) {
          setStep(2);
        } else {
          setStep(1);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (step == 3) {
      fetch(`/api/wrapped`, {
        method: "POST",
        body: JSON.stringify(getWrappedData()),
      });
    }
  }, [step]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-900 font-sans min-h-screen">
      <AnimatePresence mode="wait">
        {step == 0 && <IntroScreen onContinue={() => setStep(1)} />}
        {step == 1 && (
          <motion.main
            key="main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16"
          >
            <NextStationSelector onContinue={() => setStep(2)} />
          </motion.main>
        )}
        {step == 2 && (
          <motion.main
            key="main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16"
          >
            <DateRangeSelector onContinue={() => setStep(3)} />
          </motion.main>
        )}
        {step == 3 && (
          <motion.main
            key="main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16"
          >
            <Loader />
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
