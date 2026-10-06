import { Station } from "@/types/station";
import { cn } from "@/utils/lib";
import { useEffect, useState } from "react";
import ContinueButton from "./ContinueButton";
import { Line } from "@/types/line";
import { Calendar } from "./ui/calendar";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

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
        return {
          from: new Date(parseInt(fromParam, 10)),
          to: new Date(parseInt(toParam, 10)),
        };
      }
    }
    return {
      from: addDays(endDate, -7),
      to: endDate,
    };
  });

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
      window.history.replaceState(null, "", url.toString());
    }
  }, [dateRange]);

  return (
    <div className="flex flex-col w-full gap-3 items-center text-white">
      <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-extrabold tracking-tighter leading-[1.1]">
        Select the range for the stats:
      </h1>

      <Calendar
        mode="range"
        defaultMonth={dateRange?.to}
        selected={dateRange}
        onSelect={setDateRange}
        numberOfMonths={1}
        className="dark rounded-lg border w-[80%]"
      />

      <ContinueButton
        onClick={onContinue}
        disabled={((): boolean => {
          if (
            dateRange?.from == null ||
            dateRange.to == null ||
            dateRange?.from >= dateRange.to
          )
            return true;
          return false;
        })()}
        pophover={"Oep"}
      />
    </div>
  );
}
