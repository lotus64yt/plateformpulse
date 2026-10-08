"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { WrappedResponse } from "../page";
import { base64ToText, decompressBase64 } from "@/utils/zlib";
import { motion, AnimatePresence } from "framer-motion";
import { ShaderGradientCanvas, ShaderGradient } from "shadergradient";
import { LoaderCircle } from "lucide-react";

const PALETTES = [
  { c1: "ff5005", c2: "dbba95", c3: "d0bce1" },
  { c1: "00d2ff", c2: "3a7bd5", c3: "ffffff" },
  { c1: "ff00cc", c2: "333399", c3: "000000" },
  { c1: "11998e", c2: "38ef7d", c3: "000000" },
  { c1: "fc4a1a", c2: "f7b733", c3: "d0bce1" },
  { c1: "8A2387", c2: "E94057", c3: "F27121" },
];

const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

function WrappedPageContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");
  const [wrapped, setWrapped] = useState<WrappedResponse | null>(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [palette, setPalette] = useState(PALETTES[0]);

  useEffect(() => {
    if (data == null) return;
    try {
      const hash = getHash(data);
      setPalette(PALETTES[hash % PALETTES.length]);

      setWrapped(JSON.parse(base64ToText(decompressBase64(data))));
    } catch (e) {
      console.error("cannot uncompress", e);
    }
  }, [data]);

  const [isFinished, setIsFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!wrapped || !wrapped.scenes || isFinished) return;
    if (currentScene <= wrapped.scenes.length - 1) {
      const timer = setTimeout(() => {
        if (currentScene === wrapped.scenes.length - 1) {
          setIsFinished(true);
        } else {
          setCurrentScene((prev) => prev + 1);
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [currentScene, wrapped, isFinished]);

  const handleNext = () => {
    if (!wrapped || !wrapped.scenes) return;
    if (currentScene < wrapped.scenes.length - 1) {
      setCurrentScene((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My transit stats",
          text: "Look out for you Wrapped on the IDFM network !",
          url: url,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!wrapped) {
    return (
      <div className="flex items-center justify-center w-full h-dvh bg-black text-white">
        <LoaderCircle className="animate-spin text-white size-20" />
      </div>
    );
  }

  const scene = wrapped.scenes[currentScene];
  const shaderUrl = `https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.2&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%23${palette.c1}&color2=%23${palette.c2}&color3=%23${palette.c3}&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=-1.4&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=10&rotationZ=50&shader=defaults&type=plane&uDensity=1.3&uFrequency=5.5&uSpeed=0.4&uStrength=4&uTime=0&wireframe=false`;

  return (
    <div className="w-full h-dvh bg-black flex flex-col items-center justify-center overflow-hidden relative">
      <motion.div
        className="relative w-full h-full overflow-hidden bg-black text-white select-none shadow-2xl"
        onClick={!isFinished ? handleNext : undefined}
        style={{
          cursor: !isFinished ? "pointer" : "default",
          transformOrigin: "center",
        }}
        animate={{
          scale: isFinished ? 0.85 : 1,
          borderRadius: isFinished ? "2.5rem" : "0rem",
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
      >
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
          <ShaderGradientCanvas
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <ShaderGradient control="query" urlString={shaderUrl} />
          </ShaderGradientCanvas>
        </div>

        {/* Cacher les barres si c'est fini pour faire plus "clean" */}
        <AnimatePresence>
          {!isFinished && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-3 left-3 right-3 md:top-6 md:left-6 md:right-6 flex gap-1.5 md:gap-3 z-20"
            >
              {wrapped.scenes.map((s, i) => (
                <div
                  key={s.id}
                  className="h-1 md:h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
                >
                  <motion.div
                    key={
                      i < currentScene
                        ? "past"
                        : i === currentScene
                          ? "current"
                          : "future"
                    }
                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    initial={{ width: i < currentScene ? "100%" : "0%" }}
                    animate={{
                      width:
                        i === currentScene
                          ? "100%"
                          : i < currentScene
                            ? "100%"
                            : "0%",
                    }}
                    transition={
                      i === currentScene
                        ? { duration: 10, ease: "linear" }
                        : { duration: 0 }
                    }
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 1.05 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 max-w-[95%] sm:max-w-xl md:max-w-3xl lg:max-w-4xl"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 12 }}
                className="text-6xl sm:text-7xl md:text-8xl mb-2 drop-shadow-2xl"
              >
                {scene.emoji}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white to-white/70 drop-shadow-lg px-2 leading-tight"
              >
                {scene.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-base sm:text-xl md:text-2xl text-white/90 font-medium leading-snug md:leading-relaxed px-2 md:px-4"
              >
                {scene.subtitle}
              </motion.p>

              {scene.highlight && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ delay: 0.7, type: "spring", bounce: 0.4 }}
                  className="mt-2 sm:mt-4 md:mt-8 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl md:rounded-3xl text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] wrap-break-word max-w-full"
                >
                  {scene.highlight}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
            className="absolute bottom-4 sm:bottom-6 md:bottom-8 z-50 flex flex-col items-center"
          >
            <button
              onClick={handleShare}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-black font-black text-base sm:text-xl uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-transform"
            >
              {copied ? "Copié !" : "Partager"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WrappedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full h-dvh bg-black text-white">
          <p className="animate-pulse text-2xl font-bold">
            Génération de ton Wrapped...
          </p>
        </div>
      }
    >
      <WrappedPageContent />
    </Suspense>
  );
}
