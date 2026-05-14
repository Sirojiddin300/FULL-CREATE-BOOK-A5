import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ImageData } from '@/src/utils/imposition';

interface FileUploaderProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
}

export default function FileUploader({ images, onImagesChange }: FileUploaderProps) {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    let completed = 0;
    const newImagesBatch: ImageData[] = [];

    filesArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const match = file.name.match(/(\d+)/);
        const index = match ? parseInt(match[1], 10) : 0;

        newImagesBatch.push({
          id: Math.random().toString(36).substr(2, 9),
          url,
          name: file.name,
          index
        });
        
        completed++;
        if (completed === filesArray.length) {
          onImagesChange([...images, ...newImagesBatch]);
          // Reset input so same files can be selected again if needed
          if (e.target) e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images, onImagesChange]);

  const removeImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  const clearAll = () => {
    onImagesChange([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-sans font-semibold">Боргузории суратҳо</h3>
        {images.length > 0 && (
          <button 
            onClick={clearAll}
            className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors font-sans"
          >
            Тоза кардан
          </button>
        )}
      </div>

      <label className={cn(
        "group relative flex flex-col items-center justify-center w-full h-32 border border-[#d1cec7] rounded-lg transition-all cursor-pointer",
        "bg-white/50 hover:bg-white hover:border-black",
        "flex"
      )}>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
            <Upload className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
            <div className="text-[11px] text-gray-400 uppercase tracking-widest font-sans leading-tight">
              <span className="text-black font-semibold">Илова кунед</span><br/>ё суратҳоро кашола кунед
            </div>
        </div>
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {images.sort((a, b) => a.index - b.index).map((img) => (
            <div key={img.id} className="group relative aspect-square bg-[#F7F5F2] border border-[#d1cec7] overflow-hidden">
              <img src={img.url} alt={img.name} className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all" />
              <div className="absolute inset-x-0 bottom-0 p-1 bg-black/80 text-[7px] text-white font-mono truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {img.name}
              </div>
              <button 
                onClick={() => removeImage(img.id)}
                className="absolute top-0 right-0 p-1 bg-black text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 20 - images.length) }).map((_, i) => (
            <div key={i} className="aspect-square border border-dashed border-[#d1cec7] bg-white/20 flex items-center justify-center text-gray-300">
              <ImageIcon className="w-3 h-3 opacity-20" />
            </div>
          ))}
        </div>
      )}
      
      {images.length > 0 && (
        <div className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest px-3 py-2 bg-black text-white rounded">
          <div className={cn("w-1.5 h-1.5 rounded-full", images.length === 20 ? "bg-green-400" : "bg-blue-400 animate-pulse")} />
          Боргузорӣ: {images.length} / 20
        </div>
      )}
    </div>
  );
}
