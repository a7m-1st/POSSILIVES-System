import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBrain, FaVideo, FaClipboardList, FaUserCheck, FaArrowRight, FaClock, FaShieldAlt } from 'react-icons/fa';
import PageContainer from '../components/PageContainer/PageContainer.tsx';
import ModernCard from '../components/ModernCard/ModernCard.tsx';
import ModernButton from '../components/ModernButton/ModernButton.tsx';

const TestBridge = () => {
  const navigate = useNavigate();

  const personalityOptions = [
    {
      id: 'video',
      title: 'AI Video Analysis',
      subtitle: 'Quick & Innovative',
      description: 'Let our AI analyze your personality through a short video recording. Speak naturally for 2-3 minutes and get instant results.',
      icon: <FaVideo className="text-4xl text-blue-600" />,
      duration: '3 minutes',
      accuracy: 'Experimental',
      features: ['Quick results', 'Natural interaction', 'AI-powered analysis'],
      onClick: () => navigate("/smartpersonality"),
      variant: 'secondary' as const,
      badge: 'Beta'
    },
    {
      id: 'quiz',
      title: 'Big Five Personality Test',
      subtitle: 'Scientific & Comprehensive',
      description: 'Complete the scientifically validated Big Five personality assessment with 50 carefully crafted questions.',
      icon: <FaClipboardList className="text-4xl text-green-600" />,
      duration: '10-15 minutes',
      accuracy: 'Highly Accurate',
      features: ['Scientifically validated', 'Comprehensive analysis', 'Detailed insights'],
      onClick: () => navigate("/big5test"),
      variant: 'primary' as const,
      badge: 'Recommended'
    }
  ];

  return (
    <PageContainer
      title="Choose Your Personality Assessment"
      subtitle="Select the method that works best for you to discover your unique personality traits"
      background="gradient"
      centerContent={false}
      maxWidth="xl"
    >
      <div className="space-y-8">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ModernCard variant="glass">
            <div className="flex items-center justify-center mb-4">
              <FaBrain className="text-4xl text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Personality Assessment</h2>
            </div>
            <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Understanding your personality is the first step to creating a personalized experience. 
              Choose between our innovative AI video analysis or the traditional scientific questionnaire.
            </p>
          </ModernCard>
        </motion.div>

        {/* Assessment Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {personalityOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              {/* Badge */}
              <div className="absolute -top-3 left-6 z-10">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  option.badge === 'Recommended' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {option.badge}
                </span>
              </div>

              <ModernCard 
                variant="elevated" 
                hover={true}
                className="h-full relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  {option.icon}
                </div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-blue-500" />
                      <span>{option.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUserCheck className="mr-2 text-green-500" />
                      <span>{option.accuracy}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <ModernButton
                    title={`Start ${option.title}`}
                    icon={<FaArrowRight />}
                    onclick={option.onClick}
                    variant={option.variant}
                    fullWidth={true}
                  />
                </div>
              </ModernCard>
            </motion.div>
          ))}
        </div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ModernCard variant="glass" className="text-center">
            <div className="flex items-center justify-center mb-3">
              <FaShieldAlt className="text-2xl text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your personality assessment data is encrypted and securely stored. We use this information solely to 
              personalize your experience and never share it with third parties. 
              <a href="#" className="text-blue-600 hover:underline ml-1">
                Learn more about our privacy policy
              </a>
            </p>
          </ModernCard>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default TestBridge;
