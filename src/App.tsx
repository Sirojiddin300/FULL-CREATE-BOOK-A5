import React, { useState, useMemo, useEffect } from 'react';
import { Download, BookOpen, Layers, Printer, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import localforage from 'localforage';
import { cn } from '@/src/lib/utils';
import { ImageData, impose } from '@/src/utils/imposition';
import FileUploader from '@/src/components/FileUploader';
import A4Sheet from '@/src/components/A4Sheet';

export default function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [filename, setFilename] = useState('kitobi_nav_2024');
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');

  // Load images from persistence on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedImages = await localforage.getItem<ImageData[]>('book_images');
        if (savedImages) setImages(savedImages);
      } catch (err) {
        console.error('Failed to load images:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save images to persistence on change
  const handleImagesChange = async (newImages: ImageData[]) => {
    setImages(newImages);
    try {
      await localforage.setItem('book_images', newImages);
    } catch (err) {
      console.error('Failed to save images:', err);
    }
  };

  const booklets = useMemo(() => impose(images), [images]);

  const handleExport = async (section: 'front' | 'back') => {
    if (images.length === 0) return;
    setIsExporting(true);

    try {
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      let isFirstPage = true;
      for (const booklet of booklets) {
        const sheets = section === 'front' ? booklet.front : booklet.back;

        for (let i = 0; i < sheets.length; i++) {
          const sheetId = `sheet-b${booklet.id}-${section}-${i}`;
          const element = document.getElementById(sheetId);
          if (element) {
            const canvas = await html2canvas(element, {
              scale: 3, 
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              imageTimeout: 0,
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            if (!isFirstPage) pdf.addPage();
            isFirstPage = false;
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          }
        }
      }

      pdf.save(`${filename}_${section}.pdf`);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#000000', '#60A5FA']
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Хатогӣ дар вақти содирот.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col font-serif text-[#1a1a1a]">
      {/* Editorial Header */}
      <header className="h-16 border-b border-[#d1cec7] px-8 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center text-white font-bold italic text-xl">A4</div>
          <h1 className="text-2xl tracking-tight font-light hidden sm:block">Созандаи <span className="font-bold border-b border-black">Китоб</span></h1>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center bg-white border border-[#d1cec7] rounded-md px-3 py-1.5 shadow-sm">
            <label className="text-[10px] uppercase tracking-widest text-gray-400 mr-3 font-sans">Номи файл:</label>
            <input 
              type="text" 
              value={filename} 
              onChange={(e) => setFilename(e.target.value)}
              className="bg-transparent border-none text-sm outline-none w-32 font-sans font-medium"
            />
          </div>
          <button 
            disabled={images.length === 0 || isExporting}
            onClick={() => handleExport(activeTab)}
            className="bg-[#1a1a1a] text-white px-6 py-2 text-[11px] font-medium hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest flex items-center gap-2"
          >
            {isExporting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-3 h-3" />}
            Боргирии PDF
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-full md:w-72 border-r border-[#d1cec7] bg-white/30 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar">
          <section className="mb-10">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-6 font-sans font-semibold">Танзимоти Варақ</h3>
            <div className="space-y-4 font-sans text-sm">
              <div className="flex justify-between border-b border-[#e5e3de] pb-2">
                <span className="text-gray-500">Формат</span>
                <span className="font-medium">A4 (210x297мм)</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e3de] pb-2">
                <span className="text-gray-500">Миқдор</span>
                <span className="font-medium">20 Саҳифа</span>
              </div>
              <div className="flex justify-between border-b border-[#e5e3de] pb-2">
                <span className="text-gray-500">Ҷойгиршавӣ</span>
                <span className="font-medium italic">2x A5</span>
              </div>
            </div>
          </section>

          <section className="flex-1 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400 space-y-4">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-widest">Боргузории маълумот...</p>
              </div>
            ) : (
              <FileUploader images={images} onImagesChange={handleImagesChange} />
            )}
          </section>

          <section className="mt-8 pt-8 border-t border-[#d1cec7]">
            <div className="p-4 border border-dashed border-[#d1cec7] rounded-lg bg-white/40">
              <p className="text-[10px] text-gray-400 leading-relaxed font-sans uppercase tracking-wider text-center">
                {images.length === 20 
                  ? "Ҳамаи 20 сурат бомуваффақият боргузорӣ шуд" 
                  : `Боз ${20 - images.length} сурат лозим аст (0001 - 0020)`}
              </p>
            </div>
          </section>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#efedeb] overflow-hidden">
          {/* Tabs Bar */}
          <div className="flex px-8 py-4 bg-white/20 border-b border-[#d1cec7] gap-8">
            <button
              onClick={() => setActiveTab('front')}
              className={cn(
                "text-xs uppercase tracking-[0.3em] font-bold pb-1 transition-all border-b-2",
                activeTab === 'front' ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              Рӯйи китоб
            </button>
            <button
              onClick={() => setActiveTab('back')}
              className={cn(
                "text-xs uppercase tracking-[0.3em] font-bold pb-1 transition-all border-b-2",
                activeTab === 'back' ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              Пушти китоб
            </button>
          </div>

          {/* Canvas Scroll Area */}
          <div className="flex-1 p-8 overflow-y-auto scroll-smooth custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col items-center gap-12 max-w-4xl mx-auto"
              >
                {booklets.map((booklet) => (
                  <div key={booklet.id} className="w-full space-y-12">
                    {booklets.length > 1 && (
                      <div className="border-b border-[#d1cec7] pb-2 mb-4">
                        <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold">Китобчаи №{booklet.id} (Саҳифаҳои {(booklet.id-1)*20 + 1}-{booklet.id*20})</h3>
                      </div>
                    )}
                    {(activeTab === 'front' ? booklet.front : booklet.back).map((pair, idx) => (
                      <div key={idx} className="w-full border border-gray-200">
                        <A4Sheet
                          id={`sheet-b${booklet.id}-${activeTab}-${idx}`}
                          pair={pair}
                        />
                      </div>
                    ))}
                  </div>
                ))}

                {images.length === 0 && (
                  <div className="h-[400px] flex flex-col items-center justify-center text-gray-300 space-y-6">
                    <BookOpen className="w-16 h-16 opacity-10" />
                    <p className="font-serif italic text-lg opacity-40">Барои пешнамоиш суратҳоро боргузорӣ кунед...</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="h-10 bg-[#1a1a1a] text-white/50 text-[9px] flex items-center px-8 uppercase tracking-[0.2em] justify-between font-sans shrink-0">
        <span className="hidden sm:inline">Тартиб: 20-1, 18-3, 16-5... / 10-11, 8-13, 6-15...</span>
        <span className="mx-auto sm:mx-0">© 2026 Системаи Чопи Китоб — Editorial Edition</span>
      </footer>
    </div>
  );
}
