
import React from 'react';
import { motion } from 'framer-motion';

interface ImageGalleryProps {
  images: Array<{ url: string; title: string; source: string; }>;
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  if (!images || images.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/30 rounded-xl p-4 border border-white/10"
    >
      <h3 className="text-sm font-medium text-emerald-300 mb-3">Related Images</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((image, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="bg-gray-700/50 rounded-lg overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-colors">
              <img 
                src={image.url} 
                alt={image.title}
                className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="p-2">
                <p className="text-xs text-white font-medium truncate">{image.title}</p>
                <p className="text-xs text-gray-400 truncate">{image.source}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ImageGallery;
