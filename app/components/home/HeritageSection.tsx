"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

export default function HeritageSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsMobile(true);
      return;
    }
    const media = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isMobile !== false) return;

    // Desktop autoplay only to avoid mobile decode/startup cost.
    video.muted = true;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Browser block karega agar user interaction nahi hui
        console.log("Autoplay with audio blocked, muting for initial play.");
        setIsMuted(true);
        video.muted = true;
      });
    }

    // 2. Auto-mute after first completion
    const handleVideoEnd = () => {
      setIsMuted(true);
      video.muted = true;
      // loop attribute hone ke bawajud ye trigger ho sakta hai 
      // ya hum timeupdate se bhi track kar sakte hain
    };

    // Zyada reliable tarika: Jab video wapas start ho (loop)
    const handleIteration = () => {
      if (video.currentTime < 1) { 
        setIsMuted(true);
        video.muted = true;
      }
    };

    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("timeupdate", handleIteration);

    return () => {
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("timeupdate", handleIteration);
    };
  }, [isMobile]);

  const toggleMute = () => {
    if (videoRef.current) {
      const newState = !isMuted;
      videoRef.current.muted = newState;
      setIsMuted(newState);
    }
  };

  return (
    <section className="relative py-6 lg:py-28 overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-amber-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-[1px] w-12 bg-amber-600/50"></span>
              <span className="text-amber-700 uppercase tracking-widest text-sm font-semibold">
                Our Legacy
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-8 leading-[1.1]">
              The Amila <br /> 
              <span className="text-amber-600 italic">Heritage</span> Story
            </h2>
            
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-light">
              <p>
                For generations, the fertile riverbanks have whispered secrets of the soil. 
                <strong className="font-semibold text-slate-800"> Amila Gold</strong> was born
                from a desire to preserve these whispers.
              </p>
              <p>
                Our process is a slow-burn labor of love. We avoid the haste of modern 
                industrialization to ensure pure quality.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-800">AM</div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 italic">
                  Trusted by families for generations.
                </p>
            </div>
          </div>

          {/* Video Visuals */}
          <div className="order-1 lg:order-2 lg:col-span-7 relative">
            <div className="relative z-10 group">
              
              {/* Video Container - will-change use kiya hai glitch fix ke liye */}
              <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-100 transform-gpu will-change-transform">
                {isMobile !== false ? (
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-2z1dIigqEBYNJuzA_d5P4XiqmlBm3djIsa_mIZxua1FX5wTpi_-_qbCaM85WuFX_NHUr56w868SFwcrRuinbc8xFDx7vB70lXBFpimL4GcJ3Hr2O-GvfuaoDbXzQLU4CrjDAtartUEP19NKHCbYgguWYHs9Y30jspsFgnwvgPah3TisIMry62W8JoUZhTILGObXhlsgDMUQ-sc43-dogRjNw8fiItJnfyUIDrHEo-qJSp9IJbWcRX8vUQNfC28mO9gM9fslOEvo"
                    alt="Amila heritage"
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 58vw"
                    className="object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="jaggery.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {/* Mute/Unmute Control - Bottom Right */}
                {isMobile === false && (
                  <button
                    onClick={toggleMute}
                    className="absolute bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-all shadow-xl active:scale-90"
                  >
                    <span className="material-symbols-outlined !text-2xl pointer-events-none">
                      {isMuted ? "volume_off" : "volume_up"}
                    </span>
                  </button>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              {/* Floating Quote */}
              <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 z-20 w-3/4 md:w-80 bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-xl border border-white/20">
                <p className="text-slate-800 font-serif text-lg md:text-xl italic leading-snug">
                  “Rooted in the earth, refined for the spirit.”
                </p>
              </div>

              {/* Decorative Frame */}
              <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-amber-200 rounded-tr-3xl hidden md:block pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
