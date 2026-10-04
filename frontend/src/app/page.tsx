"use client";

import { Station } from "@/types/station";
import { useEffect, useState } from "react";

interface StationRes {
  result: Station[];
  total: number;
}

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [lastStation, setLastStation] = useState<string>("");

  useEffect(() => {
    fetch(`/api/stations?last=${lastStation}`)
      .then((res): Promise<StationRes> => {
        return res.json();
      })
      .then((j) => {
        setStations(j.result);
      });
  }, [lastStation]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <input
          value={lastStation}
          onChange={(e) => setLastStation(e.target.value)}
        />
        {stations.map((e, i) => (
          <div key={i}>
            <h1>
              {i} {e.Name}
            </h1>
            <p>{e.Lines}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
