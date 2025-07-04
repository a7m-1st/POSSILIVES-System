import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaCheck, FaBrain, FaChartLine, FaUsers, FaVideo } from "react-icons/fa";
import { api } from "../../api/axiosConfig.ts";
import { calculateBig5Scores, getTraitDescription, Big5Results } from "../../utils/big5Scoring.ts";
import PageContainer from "../PageContainer/PageContainer.tsx";
import ModernCard from "../ModernCard/ModernCard.tsx";
import ModernButton from "../ModernButton/ModernButton.tsx";
import questions from "./questions.js";

export default function Personality() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(50).fill(0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<Big5Results | null>(null);
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const allQuestionsAnswered = answers.every(answer => answer > 0);

  const handleAnswerSelect = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    
    // Auto-advance to next question after a short delay
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateResults = () => {
    const big5Results = calculateBig5Scores(answers);
    setResults(big5Results);
    setShowResults(true);
  };

  const submitResults = async () => {
    if (!results) return;
    
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem("userId");
      
      // Store Big 5 results separately for potential combination
      sessionStorage.setItem("Big5TestResult", JSON.stringify(results));
      
      // Store results in session storage for immediate access
      sessionStorage.setItem("Big5Result", JSON.stringify([
        results.openness,
        results.conscientiousness,
        results.extraversion,
        results.agreeableness,
        results.neuroticism
      ]));

      // Save to backend
      await api.put(`/api/users/${userId}/personality`, {
        openness: results.openness,
        conscientiousness: results.conscientiousness,
        extraversion: results.extraversion,
        agreeableness: results.agreeableness,
        neuroticism: results.neuroticism
      });

      // Navigate to next step
      navigate("/newhabits");
    } catch (error) {
      console.error("Error saving personality results:", error);
      // Navigate anyway to continue the flow
      navigate("/newhabits");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResults && results) {
    return (
      <PageContainer
        title="Your Personality Results"
        subtitle="Discover what makes you unique"
        background="gradient"
        centerContent={false}
        maxWidth="xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Results Overview */}
          <ModernCard variant="glass" className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaBrain className="text-4xl text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Big Five Personality Assessment Complete!</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Based on your responses, here's your unique personality profile. Each trait is scored from 0-100.
            </p>
          </ModernCard>

          {/* Personality Traits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(results).map(([trait, score]) => {
              const traitName = trait.charAt(0).toUpperCase() + trait.slice(1);
              const description = getTraitDescription(trait, score);
              const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-blue-600';
              const bgColor = score >= 70 ? 'bg-green-100' : score >= 40 ? 'bg-yellow-100' : 'bg-blue-100';
              
              return (
                <motion.div
                  key={trait}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * Object.keys(results).indexOf(trait) }}
                >
                  <ModernCard hover={true} className="h-full">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{traitName}</h3>
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
                    
                    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                  </ModernCard>
                </motion.div>
              );
            })}
          </div>

          {/* Smart Test Offer */}
          <ModernCard variant="glass" className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaVideo className="text-3xl text-purple-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Want Even More Accurate Results?</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Take our innovative AI-powered Smart Personality Test to complement your Big 5 results. 
              We'll combine both assessments for the most comprehensive personality profile possible.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>70% Big 5 Test</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span>30% Video Analysis</span>
              </div>
            </div>
          </ModernCard>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
            <ModernButton
              title="Take Smart Personality Test"
              icon={<FaVideo />}
              onclick={() => navigate("/smartpersonality")}
              variant="secondary"
              size="lg"
            />
            <ModernButton
              title="Continue with Current Results"
              icon={<FaArrowRight />}
              onclick={submitResults}
              loading={isSubmitting}
              variant="primary"
              size="lg"
            />
          </div>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Personality Assessment"
      subtitle="Complete the Big Five personality test to understand yourself better"
      background="gradient"
      centerContent={false}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <ModernCard variant="glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Question {currentQuestion + 1} of {questions.length}
            </h3>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </ModernCard>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernCard variant="elevated">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {questions[currentQuestion].question}
                </h2>
                <p className="text-gray-600">
                  How much do you agree with this statement?
                </p>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 1, label: "Strongly Disagree", color: "bg-red-50 hover:bg-red-100 border-red-200" },
                  { value: 2, label: "Disagree", color: "bg-orange-50 hover:bg-orange-100 border-orange-200" },
                  { value: 3, label: "Neutral", color: "bg-gray-50 hover:bg-gray-100 border-gray-200" },
                  { value: 4, label: "Agree", color: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
                  { value: 5, label: "Strongly Agree", color: "bg-green-50 hover:bg-green-100 border-green-200" }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      answers[currentQuestion] === option.value
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : option.color
                    }`}
                    onClick={() => handleAnswerSelect(option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      {answers[currentQuestion] === option.value && (
                        <FaCheck className="text-blue-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </ModernCard>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <ModernButton
            title="Previous"
            icon={<FaArrowLeft />}
            onclick={goToPrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            fullWidth={false}
          />

          <div className="flex space-x-1">
            {questions.slice(0, 10).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  answers[index] > 0
                    ? "bg-green-500"
                    : index === currentQuestion
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
                onClick={() => goToQuestion(index)}
              />
            ))}
            {questions.length > 10 && (
              <>
                <span className="text-gray-400">...</span>
                {questions.slice(-5).map((_, index) => {
                  const actualIndex = questions.length - 5 + index;
                  return (
                    <button
                      key={actualIndex}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        answers[actualIndex] > 0
                          ? "bg-green-500"
                          : actualIndex === currentQuestion
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                      onClick={() => goToQuestion(actualIndex)}
                    />
                  );
                })}
              </>
            )}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <ModernButton
              title="View Results"
              icon={<FaChartLine />}
              onclick={calculateResults}
              disabled={!allQuestionsAnswered}
              variant="primary"
              fullWidth={false}
            />
          ) : (
            <ModernButton
              title="Next"
              icon={<FaArrowRight />}
              onclick={goToNext}
              disabled={currentQuestion === questions.length - 1}
              variant="outline"
              fullWidth={false}
            />
          )}
        </div>

        {/* Completion Status */}
        {!allQuestionsAnswered && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Please answer all questions to see your results ({answers.filter(a => a > 0).length}/{questions.length} completed)
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
