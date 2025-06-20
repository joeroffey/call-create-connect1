
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onRemove?: (index: number) => void;
}

const ImageGallery = ({ images, onRemove }: ImageGalleryProps) => {
  if (!images || images.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/30 rounded-xl p-4 border border-white/10"
    >
      <h3 className="text-sm font-medium text-emerald-300 mb-3">Uploaded Images</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((imageUrl, index) => (
          <div key={index} className="group cursor-pointer relative">
            <div className="bg-gray-700/50 rounded-lg overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-colors">
              <img 
                src={imageUrl} 
                alt={`Uploaded image ${index + 1}`}
                className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
              />
              {onRemove && (
                <button
                  onClick={() => onRemove(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ImageGallery;
