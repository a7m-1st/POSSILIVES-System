import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaMagic, FaUser, FaHeart, FaBrain, FaHandshake, FaEye, FaCoins, FaQuestionCircle } from 'react-icons/fa';
import { api } from '../api/axiosConfig.ts';
import axiosAI from '../api/axiosConfigAI.ts';
import PersonalityManager from '../components/PersonalityManager/PersonalityManager.tsx';
import HabitsManager from '../components/HabitsManager/HabitsManager.tsx';
import PageContainer from '../components/PageContainer/PageContainer.tsx';
import ModernCard from '../components/ModernCard/ModernCard.tsx';
import ModernButton from '../components/ModernButton/ModernButton.tsx';
import Markdown from 'markdown-to-jsx';
import { useNavigate } from 'react-router-dom';

interface CustomHabit {
  id: string;
  title: string;
  influence: number;
}

interface Habit {
  habit_id: string;
  title: string;
  description: string;
}

interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

const Whatif = () => {
  const navigate = useNavigate();
  const [socialCircle, setSocialCircle] = useState('');
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(0);
  const [result, setResult] = useState<{
    description: string;
    imageUrl: string | null;
  } | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Personality traits state
  const [personality, setPersonality] = useState<PersonalityTraits>({
    openness: 5,
    conscientiousness: 5,
    extraversion: 5,
    agreeableness: 5,
    neuroticism: 5
  });

  // Habits state
  const [availableHabits, setAvailableHabits] = useState<Habit[]>([]);
  const [customHabits, setCustomHabits] = useState<CustomHabit[]>([]);

  useEffect(() => {
    fetchCredits();
    loadUserData();
    loadAvailableHabits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await api.post('/api/gens/credits');
      setCredits(response.data.credits_left);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await api.post('/api/users/getUser');
      const userData = response.data;
      
      // Load personality data
      if (userData.personalities && userData.personalities.length > 0) {
        const latestPersonality = userData.personalities[userData.personalities.length - 1];
        setPersonality({
          openness: Math.round((latestPersonality.openness / 10) * 10) / 10,
          conscientiousness: Math.round((latestPersonality.conscientiousness / 10) * 10) / 10,
          extraversion: Math.round((latestPersonality.extraversion / 10) * 10) / 10,
          agreeableness: Math.round((latestPersonality.agreeableness / 10) * 10) / 10,
          neuroticism: Math.round((latestPersonality.neuroticism / 10) * 10) / 10
        });
      }

      // Load habits data
      if (userData.user_habits) {
        const habitsData = userData.user_habits.map((userHabit: any) => ({
          id: userHabit.habit.habit_id,
          title: userHabit.habit.title,
          influence: userHabit.impact_rating
        }));
        setCustomHabits(habitsData);
      }

      // Set social circle if available
      if (userData.social_circle) {
        setSocialCircle(userData.social_circle);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAvailableHabits = async () => {
    try {
      const response = await api.get('/api/habits');
      setAvailableHabits(response.data);
    } catch (error) {
      console.error('Error loading available habits:', error);
    }
  };

  const handlePersonalityChange = (trait: keyof PersonalityTraits, value: number) => {
    setPersonality(prev => ({
      ...prev,
      [trait]: value
    }));
  };

  const addHabitFromAvailable = (habit: Habit) => {
    const newHabit: CustomHabit = {
      id: habit.habit_id,
      title: habit.title,
      influence: 5
    };
    setCustomHabits(prev => [...prev, newHabit]);
  };

  const addCustomHabit = (title: string, description: string, traits: string[]) => {
    const newHabit: CustomHabit = {
      id: `custom-${Date.now()}`,
      title,
      influence: 5
    };
    setCustomHabits(prev => [...prev, newHabit]);
  };

  const removeHabit = (id: string) => {
    setCustomHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const updateHabitInfluence = (id: string, influence: number) => {
    setCustomHabits(prev =>
      prev.map(habit => habit.id === id ? { ...habit, influence } : habit)
    );
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!socialCircle.trim()) {
      newErrors.socialCircle = 'Social circle is required';
    }
    
    if (!notes.trim()) {
      newErrors.notes = 'Please provide some notes about the scenario you want to explore';
    }
    
    if (customHabits.length === 0) {
      newErrors.habits = 'Please select at least one habit';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateScenario = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsGenerating(true);
      
      // Check balance
      const balanceResponse = await api.post('/api/gens/balance');
      if (!balanceResponse.data) {
        alert("Insufficient balance to generate response");
        return;
      }

      const payload = {
        personality_traits: personality,
        habits: customHabits,
        social_circle: socialCircle,
        scenario_notes: notes
      };

      const response = await axiosAI.post('/generate-response', payload);
      
      // Handle response format
      if (typeof response.data === 'string') {
        setResult({
          description: response.data,
          imageUrl: null
        });
      } else {
        setResult({
          description: response.data.response_text || response.data,
          imageUrl: response.data.image_url || null
        });
      }

      // Update credits
      await fetchCredits();
    } catch (error) {
      console.error('Error generating scenario:', error);
      alert('Failed to generate scenario. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveScenario = async () => {
    if (!result) return;
    
    try {
      const userId = localStorage.getItem('userId');
      const generationData = {
        userId: userId,
        description: result.description,
        title: 'What-if Scenario',
        imageLink: result.imageUrl,
        note: notes
      };
      
      await api.post('/api/gens/create', generationData);
      navigate('/gallery');
    } catch (error) {
      console.error('Error saving scenario:', error);
      alert('Failed to save scenario. Please try again.');
    }
  };

  if (result) {
    return (
      <PageContainer
        title="Your What-If Scenario"
        subtitle="Explore the possibilities based on your customized profile"
        background="gradient"
        centerContent={false}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Result Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {result.imageUrl && (
              <ModernCard variant="elevated" className="overflow-hidden">
                <img
                  src={result.imageUrl}
                  alt="Generated Scenario"
                  className="w-full h-64 md:h-96 object-cover"
                />
              </ModernCard>
            )}

            <ModernCard variant="glass">
              <div className="prose prose-lg max-w-none">
                <Markdown 
                  options={{
                    overrides: {
                      h1: { props: { className: 'text-2xl font-bold text-gray-900 mb-4' } },
                      h2: { props: { className: 'text-xl font-semibold text-gray-800 mb-3' } },
                      h3: { props: { className: 'text-lg font-medium text-gray-700 mb-2' } },
                      p: { props: { className: 'text-gray-600 mb-4 leading-relaxed' } },
                      ul: { props: { className: 'list-disc list-inside text-gray-600 mb-4 space-y-1' } },
                      ol: { props: { className: 'list-decimal list-inside text-gray-600 mb-4 space-y-1' } },
                    }
                  }}
                >
                  {result.description}
                </Markdown>
              </div>
            </ModernCard>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <ModernButton
              title="Save to Gallery"
              icon={<FaHeart />}
              onclick={saveScenario}
              variant="primary"
              size="lg"
            />
            
            <ModernButton
              title="Generate Another"
              icon={<FaMagic />}
              onclick={() => setResult(null)}
              variant="outline"
              size="lg"
            />
            
            <ModernButton
              title="Back to Home"
              onclick={() => navigate('/home')}
              variant="outline"
              size="lg"
            />
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="What-If Scenarios"
      subtitle="Explore alternative futures by adjusting your traits and circumstances"
      background="gradient"
      centerContent={false}
      maxWidth="4xl"
    >
      <div className="space-y-8">
        {/* Credits Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ModernCard variant="gradient" className="text-center text-primary">
            <div className="flex items-center justify-center mb-2">
              <FaCoins className="text-2xl mr-3" />
              <span className="text-3xl font-bold">{credits}</span>
            </div>
            <p className="opacity-90">Generation Credits Remaining</p>
          </ModernCard>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ModernCard variant="glass" className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaQuestionCircle className="text-3xl text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Explore Alternative Futures</h2>
            </div>
            <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Customize your personality traits, habits, and circumstances to explore different life paths. 
              See how changes in your profile might lead to different outcomes and opportunities.
            </p>
          </ModernCard>
        </motion.div>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Social Circle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ModernCard variant="elevated">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                Social Circle <span className="text-red-500 ml-1">*</span>
              </h3>
              <input
                type="text"
                placeholder="e.g., Introvert, Social butterfly, Career-focused network"
                value={socialCircle}
                onChange={(e) => setSocialCircle(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.socialCircle ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.socialCircle && (
                <p className="mt-2 text-sm text-red-600">{errors.socialCircle}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Describe your social environment and how you interact with others
              </p>
            </ModernCard>
          </motion.div>

          {/* Personality Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PersonalityManager
              personality={personality}
              onPersonalityChange={handlePersonalityChange}
              title="Adjust Your Personality Traits"
            />
          </motion.div>

          {/* Habits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <HabitsManager
              availableHabits={availableHabits}
              customHabits={customHabits}
              onAddHabitFromAvailable={addHabitFromAvailable}
              onAddCustomHabit={addCustomHabit}
              onRemoveHabit={removeHabit}
              onUpdateHabitInfluence={updateHabitInfluence}
              title="Select and Adjust Habits"
              showAvailableHabits={true}
              editable={true}
            />
            {errors.habits && (
              <p className="mt-2 text-sm text-red-600">{errors.habits}</p>
            )}
          </motion.div>

          {/* Scenario Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ModernCard variant="elevated">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaMagic className="mr-2 text-blue-600" />
                Scenario Notes <span className="text-red-500 ml-1">*</span>
              </h3>
              <textarea
                rows={4}
                placeholder="What scenario would you like to explore? (e.g., 'What if I became more extraverted and focused on fitness habits?', 'How would my life change if I prioritized creativity over stability?')"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                  errors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.notes && (
                <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Describe the specific scenario or life changes you want to explore
              </p>
            </ModernCard>
          </motion.div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <ModernButton
              title={isGenerating ? "Generating Scenario..." : "Generate What-If Scenario"}
              icon={<FaMagic />}
              onclick={generateScenario}
              loading={isGenerating}
              disabled={credits === 0}
              variant="primary"
              size="lg"
            />
            
            {credits === 0 && (
              <p className="mt-3 text-sm text-red-600">
                You have no generation credits remaining. Please contact support to get more credits.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Whatif