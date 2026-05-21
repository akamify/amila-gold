"use client";

import React, { useRef, useState, useEffect } from "react";

export default function HeritageSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.log("Autoplay blocked initially, keeping it muted.");
        setIsMuted(true);
        video.muted = true;
      });
    }

    const handleIteration = () => {
      if (video.currentTime < 1) { 
        setIsMuted(true);
        video.muted = true;
      }
    };

    video.addEventListener("timeupdate", handleIteration);
    return () => {
      video.removeEventListener("timeupdate", handleIteration);
    };
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      const newState = !isMuted;
      videoRef.current.muted = newState;
      setIsMuted(newState);
    }
  };

  return (
    // Section padding ko aur kam kiya (`lg:py-12`) taaki height aur compact ho jaye
    <section className="relative py-10 lg:py-12 overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-amber-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-center">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1 lg:col-span-6">
            <div className="mb-3 flex items-center gap-4">
              <span className="h-[1px] w-10 bg-amber-600/50"></span>
              <span className="text-amber-700 uppercase tracking-widest text-xs font-semibold">
                Our Legacy
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-5 leading-[1.15]">
              The Amila <br /> 
              <span className="text-amber-600 italic">Heritage</span> Story
            </h2>
            
            <div className="space-y-3 text-slate-600 text-base leading-relaxed font-light">
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

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-amber-100 flex items-center justify-center text-[9px] font-bold text-amber-800">AM</div>
                ))}
              </div>
              <p className="text-xs text-slate-500 italic">
                Trusted by families for generations.
              </p>
            </div>
          </div>

          {/* Video Visuals */}
          <div className="order-1 lg:order-2 lg:col-span-6 w-full">
            {/* 1. Desktop width ko aur tight kiya (`lg:max-w-xs`) taaki overall volume kam ho jaye */}
            <div className="relative z-10 group lg:max-w-xs mx-auto">
              
              {/* 2. ULTIMATE HEIGHT FIX: Desktop (lg:) par ratio ko seedhe SQUARE (`aspect-square`) kar diya hai.
                     Mobile par yeh `4/5` portrait hi rahegi, par desktop par height kaafi kam ho jayegi aur video ab hide nahi hogi. */}
              <div className="relative aspect-[3/4] lg:aspect-[3/4] w-full rounded-xl overflow-hidden shadow-xl bg-slate-100 transform-gpu will-change-transform border-4 border-white">
                
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  preload="auto"
                  playsInline
                  poster="https://lh3.googleusercontent.com/aida-public/AB6AXuD-2z1dIigqEBYNJuzA_d5P4XiqmlBm3djIsa_mIZxua1FX5wTpi_-_qbCaM85WuFX_NHUr56w868SFwcrRuinbc8xFDx7vB70lXBFpimL4GcJ3Hr2O-GvfuaoDbXzQLU4CrjDAtartUEP19NKHCbYgguWYHs9Y30jspsFgnwvgPah3TisIMry62W8JoUZhTILGObXhlsgDMUQ-sc43-dogRjNw8fiItJnfyUIDrHEo-qJSp9IJbWcRX8vUQNfC28mO9gM9fslOEvo"
                  // 3. Object-cover ensure karta hai ki video stretch na ho aur cut bhi minimize ho height kam karne par.
                  className="w-full h-full object-cover"
                >
                  <source src="jaggery.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Mute/Unmute Control - Chhota aur compact */}
                <button
                  onClick={toggleMute}
                  className="absolute bottom-3 right-3 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all shadow-lg active:scale-90"
                >
                  <span className="material-symbols-outlined !text-lg pointer-events-none">
                    {isMuted ? "volume_off" : "volume_up"}
                  </span>
                </button>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 pointer-events-none" />
              </div>

              {/* Floating Quote - Aur chhota aur compact kiya taaki square frame pe set baithe */}
              <div className="absolute -bottom-3 -left-3 z-20 w-3/4 sm:w-56 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/20">
                <p className="text-slate-800 font-serif text-xs md:text-sm italic leading-snug">
                  “Rooted in the earth, refined for the spirit.”
                </p>
              </div>

              {/* Decorative Frame */}
              <div className="absolute -top-3 -right-3 w-16 h-16 border-t border-r border-amber-200 rounded-tr-xl hidden md:block pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}