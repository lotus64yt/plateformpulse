import { Station } from "@/types/station";
import { cn } from "@/utils/lib";
import { PlusIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

interface StationRes {
  result: Station[];
  total: number;
}

export default function NextStationSelector() {
  const [showPossibleStation, setShowPossibleStation] =
    useState<boolean>(false);
  const [stations, setStations] = useState<Station[] | null | false>(null);
  const [trip, setTrip] = useState<(Station | null)[]>([null]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchPossibleStation = async (
    lastStationId: string,
  ): Promise<Station[]> => {
    const res = await fetch(`/api/stations?last=${lastStationId}`);

    if (res.status != 200) {
      throw new Error("failed to fetch");
    }

    const json: StationRes = await res.json();
    return json.result;
  };

  useEffect(() => {
    if (stations == null) {
      fetchPossibleStation(trip[trip.length - 2]?.UIDs[0] ?? "").then(
        (list) => {
          setStations(list);
        },
      );
    }
  }, [trip.length]);

  return (
    <div className="w-full">
      {trip.map((station, index) => (
        <div
          key={station?.UIDs[0] ?? `empty-station-${index}`}
          className="relative"
        >
          <div
            className={cn(
              "group relative z-10 flex h-30 w-[90%] rounded-4xl border-2 border-zinc-300",
              !station
                ? "cursor-pointer items-center justify-center border-dashed transition-colors hover:border-blue-500"
                : "border-solid",
            )}
            onClick={() =>
              !station && setShowPossibleStation(!showPossibleStation)
            }
          >
            {!station ? (
              <p className="flex items-center gap-4 text-xl text-white transition-colors group-hover:text-blue-500">
                <PlusIcon /> Press to add a station
              </p>
            ) : (
              <div>
                <p>{station.Name}</p>
                <p>{station.Lines.join(" ")}</p>
              </div>
            )}
          </div>
          {!station && showPossibleStation && (
            <div className="absolute left-0 top-full z-50 mt-2 w-[90%] rounded-2xl bg-zinc-800 p-4 text-white shadow-xl">
              <input
                className="ring rounded-md text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div>
                {stations != null && stations != false ? (
                  stations
                    .filter((s) =>
                      s.Name.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((s, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setTrip((currentTrip) => [
                            ...currentTrip.slice(0, -1),
                            s,
                            null,
                          ]);
                          setStations(null);
                          setShowPossibleStation(false);
                          setSearchQuery("");
                        }}
                      >
                        <p>{s.Name}</p>
                      </div>
                    ))
                ) : (
                  <div>
                    <p>empty</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
