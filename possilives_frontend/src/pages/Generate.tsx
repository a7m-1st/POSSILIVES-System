import React from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaRocket, FaLightbulb, FaMagic } from 'react-icons/fa';
import GenerateForm from '../components/GenerateForm/GenerateForm.tsx';
import PageContainer from '../components/PageContainer/PageContainer.tsx';
import ModernCard from '../components/ModernCard/ModernCard.tsx';

const Generate = () => {
  return (
    <PageContainer
      title="Generate Your Future"
      subtitle="Create personalized future scenarios based on your unique profile"
      background="gradient"
      centerContent={false}
      maxWidth="lg"
    >
      <div className="space-y-8">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ModernCard variant="glass" className="text-center h-full">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaBrain className="text-2xl text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Advanced AI analyzes your personality and habits to create realistic futures
              </p>
            </ModernCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ModernCard variant="glass" className="text-center h-full">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaLightbulb className="text-2xl text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized</h3>
              <p className="text-gray-600 text-sm">
                Every scenario is tailored to your unique traits and aspirations
              </p>
            </ModernCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ModernCard variant="glass" className="text-center h-full">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaRocket className="text-2xl text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inspiring</h3>
              <p className="text-gray-600 text-sm">
                Discover possibilities and gain insights for your future path
              </p>
            </ModernCard>
          </motion.div>
        </div>

        {/* Generation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GenerateForm />
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ModernCard variant="elevated">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
                <FaMagic className="mr-2 text-blue-600" />
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">1</div>
                  <p className="text-gray-700">We analyze your personality traits and habits</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">2</div>
                  <p className="text-gray-700">AI generates personalized future scenarios</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-primary rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">3</div>
                  <p className="text-gray-700">You explore possibilities and gain insights</p>
                </div>
              </div>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default Generate;
