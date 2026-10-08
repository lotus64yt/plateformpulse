"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NextStationSelector, {
  ValidTripStep,
} from "@/components/NextStationSelector";
import IntroScreen from "@/components/IntroScreen";
import DateRangeSelector from "@/components/DateRangeSelector";
import { Loader } from "lucide-react";
import { Station } from "@/types/station";

interface TimeSlot {
  start: string;
  end: string;
}

interface WrappedData {
  Trip: ValidTripStep[];
  From: string;
  To: string;
  Days: number[];
  TimeSlots: TimeSlot[];
}

export default function Home() {
  const [step, setStep] = useState<number>(0);

  const getWrappedData = (): WrappedData | null => {
    const url = new URL(window.location.href);
    const tripData = url.searchParams.get("trip");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const daysStr = url.searchParams.get("days");
    const slotsStr = url.searchParams.get("slots");
    
    if (!tripData || !from || !to) {
      return null;
    }

    const days = daysStr ? daysStr.split(",").map(Number).filter(n => !isNaN(n)) : [1, 2, 3, 4, 5];
    let timeSlots: TimeSlot[] = [{ start: "08:00", end: "09:00" }, { start: "17:00", end: "18:00" }];
    
    if (slotsStr) {
      try {
        const parsed = JSON.parse(slotsStr);
        if (Array.isArray(parsed) && parsed.length > 0) timeSlots = parsed;
      } catch (e) {
        console.error("Invalid time slots in URL");
      }
    }

    try {
      const tripDecoded = JSON.parse(decodeURIComponent(atob(tripData)));
      if (!Array.isArray(tripDecoded) || tripDecoded.length === 0) {
        return null;
      }

      const toValidTrip = (trip: Station[]): (ValidTripStep | null)[] => {
        const vTrip: (ValidTripStep | null)[] = [];

        trip.forEach((station, index) => {
          if (index === trip.length - 1) return;
          if (!station || !trip[index + 1]) return;

          const connexions = station.Lines.filter((lineName) =>
            trip[index + 1]?.Lines.includes(lineName),
          );

          if (connexions && connexions.length == 1) {
            vTrip.push({
              from: station.UIDs[0],
              to: trip[index + 1].UIDs[0],
              via: connexions[0],
            });
          } else if (
            station.ChosenVia != null &&
            connexions &&
            connexions.length > station.ChosenVia
          ) {
            vTrip.push({
              from: station.UIDs[0],
              to: trip[index + 1].UIDs[0],
              via: connexions[station.ChosenVia],
            });
          } else {
            vTrip.push(null);
          }
        });

        return vTrip;
      };

      const cleanTrip = tripDecoded.filter((s): s is Station => s !== null);
      const validTrip = toValidTrip(cleanTrip);

      if (validTrip.some(step => step === null) || validTrip.length === 0) {
        return null;
      }

      return {
        Trip: validTrip as ValidTripStep[],
        To: to,
        From: from,
        Days: days,
        TimeSlots: timeSlots,
      };
    } catch (e) {
      console.error("Invalid data in URL", e);
      return null;
    }
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
      const data = getWrappedData();
      if (!data) {
        setStep(0);
        return;
      }
      fetch(`/api/wrapped`, {
        method: "POST",
        body: JSON.stringify(data),
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
