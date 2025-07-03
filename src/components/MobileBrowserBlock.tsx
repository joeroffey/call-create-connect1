import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, AlertTriangle } from 'lucide-react';

const MobileBrowserBlock = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 bg-emerald-500/20 rounded-full flex items-center justify-center"
        >
          <Smartphone className="w-12 h-12 text-emerald-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold mb-4 text-white"
        >
          Download the App
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-300 mb-8 leading-relaxed"
        >
          For the best experience, please download our native mobile app. 
          The web version is optimized for desktop use only.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {isIOS && (
            <a
              href="https://apps.apple.com/app/eezybuild"
              className="flex items-center justify-center w-full bg-black text-white py-4 px-6 rounded-xl font-medium transition-all hover:bg-gray-900"
            >
              <Download className="w-5 h-5 mr-3" />
              Download for iPhone
            </a>
          )}

          {isAndroid && (
            <a
              href="https://play.google.com/store/apps/details?id=com.lovable.callcreateconnect"
              className="flex items-center justify-center w-full bg-green-600 text-white py-4 px-6 rounded-xl font-medium transition-all hover:bg-green-700"
            >
              <Download className="w-5 h-5 mr-3" />
              Download for Android
            </a>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"
          >
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 mr-2" />
              <span className="text-amber-300 font-medium">Desktop Users</span>
            </div>
            <p className="text-amber-200 text-sm">
              If you're on a computer, you can access the full version at{' '}
              <span className="font-mono text-amber-100">www.eezybuild.co.uk</span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MobileBrowserBlock;