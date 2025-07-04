import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient';
  className?: string;
  animate?: boolean;
  hover?: boolean;
};

const ModernCard = ({ 
  children, 
  title, 
  subtitle, 
  variant = 'default', 
  className = '',
  animate = true,
  hover = true
}: Props) => {
  const baseClasses = "rounded-2xl transition-all duration-300";
  
  const variantClasses = {
    default: "bg-white border border-gray-200 shadow-lg hover:shadow-xl",
    glass: "bg-white/30 backdrop-blur-lg border border-white/20 shadow-xl",
    elevated: "bg-white shadow-2xl hover:shadow-3xl border-0",
    gradient: "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 shadow-lg hover:shadow-xl"
  };

  const hoverClass = hover ? "hover:scale-[1.02] hover:-translate-y-1" : "";

  const cardContent = (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className} p-6`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-600 text-sm">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );

  if (!animate) {
    return cardContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {cardContent}
    </motion.div>
  );
};

export default ModernCard;
