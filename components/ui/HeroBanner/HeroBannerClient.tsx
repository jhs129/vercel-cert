"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroBannerProps } from "./index";
import HeroBannerSlideComponent from "./HeroBannerSlide";

function subscribeToReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export default function HeroBannerClient({
  slides,
  autoPlayInterval = 5000,
  theme = "light",
}: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + count) % count),
    [count]
  );

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % count),
    [count]
  );

  useEffect(() => {
    if (!autoPlayInterval || paused || reducedMotion || count <= 1) return;
    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [autoPlayInterval, paused, reducedMotion, count, next]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  const showControls = count > 1;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero Banner"
      className={cn(
        "relative w-full overflow-hidden",
        theme === "dark" ? "theme-dark" : "theme-light"
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={showControls ? 0 : undefined}
    >
      <div className="relative min-h-[400px] md:min-h-[500px]">
        {slides.map((slide, i) => (
          <HeroBannerSlideComponent
            key={slide.ctaHref || slide.headline}
            {...slide}
            active={i === current}
            priority={i === 0}
          />
        ))}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {showControls ? `Slide ${current + 1} of ${count}` : null}
      </div>

      {showControls && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2"
            aria-label="Carousel slides"
          >
            {slides.map((slide, i) => (
              <button
                key={slide.ctaHref || slide.headline}
                aria-current={i === current ? true : undefined}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1",
                  i === current
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
