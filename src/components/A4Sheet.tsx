import React from 'react';
import { cn } from '@/src/lib/utils';
import { SheetPair } from '@/src/utils/imposition';

interface A4SheetProps {
  pair: SheetPair;
  id: string;
}

export default function A4Sheet({ pair, id }: A4SheetProps) {
  return (
    <div 
      id={id}
      className={cn(
        "relative bg-white mx-auto overflow-hidden",
        "w-[842px] h-[595px] min-w-[842px]", // A4 Landscape
        "flex flex-row"
      )}
      style={{ printColorAdjust: 'exact' }}
    >
      {/* Left Page (A5) */}
      <div className="flex-1 h-full relative flex items-center justify-center overflow-hidden">
        {pair.left ? (
          <img 
            src={pair.left.url} 
            alt={pair.left.name} 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-gray-100 font-serif italic text-sm">Холӣ</div>
        )}
      </div>

      {/* Right Page (A5) */}
      <div className="flex-1 h-full relative flex items-center justify-center overflow-hidden">
        {pair.right ? (
          <img 
            src={pair.right.url} 
            alt={pair.right.name} 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-gray-100 font-serif italic text-sm">Холӣ</div>
        )}
      </div>
    </div>
  );
}
