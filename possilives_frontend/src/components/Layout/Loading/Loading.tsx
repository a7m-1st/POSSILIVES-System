import React from 'react';
import { motion } from 'framer-motion';
import PageContainer from '../../PageContainer/PageContainer.tsx';

interface LoadingProps {
  loading: boolean;
  fullScreen?: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  loading, 
  fullScreen = true,
  message = "Loading..."
}) => {
  if (!loading) {
    return null;
  }

  if (fullScreen) {
    return (
      <PageContainer
        background="gradient"
        centerContent={true}
        className="fixed inset-0 z-50"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Modern Spinner */}
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Loading Text */}
          <motion.h2
            className="text-2xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.h2>

          {/* Animated dots */}
          <motion.div 
            className="flex justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full"
                animate={{
                  y: [-4, 4, -4],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Subtle subtitle */}
          <motion.p
            className="text-gray-600 text-sm mt-4 opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.75 }}
            transition={{ delay: 0.6 }}
          >
            Please wait while we prepare your experience
          </motion.p>
        </motion.div>
      </PageContainer>
    );
  }

  // Inline loading for smaller components
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center py-8"
    >
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mr-3"></div>
      <span className="text-gray-600 font-medium">{message}</span>
    </motion.div>
  );
};

export default Loading;
