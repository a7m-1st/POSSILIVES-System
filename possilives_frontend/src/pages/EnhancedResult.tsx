import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBrain, FaVideo, FaArrowRight, FaChartLine, FaEye, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import PageContainer from "../components/PageContainer/PageContainer.tsx";
import ModernCard from "../components/ModernCard/ModernCard.tsx";
import ModernButton from "../components/ModernButton/ModernButton.tsx";
import { getTraitDescription } from "../utils/big5Scoring.ts";
import { 
  WeightedPersonalityResults, 
  combinePersonalityResults, 
  generateCombinedInsights,
  getTraitComparison,
  parseVideoAnalysisResults
} from "../utils/personalityCombination.ts";

const EnhancedResult = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<WeightedPersonalityResults | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = () => {
    try {
      // First check for combined results
      const combinedResults = sessionStorage.getItem("CombinedPersonalityResult");
      if (combinedResults) {
        const parsed = JSON.parse(combinedResults);
        setResults(parsed);
        setInsights(generateCombinedInsights(parsed));
        return;
      }

      // Check for Big 5 and Video results to combine
      const big5Results = sessionStorage.getItem("Big5TestResult");
      const videoResults = sessionStorage.getItem("VideoAnalysisResult");
      
      if (big5Results && videoResults) {
        const big5 = JSON.parse(big5Results);
        const video = parseVideoAnalysisResults(JSON.parse(videoResults));
        
        if (video) {
          const combined = combinePersonalityResults(big5, video);
          setResults(combined);
          setInsights(generateCombinedInsights(combined));
          
          // Store combined results for future use
          sessionStorage.setItem("CombinedPersonalityResult", JSON.stringify(combined));
          return;
        }
      }

      // Fallback to single results
      const singleResults = sessionStorage.getItem("Big5Result");
      if (singleResults) {
        const parsed = JSON.parse(singleResults);
        if (Array.isArray(parsed) && parsed.length === 5) {
          const fallbackResults: WeightedPersonalityResults = {
            openness: parsed[0],
            conscientiousness: parsed[1],
            extraversion: parsed[2],
            agreeableness: parsed[3],
            neuroticism: parsed[4],
            source: 'big5-only',
            big5Weight: 1.0,
            videoWeight: 0.0
          };
          setResults(fallbackResults);
        }
      }
    } catch (error) {
      console.error("Error loading personality results:", error);
    }
  };

  const proceedToHabits = () => {
    navigate("/newhabits");
  };

  const retakeVideoTest = () => {
    navigate("/smartpersonality");
  };

  if (!results) {
    return (
      <PageContainer
        title="Loading Results"
        subtitle="Preparing your personality assessment"
        background="gradient"
        centerContent={true}
        maxWidth="lg"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your personality assessment...</p>
        </div>
      </PageContainer>
    );
  }

  const traits = [
    { key: 'openness', label: 'Openness', icon: <FaEye />, color: 'blue' },
    { key: 'conscientiousness', label: 'Conscientiousness', icon: <FaCheckCircle />, color: 'green' },
    { key: 'extraversion', label: 'Extraversion', icon: <FaBrain />, color: 'purple' },
    { key: 'agreeableness', label: 'Agreeableness', icon: <FaBrain />, color: 'pink' },
    { key: 'neuroticism', label: 'Neuroticism', icon: <FaBrain />, color: 'orange' }
  ];

  return (
    <PageContainer
      title="Your Personality Results"
      subtitle={results.source === 'combined' ? "Comprehensive AI-Enhanced Assessment" : "Personality Assessment Complete"}
      background="gradient"
      centerContent={false}
      maxWidth="xl"
    >
      <div className="space-y-8">
        {/* Results Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ModernCard variant="glass" className="text-center">
            <div className="flex items-center justify-center mb-4">
              {results.source === 'combined' ? (
                <div className="flex items-center">
                  <FaBrain className="text-3xl text-blue-600 mr-2" />
                  <span className="text-2xl text-gray-400">+</span>
                  <FaVideo className="text-3xl text-purple-600 ml-2" />
                </div>
              ) : (
                <FaBrain className="text-4xl text-blue-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {results.source === 'combined' 
                ? "Combined Personality Assessment Complete!" 
                : "Personality Assessment Complete!"}
            </h2>
            <p className="text-gray-600 mb-4">
              {results.source === 'combined' 
                ? `Your results combine scientific questionnaire analysis (${Math.round(results.big5Weight * 100)}%) with AI behavioral analysis (${Math.round(results.videoWeight * 100)}%) for the most comprehensive personality profile possible.`
                : "Based on your responses, here's your unique personality profile. Each trait is scored from 0-100."}
            </p>
            
            {results.source === 'combined' && (
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>Big 5 Test ({Math.round(results.big5Weight * 100)}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span>Video Analysis ({Math.round(results.videoWeight * 100)}%)</span>
                </div>
              </div>
            )}
          </ModernCard>
        </motion.div>

        {/* Personality Traits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {traits.map((trait, index) => {
            const score = results[trait.key as keyof WeightedPersonalityResults] as number;
            const description = getTraitDescription(trait.key, score);
            const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-blue-600';
            const bgColor = score >= 70 ? 'bg-green-100' : score >= 40 ? 'bg-yellow-100' : 'bg-blue-100';
            
            return (
              <motion.div
                key={trait.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <ModernCard hover={true} className="h-full">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{trait.label}</h3>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${bgColor} mb-3`}>
                      <span className={`text-2xl font-bold ${color}`}>{score}</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <motion.div
                      className={`h-3 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{description}</p>
                  
                  {/* Show comparison if combined results */}
                  {results.source === 'combined' && results.breakdown && (
                    <div className="border-t pt-3">
                      <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center w-full justify-center"
                      >
                        <FaInfoCircle className="mr-1" />
                        {showComparison ? 'Hide' : 'Show'} Method Comparison
                      </button>
                      
                      <AnimatePresence>
                        {showComparison && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 text-xs text-gray-500"
                          >
                            <div className="flex justify-between">
                              <span>Big 5:</span>
                              <span>{results.breakdown.big5[trait.key as keyof typeof results.breakdown.big5]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Video:</span>
                              <span>{results.breakdown.video[trait.key as keyof typeof results.breakdown.video]}</span>
                            </div>
                            <p className="mt-1 italic">
                              {getTraitComparison(
                                trait.label, 
                                results.breakdown.big5[trait.key as keyof typeof results.breakdown.big5],
                                results.breakdown.video[trait.key as keyof typeof results.breakdown.video]
                              )}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </ModernCard>
              </motion.div>
            );
          })}
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ModernCard variant="elevated">
              <div className="flex items-center mb-4">
                <FaChartLine className="text-2xl text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Assessment Insights</h3>
              </div>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.1) }}
                    className="text-gray-600 leading-relaxed flex items-start"
                  >
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    {insight}
                  </motion.p>
                ))}
              </div>
            </ModernCard>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          {results.source !== 'combined' && (
            <ModernButton
              title="Take Video Assessment"
              icon={<FaVideo />}
              onclick={retakeVideoTest}
              variant="secondary"
              size="lg"
            />
          )}
          
          <ModernButton
            title="Continue to Habit Selection"
            icon={<FaArrowRight />}
            onclick={proceedToHabits}
            variant="primary"
            size="lg"
          />
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default EnhancedResult;
