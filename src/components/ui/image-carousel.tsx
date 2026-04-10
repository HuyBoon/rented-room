'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  trigger?: React.ReactNode;
  className?: string;
}

export function ImageCarousel({ 
  images, 
  trigger,
  className = '' 
}: ImageCarouselProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!images || images.length === 0) return null;

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(true);
      }}
      className={`absolute top-3 right-3 bg-white/90 backdrop-blur-md hover:bg-white border-0 shadow-lg rounded-xl z-20 group transition-all duration-300 ${className}`}
    >
      <ZoomIn className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
      <span className="font-bold text-xs uppercase tracking-wider">Xem {images.length} ảnh</span>
    </Button>
  );

  return (
    <>
      {trigger || defaultTrigger}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] md:h-[80vh] p-0 border-0 bg-slate-950/95 backdrop-blur-2xl overflow-hidden rounded-3xl shadow-2xl">
          <DialogHeader className="absolute top-6 left-6 right-6 z-50 flex flex-row items-center justify-between pointer-events-none">
            <DialogTitle className="text-white font-bold tracking-tight text-xl pointer-events-auto">
              Thư viện hình ảnh
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10 rounded-full h-10 w-10 pointer-events-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>
          
          <div className="relative h-full flex flex-col items-center justify-center p-4">
            <Carousel setApi={setApi} className="w-full max-w-4xl">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index} className="flex items-center justify-center">
                    <div className="relative aspect-[16/10] w-full group">
                      <img
                        src={image}
                        alt={`Ảnh phòng ${index + 1}`}
                        className="w-full h-full object-contain overflow-hidden rounded-2xl"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="left-[-60px] bg-white/10 hover:bg-white text-white hover:text-slate-900 border-0 h-12 w-12" />
                <CarouselNext className="right-[-60px] bg-white/10 hover:bg-white text-white hover:text-slate-900 border-0 h-12 w-12" />
              </div>
            </Carousel>
            
            {/* Thumbnails Navigation */}
            <div className="absolute bottom-10 left-0 right-0 px-6">
              <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      index === current 
                        ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500' 
                        : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img src={image} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <p className="text-center text-slate-400 text-xs font-bold mt-6 uppercase tracking-[0.2em]">
                {current + 1} / {images.length}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
