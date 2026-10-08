import { Station } from "@/types/station";
import { cn } from "@/utils/lib";
import { useEffect, useState, useMemo } from "react";
import ContinueButton from "./ContinueButton";
import { Line } from "@/types/line";
import { Calendar } from "./ui/calendar";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";

export default function DateRangeSelector({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const today = new Date();
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get("from");
      const toParam = params.get("to");
      if (fromParam && toParam) {
        const fromDate = new Date(parseInt(fromParam, 10));
        const toDate = new Date(parseInt(toParam, 10));
        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
          return {
            from: fromDate,
            to: toDate,
          };
        }
      }
    }
    return {
      from: addDays(endDate, -7),
      to: endDate,
    };
  });

  const [days, setDays] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const daysParam = params.get("days");
      if (daysParam) {
        return daysParam
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n) && n >= 0 && n <= 6);
      }
    }
    return [1, 2, 3, 4, 5];
  });

  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const slotsParam = params.get("slots");
        if (slotsParam) {
          try {
            const parsed = JSON.parse(slotsParam);
            if (Array.isArray(parsed)) return parsed;
          } catch (e) {}
        }
      }
      return [
        { start: "08:00", end: "09:00" },
        { start: "17:00", end: "18:00" },
      ];
    },
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (dateRange?.from && dateRange?.to) {
        url.searchParams.set("from", dateRange.from.getTime().toString());
        url.searchParams.set("to", dateRange.to.getTime().toString());
      } else {
        url.searchParams.delete("from");
        url.searchParams.delete("to");
      }

      if (days.length > 0) {
        url.searchParams.set("days", days.join(","));
      } else {
        url.searchParams.delete("days");
      }

      if (timeSlots.length > 0) {
        url.searchParams.set("slots", JSON.stringify(timeSlots));
      } else {
        url.searchParams.delete("slots");
      }

      window.history.replaceState(null, "", url.toString());
    }
  }, [dateRange, days, timeSlots]);

  const toggleDay = (day: number) => {
    setDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(),
    );
  };

  const updateTimeSlot = (
    index: number,
    field: "start" | "end",
    value: string,
  ) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start: "12:00", end: "13:00" }]);
  };

  const weekDays = [
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
    { label: "Sun", value: 0 },
  ];

  const availableDays = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return new Set([0, 1, 2, 3, 4, 5, 6]);
    }
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 6) {
      return new Set([0, 1, 2, 3, 4, 5, 6]);
    }
    
    const daysSet = new Set<number>();
    let current = new Date(dateRange.from);
    while (current <= dateRange.to) {
      daysSet.add(current.getDay());
      current.setDate(current.getDate() + 1);
    }
    return daysSet;
  }, [dateRange]);

  useEffect(() => {
    setDays((prev) => {
      const filtered = prev.filter((d) => availableDays.has(d));
      if (filtered.length !== prev.length) return filtered;
      return prev;
    });
  }, [availableDays]);

  const filteredWeekDays = weekDays.filter(d => availableDays.has(d.value));



  return (
    <div className="flex flex-col w-full gap-6 items-center text-white pb-20">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] text-center">
        When do you commute?
      </h1>

      <Calendar
        mode="range"
        defaultMonth={dateRange?.to}
        selected={dateRange}
        onSelect={setDateRange}
        numberOfMonths={1}
        className="dark rounded-lg border w-full max-w-[350px] bg-zinc-900"
      />

      <div className="w-full max-w-[350px] flex flex-col gap-2">
        <label className="font-semibold text-lg">Days of the week</label>
        <div className="flex gap-2 justify-between">
          {filteredWeekDays.map((d) => (
            <button
              key={d.value}
              onClick={() => toggleDay(d.value)}
              className={cn(
                "w-10 h-10 rounded-md flex items-center justify-center font-medium transition-colors border",
                days.includes(d.value)
                  ? "bg-zinc-100 border-zinc-100 text-black"
                  : "border-zinc-600 text-zinc-400 hover:border-zinc-400",
              )}
            >
              {d.label[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-[350px] flex flex-col gap-3">
        <label className="font-semibold text-lg">Time Periods</label>
        {timeSlots.map((slot, i) => (
          <div
            key={i}
            className="flex gap-2 items-center bg-zinc-800 p-3 rounded-lg border border-zinc-700"
          >
            <input
              type="time"
              value={slot.start}
              onChange={(e) => updateTimeSlot(i, "start", e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white flex-1"
            />
            <span>to</span>
            <input
              type="time"
              value={slot.end}
              onChange={(e) => updateTimeSlot(i, "end", e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white flex-1"
            />
            <button
              onClick={() => removeTimeSlot(i)}
              className="text-red-400 p-2 hover:bg-zinc-700 rounded-md transition-colors"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        <button
          onClick={addTimeSlot}
          className="flex items-center justify-center gap-2 border border-dashed border-zinc-600 rounded-lg p-3 text-zinc-400 hover:text-white hover:border-zinc-400 transition-colors"
        >
          <PlusIcon /> Add Time Period
        </button>
      </div>

      <ContinueButton
        onClick={onContinue}
        disabled={((): boolean => {
          if (
            dateRange?.from == null ||
            dateRange.to == null ||
            dateRange?.from >= dateRange.to ||
            days.length === 0 ||
            timeSlots.length === 0
          )
            return true;
          return false;
        })()}
        pophover={
          "Make sure to select dates, days, and at least one time period"
        }
      />
    </div>
  );
}
