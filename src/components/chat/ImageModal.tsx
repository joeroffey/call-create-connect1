
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    url: string;
    title: string;
    source: string;
  }>;
}

const ImageModal = ({ isOpen, onClose, images }: ImageModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  if (!images || images.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Building Regulations Reference Images
                </h3>
                <p className="text-sm text-gray-400">
                  {images.length} image{images.length > 1 ? 's' : ''} found
                </p>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Image Display */}
            <div className="flex flex-col lg:flex-row h-96 lg:h-[500px]">
              {/* Main Image */}
              <div className="flex-1 relative bg-gray-800 flex items-center justify-center">
                <img
                  src={images[selectedImageIndex]?.url}
                  alt={images[selectedImageIndex]?.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                <div className="absolute top-4 right-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Zoom
                  </Button>
                </div>
              </div>

              {/* Image Thumbnails (if multiple) */}
              {images.length > 1 && (
                <div className="w-full lg:w-48 p-4 border-t lg:border-t-0 lg:border-l border-gray-700">
                  <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-full">
                    {images.map((image, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-shrink-0 w-20 h-20 lg:w-full lg:h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                          index === selectedImageIndex
                            ? 'border-blue-500'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image Info */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">
                    {images[selectedImageIndex]?.title}
                  </h4>
                  <p className="text-sm text-gray-400">
                    Source: {images[selectedImageIndex]?.source}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                  onClick={() => {
                    // Create download link
                    const link = document.createElement('a');
                    link.href = images[selectedImageIndex]?.url;
                    link.download = `building-regulation-${selectedImageIndex + 1}.png`;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
