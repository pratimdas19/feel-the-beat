
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100]"
        >
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-full shadow-[0px_10px_40px_rgba(0,0,0,0.4)] border-2
            ${type === 'success' 
              ? 'bg-brand-cream border-brand-green text-brand-blue' 
              : 'bg-brand-cream border-brand-red text-brand-red'}
          `}>
            {type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-brand-green" />
            ) : (
              <XCircle className="w-6 h-6 text-brand-red" />
            )}
            
            <span className="font-bold uppercase tracking-wide text-sm">
              {message}
            </span>

            <button 
              onClick={onClose}
              className="ml-2 hover:bg-black/5 rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
