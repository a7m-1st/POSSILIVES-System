import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  background?: 'default' | 'gradient' | 'pattern';
  className?: string;
  centerContent?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
};

const PageContainer = ({ 
  children, 
  title, 
  subtitle, 
  background = 'default',
  className = '',
  centerContent = false,
  maxWidth = 'lg'
}: Props) => {
  const backgroundClasses = {
    default: "bg-gray-50 min-h-screen",
    gradient: "bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen",
    pattern: "bg-gray-50 min-h-screen relative overflow-hidden"
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full"
  };

  const containerClasses = centerContent 
    ? "flex items-center justify-center min-h-screen" 
    : "py-8 md:py-12";

  return (
    <div className={`${backgroundClasses[background]} ${className}`}>
      {background === 'pattern' && (
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      )}
      
      <div className={containerClasses}>
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]} w-full`}>
          {(title || subtitle) && (
            <motion.div 
              className="text-center mb-8 md:mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {title && (
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                  Welcome To <br/>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Possilives
                  </span>
                </h1>
              )}
              {subtitle && (
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {subtitle}
                </p>
              )}
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
