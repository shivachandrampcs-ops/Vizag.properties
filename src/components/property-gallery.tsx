"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export function PropertyGallery({
  images,
}: {
  images: { url: string; alt: string }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
        <ImageIcon className="h-12 w-12" />
      </div>
    );
  }

  const main = images[activeIndex];
  const sideImages = images.slice(1, 5);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setActiveIndex(0);
            setLightbox(true);
          }}
          className="md:col-span-2 md:row-span-2 relative aspect-[16/10] md:aspect-auto md:h-full rounded-2xl overflow-hidden bg-slate-100 group"
        >
          <Image
            src={main.url}
            alt={main.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-xs font-medium">
            1 / {images.length}
          </div>
        </button>
        {sideImages.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveIndex(i + 1);
              setLightbox(true);
            }}
            className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 group hidden md:block"
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-semibold">
                +{images.length - 5} more
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(false);
            }}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
            }}
            className="absolute left-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
            }}
            className="absolute right-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            className="relative w-full max-w-5xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
