export interface ImageData {
  id: string;
  url: string;
  name: string;
  index: number; 
}

export interface SheetPair {
  left: ImageData | null;
  right: ImageData | null;
}

export interface Booklet {
  id: number;
  front: SheetPair[];
  back: SheetPair[];
}

export function impose(images: ImageData[]): Booklet[] {
  const sorted = [...images].sort((a, b) => a.index - b.index);
  if (sorted.length === 0) return [];

  const booklets: Booklet[] = [];
  
  // Find the ranges of booklets needed based on the pages present
  const indices = sorted.map(img => img.index);
  const maxIndex = Math.max(...indices);
  const numBooklets = Math.ceil(maxIndex / 20);

  for (let b = 0; b < numBooklets; b++) {
    const start = b * 20 + 1;
    const end = (b + 1) * 20;
    
    const pagesMap: Record<number, ImageData> = {};
    let hasImagesInThisBooklet = false;
    
    sorted.forEach(img => {
      if (img.index >= start && img.index <= end) {
        pagesMap[img.index] = img;
        hasImagesInThisBooklet = true;
      }
    });

    if (!hasImagesInThisBooklet) continue;

    const frontPairs: SheetPair[] = [
      { left: pagesMap[start + 19] || null, right: pagesMap[start] || null },
      { left: pagesMap[start + 17] || null, right: pagesMap[start + 2] || null },
      { left: pagesMap[start + 15] || null, right: pagesMap[start + 4] || null },
      { left: pagesMap[start + 13] || null, right: pagesMap[start + 6] || null },
      { left: pagesMap[start + 11] || null, right: pagesMap[start + 8] || null },
    ];

    const backPairs: SheetPair[] = [
      { left: pagesMap[start + 9] || null, right: pagesMap[start + 10] || null },
      { left: pagesMap[start + 7] || null, right: pagesMap[start + 12] || null },
      { left: pagesMap[start + 5] || null, right: pagesMap[start + 14] || null },
      { left: pagesMap[start + 3] || null, right: pagesMap[start + 16] || null },
      { left: pagesMap[start + 1] || null, right: pagesMap[start + 18] || null },
    ];

    booklets.push({
      id: b + 1,
      front: frontPairs,
      back: backPairs
    });
  }

  return booklets;
}
