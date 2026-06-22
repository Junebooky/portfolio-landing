"use client";

import { useEffect, useState } from "react";
import { Building2, Landmark, MapPin, Mountain, Route } from "lucide-react";

const travelSlides = [
  {
    label: "Himalaya",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "India",
    src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Pilgrimage Route",
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Desert City",
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Field Notes",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
];

const slidePositions = [
  "left-0 top-3 z-30 h-[300px] w-[78%] opacity-100 scale-100 lg:left-[3%] lg:top-0 lg:h-[340px] lg:w-[50%]",
  "left-[32%] top-[46%] z-40 h-[210px] w-[68%] opacity-100 scale-100 lg:left-[42%] lg:top-[30%] lg:h-[248px] lg:w-[37%]",
  "left-[78%] top-[18%] z-20 h-[250px] w-[58%] opacity-80 scale-95 lg:left-[76%] lg:top-[18%] lg:h-[276px] lg:w-[31%]",
  "left-[118%] top-[18%] z-10 h-[250px] w-[58%] opacity-0 scale-90 lg:left-[112%] lg:top-[18%] lg:h-[276px] lg:w-[31%]",
  "-left-[82%] top-[8%] z-10 h-[280px] w-[66%] opacity-0 scale-90 lg:-left-[44%] lg:top-[8%] lg:h-[306px] lg:w-[38%]",
];

const travelHighlights = [
  {
    title: "Himalaya Trek",
    body: "히말라야 트레킹을 통해 자연과 사람, 지역 생태계의 연결을 관찰",
    icon: Mountain,
  },
  {
    title: "India Journey",
    body: "인도 도시와 시장, 거리에서 산업과 문화의 역동성을 체험",
    icon: Landmark,
  },
  {
    title: "Pilgrimage Route",
    body: "순례의 길 위에서 이동의 의미와 지역 경제의 흐름을 이해",
    icon: Route,
  },
];

export function TravelImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % travelSlides.length);
    }, 1500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[610px] overflow-hidden lg:min-h-[600px]">
      <div className="relative h-[430px] lg:h-[390px]" aria-label="Travel photo carousel">
        {travelSlides.map((slide, index) => {
          const positionIndex =
            (index - activeIndex + travelSlides.length) % travelSlides.length;

          return (
            <article
              key={slide.label}
              className={`absolute overflow-hidden rounded-xl border border-white/22 bg-slate-800 shadow-[0_30px_80px_rgba(2,6,23,0.48)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${slidePositions[positionIndex]}`}
              aria-hidden={positionIndex > 2}
            >
              <div
                className="h-full bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.14) 52%,rgba(2,6,23,0.48)),url(${slide.src})`,
                }}
              />
              <div className="absolute left-5 top-5 inline-flex items-center gap-2 text-sm font-black text-white/88 sm:text-base">
                <MapPin className="h-5 w-5 text-blue-100" aria-hidden="true" />
                {slide.label}
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {travelHighlights.map((item) => (
          <article
            key={item.title}
            className="grid grid-cols-[auto_1fr] gap-4 border border-white/16 bg-white/[0.06] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.24)] backdrop-blur-md"
          >
            <span className="mt-1 grid h-10 w-10 place-items-center rounded-lg border border-white/14 bg-white/[0.06] text-blue-100">
              <item.icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-black text-white">
                {item.title}
              </span>
              <span className="mt-2 block break-keep text-sm font-semibold leading-6 text-slate-200">
                {item.body}
              </span>
            </span>
          </article>
        ))}
      </div>

      <div className="pointer-events-none absolute right-8 top-6 hidden items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-100 backdrop-blur lg:inline-flex">
        <Building2 className="h-4 w-4" aria-hidden="true" />
        Travel Notes
      </div>
    </div>
  );
}
