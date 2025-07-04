import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  title: string;
  caption?: string;
  onclick?: (e: any) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

const ModernButton = ({ 
  title, 
  caption, 
  onclick, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true
}: Props) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-blue-500",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 shadow-md hover:shadow-lg focus:ring-gray-500",
    outline: "border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 focus:ring-blue-500",
    gradient: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl focus:ring-pink-500"
  };
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm h-10",
    md: "px-6 py-3 text-base h-12",
    lg: "px-8 py-4 text-lg h-14"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`}
        onClick={onclick}
        disabled={disabled || loading}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {icon && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        {title}
      </motion.button>
      
      {caption && (
        <motion.p 
          className="text-sm text-gray-600 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {caption}
        </motion.p>
      )}
    </div>
  );
};

export default ModernButton;
