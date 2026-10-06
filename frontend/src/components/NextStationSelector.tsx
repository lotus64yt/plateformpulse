import { Station } from "@/types/station";
import { cn } from "@/utils/lib";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import ContinueButton from "./ContinueButton";
import { Line } from "@/types/line";
import LineBadge from "./LineBadge";
import { Input } from "./ui/input";

interface StationRes {
  result: Station[];
  lines: Line[];
  total: number;
}

export interface ValidTripStep {
  from: string;
  to: string;
  via: string | null | false;
}

export default function NextStationSelector({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const [showPossibleStation, setShowPossibleStation] =
    useState<boolean>(false);
  const [stations, setStations] = useState<Station[] | null | false>(null);
  const [trip, setTrip] = useState<(Station | null)[]>([null]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lines, setLines] = useState<Line[]>([]);
  const [validTrip, setValidTrip] = useState<(ValidTripStep | null)[]>([]);

  const toValidTrip = (trip: Station[]): (ValidTripStep | null)[] => {
    const vTrip: (ValidTripStep | null)[] = [];

    trip.forEach((station, index) => {
      if (index === trip.length - 1) return;

      const connexions = station?.Lines.filter((lineName) =>
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

  const fetchPossibleStation = async (
    lastStationId: string,
  ): Promise<{ stations: Station[]; lines: Line[] }> => {
    const res = await fetch(`/api/stations?last=${lastStationId}`);

    if (res.status != 200) {
      throw new Error("failed to fetch");
    }

    const json: StationRes = await res.json();

    return {
      stations: json.result,
      lines: json.lines,
    };
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tripParam = params.get("trip");
    if (tripParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(tripParam)));
        if (Array.isArray(decoded)) {
          setTrip(decoded);
        }
      } catch (e) {
        console.error("fail to parse url", e);
      }
    }
  }, []);

  useEffect(() => {
    if (stations == null) {
      fetchPossibleStation(trip[trip.length - 2]?.UIDs[0] ?? "").then(
        (list) => {
          setStations(list.stations);
          setLines(list.lines);
        },
      );
    }

    if (trip) {
      setValidTrip(toValidTrip(trip.filter((s): s is Station => s !== null)));

      const url = new URL(window.location.href);
      if (trip.length === 1 && trip[0] === null) {
        if (url.searchParams.has("trip")) {
          url.searchParams.delete("trip");
          window.history.replaceState(null, "", url.toString());
        }
      } else {
        const encoded = btoa(encodeURIComponent(JSON.stringify(trip)));
        if (url.searchParams.get("trip") !== encoded) {
          url.searchParams.set("trip", encoded);
          window.history.replaceState(null, "", url.toString());
        }
      }
    }
  }, [JSON.stringify(trip)]);

  return (
    <div className="flex flex-col w-full gap-3 items-center text-white">
      <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-extrabold tracking-tighter leading-[1.1]">
        Build your trip on the IDFM network:
      </h1>
      {trip.map((station, index) => (
        <div
          key={(station?.UIDs[0] || "") + index}
          className="relative w-[90%]"
        >
          <div
            className={cn(
              "group relative z-10 flex h-30 w-full rounded-4xl border-2 border-zinc-300",
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
              <div className="flex items-center h-full w-full mx-5">
                <div>
                  <h1 className="text-xl text-white font-medium">
                    {station.Name}
                  </h1>
                  <div className="flex b-r cursor-default">
                    {station.Lines.map((lineName, i) => (
                      <LineBadge
                        key={i}
                        line={lines.find((e) => e.Name == lineName)}
                      />
                    ))}
                  </div>
                </div>
                <div className="ml-auto h-[80%]">
                  <Cross1Icon
                    onClick={() => {
                      const nTrip = trip.slice(0, index);
                      nTrip.push(null);
                      setTrip(nTrip);
                    }}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
          {!station && showPossibleStation && (
            <div className="absolute left-0 top-full z-50 mt-2 w-[90%] rounded-2xl bg-zinc-800 p-4 text-white shadow-xl">
              <Input
                autoFocus={true}
                className="ring rounded-md text-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div>
                {stations != null && stations != false ? (
                  stations
                    .filter((s) => {
                      const normalize = (value: string) =>
                        value
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^\p{L}\p{N}]/gu, "")
                          .toLowerCase();

                      return normalize(s.Name).includes(normalize(searchQuery));
                    })
                    .map((s, i) => (
                      <div
                        key={i}
                        className="cursor-pointer"
                        onClick={() => {
                          setTrip((currentTrip) => {
                            const newTrip = [...currentTrip];

                            const replacedIndex = currentTrip.length - 1;
                            newTrip[replacedIndex] = s;
                            newTrip.push(null);

                            if (replacedIndex > 0) {
                              const prevStation = newTrip[replacedIndex - 1];
                              if (prevStation) {
                                newTrip[replacedIndex - 1] = {
                                  ...prevStation,
                                  ChosenVia: undefined,
                                };
                              }
                            }

                            return newTrip;
                          });
                          setStations(null);
                          setShowPossibleStation(false);
                          setSearchQuery("");
                        }}
                      >
                        <p>{s.Name}</p>
                      </div>
                    ))
                    .slice(0, 10)
                ) : (
                  <div>
                    <p>empty</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {trip[index + 1] && station
            ? (() => {
                const connexions = station.Lines.filter((lineName) =>
                  trip[index + 1]?.Lines.includes(lineName),
                );
                const hasValidVia = validTrip[index] != null;
                const chosenViaLine = validTrip[index]?.via;

                return (
                  <div className="flex items-center gap-1 mt-3">
                    <div className="ml-3 h-10 w-0 border border-dashed border-white" />
                    {hasValidVia ? (
                      <p className="ml-2">Via :</p>
                    ) : (
                      <p className="ml-2">Select your connexion :</p>
                    )}
                    <div className="flex gap-1">
                      {connexions.map((lineName, lineIndex) => (
                        <button
                          onClick={() => {
                            if (connexions.length == 1) return;
                            setTrip((currentTrip) =>
                              currentTrip.map((currentStation, stationIndex) =>
                                stationIndex === index && currentStation
                                  ? { ...currentStation, ChosenVia: lineIndex }
                                  : currentStation,
                              ),
                            );
                          }}
                          key={lineIndex}
                          className={cn(
                            connexions.length == 1 ? "" : "cursor-pointer",
                            chosenViaLine === lineName
                              ? "bg-zinc-700 rounded-md"
                              : "",
                          )}
                        >
                          <LineBadge
                            line={lines.find((line) => line.Name === lineName)}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()
            : null}
        </div>
      ))}

      <ContinueButton
        onClick={onContinue}
        disabled={
          trip.filter((t) => t).length < 2 ||
          validTrip.filter((v) => v !== null).length !=
            trip.filter((t) => t).length - 1
        }
        pophover={
          validTrip.filter((v) => v !== null).length !=
          trip.filter((t) => t).length - 1
            ? "Please choose your connexions"
            : "Please put a trip with at least 2 stations"
        }
      />
    </div>
  );
}
