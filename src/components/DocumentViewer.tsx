import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    id: string;
    title: string;
    content: string;
    part: string;
    section: string;
    relevanceScore: number;
  };
}

const DocumentViewer = ({ isOpen, onClose, result }: DocumentViewerProps) => {
  const handleExternalOpen = () => {
    // Construct URL to official UK Building Regulations document
    const baseUrl = 'https://www.gov.uk/guidance/building-regulations-guidance';
    let partUrl = baseUrl;
    
    // Map parts to official URLs
    const partUrls: Record<string, string> = {
      'Part A': `${baseUrl}#part-a-structure`,
      'Part B': `${baseUrl}#part-b-fire-safety`,
      'Part C': `${baseUrl}#part-c-site-preparation-and-resistance-to-contaminants-and-moisture`,
      'Part D': `${baseUrl}#part-d-toxic-substances`,
      'Part E': `${baseUrl}#part-e-resistance-to-the-passage-of-sound`,
      'Part F': `${baseUrl}#part-f-ventilation`,
      'Part G': `${baseUrl}#part-g-sanitation-hot-water-safety-and-water-efficiency`,
      'Part H': `${baseUrl}#part-h-drainage-and-waste-disposal`,
      'Part J': `${baseUrl}#part-j-combustion-appliances-and-fuel-storage-systems`,
      'Part K': `${baseUrl}#part-k-protection-from-falling-collision-and-impact`,
      'Part L': `${baseUrl}#part-l-conservation-of-fuel-and-power`,
      'Part M': `${baseUrl}#part-m-access-to-and-use-of-buildings`,
      'Part N': `${baseUrl}#part-n-glazing-safety`,
      'Part P': `${baseUrl}#part-p-electrical-safety`
    };

    if (partUrls[result.part]) {
      partUrl = partUrls[result.part];
    }

    window.open(partUrl, '_blank');
  };

  const formatContent = (content: string) => {
    // Split content into paragraphs and format for better readability
    const paragraphs = content.split(/\n\n|\. (?=[A-Z])/);
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-300 leading-relaxed">
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold text-white mb-2 break-words">
                {result.title}
              </DialogTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs font-medium">
                  {result.part}
                </span>
                <span>Section {result.section}</span>
                <span>Relevance: {Math.round(result.relevanceScore * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExternalOpen}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Official Doc
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Content Section */}
            <div className="prose prose-lg prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed">
                {formatContent(result.content)}
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Related Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-emerald-400">Key Requirements</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Compliance with UK Building Standards</li>
                    <li>• Professional certification required</li>
                    <li>• Regular inspection and maintenance</li>
                    <li>• Documentation and record keeping</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-emerald-400">Additional Resources</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Building Control Body guidance</li>
                    <li>• Professional body standards</li>
                    <li>• Health and safety regulations</li>
                    <li>• Local authority requirements</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                This information is derived from UK Building Regulations guidance
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleExternalOpen}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Official Document
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;