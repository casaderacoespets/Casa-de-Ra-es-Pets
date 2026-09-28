import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ImageZoomModal: React.FC = () => {
  const { zoomedImage, setZoomedImage } = useStore();

  useEffect(() => {
    if (!zoomedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [zoomedImage, setZoomedImage]);

  if (!zoomedImage) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none"
        id="image-zoom-modal-container"
        role="dialog"
        aria-modal="true"
        aria-label="Visualização ampliada da imagem"
      >
        {/* Backdrop Overlay (Click/Touch outside to close) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => setZoomedImage(null)}
          aria-hidden="true"
        />

        {/* Close Button Top-Right of Viewport */}
        <button
          type="button"
          onClick={() => setZoomedImage(null)}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 text-white border border-white/20 shadow-2xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer flex items-center justify-center"
          aria-label="Fechar visualização da imagem"
          title="Fechar (ESC)"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Modal Content Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center justify-center max-w-[95vw] max-h-[90vh] pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Image with strict aspect ratio preservation */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/40 pointer-events-auto flex items-center justify-center">
            <img
              src={zoomedImage.src}
              alt={zoomedImage.alt || 'Imagem do produto'}
              referrerPolicy="no-referrer"
              className="max-w-[95vw] max-h-[82vh] sm:max-h-[85vh] w-auto h-auto object-contain rounded-2xl"
            />
          </div>

          {/* Optional Title Label Pill */}
          {zoomedImage.title && (
            <div className="mt-3 px-4 py-1.5 bg-black/60 border border-white/15 text-white text-xs sm:text-sm font-semibold rounded-full backdrop-blur-md shadow-lg pointer-events-auto text-center max-w-[90vw] truncate">
              {zoomedImage.title}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
