import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaRunning, FaBook, FaCoffee, FaMusic, FaSearch, FaCheck, FaPlus, FaStar, FaBrain, FaSort, FaTimes } from "react-icons/fa";
import { api } from "../api/axiosConfig.ts";
import PageContainer from "../components/PageContainer/PageContainer.tsx";
import ModernCard from "../components/ModernCard/ModernCard.tsx";
import ModernButton from "../components/ModernButton/ModernButton.tsx";
import { 
  getPersonalizedHabitRecommendations, 
  getUserPersonalityTraits, 
  getPersonalityInsights,
  HabitWithScore,
  PersonalityTraits 
} from "../utils/habitRecommendations.ts";

type Habit = {
  habit_id: string;
  title: string;
  description: string;
  traits?: Array<{ trait: string }>;
};

const SelectHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<Habit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTraits | null>(null);
  const [sortBy, setSortBy] = useState<'recommended' | 'alphabetical'>('recommended');
  const [showPersonalityInsights, setShowPersonalityInsights] = useState(false);
    // New habit suggestion modal state
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitDescription, setNewHabitDescription] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);  const [submittingNewHabit, setSubmittingNewHabit] = useState(false);
  const [newlyCreatedHabitId, setNewlyCreatedHabitId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const navigate = useNavigate();
  
  const personalityTraitsList = [
    'OPENNESS',
    'CONSCIENTIOUSNESS', 
    'EXTRAVERSION',
    'AGREEABLENESS',
    'NEUROTICISM'
  ];
  useEffect(() => {
    loadHabits();
    loadPersonalityTraits();
  }, []);

  const loadHabits = async () => {
    try {
      const response = await api.get("/api/habits");
      setHabits(response.data);
    } catch (error) {
      console.error("Error loading habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalityTraits = async () => {
    try {
      const traits = await getUserPersonalityTraits();
      if (traits) {
        setPersonalityTraits(traits);
        setShowPersonalityInsights(true);
      }
    } catch (error) {
      console.error("Error loading personality traits:", error);
    }
  };

  const getSortedAndFilteredHabits = (): HabitWithScore[] => {
    let filteredHabits = habits.filter(habit =>
      habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      habit.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (personalityTraits && sortBy === 'recommended') {
      return getPersonalizedHabitRecommendations(filteredHabits, personalityTraits, filteredHabits.length);
    } else {
      // Convert to HabitWithScore format for consistency
      return filteredHabits
        .map(habit => ({ ...habit, personalityScore: 0, matchReasons: [] }))
        .sort((a, b) => a.title.localeCompare(b.title));
    }
  };

  const sortedHabits = getSortedAndFilteredHabits();

  const handleHabitToggle = (habit: Habit) => {
    setSelectedHabits(prev => {
      const isSelected = prev.some(h => h.habit_id === habit.habit_id);
      if (isSelected) {
        return prev.filter(h => h.habit_id !== habit.habit_id);
      } else {
        return [...prev, habit];
      }
    });
  };

  const submitHabits = async () => {
    if (selectedHabits.length === 0) {
      alert("Please select at least one habit to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const userId = localStorage.getItem("userId");
      const habitIds = selectedHabits.map(habit => habit.habit_id);

      await api.post("/api/habits/submitHabits", { 
        habits: habitIds, 
        userId: userId 
      });

      console.log("Habits submitted successfully");
      navigate("/home");
    } catch (error) {
      console.error("Error submitting habits:", error);
      alert("Failed to save habits. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const getHabitIcon = (title: string) => {
    const iconMap = {
      'exercise': <FaRunning className="text-green-500" />,
      'reading': <FaBook className="text-blue-500" />,
      'meditation': <FaHeart className="text-purple-500" />,
      'music': <FaMusic className="text-pink-500" />,
      'coffee': <FaCoffee className="text-orange-500" />
    };
    
    const key = Object.keys(iconMap).find(k => title.toLowerCase().includes(k));
    return key ? iconMap[key] : <FaHeart className="text-gray-500" />;
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const handleSuggestNewHabit = async () => {
    if (!newHabitTitle.trim()) return;

    setSubmittingNewHabit(true);
    try {
      const userId = localStorage.getItem('userId');
      
      // Format traits for API
      const formattedTraits = selectedTraits.map(trait => ({
        trait: trait
      }));

      // First create the habit
      const habitResponse = await api.post('/api/habits', {
        title: newHabitTitle.trim(),
        description: newHabitDescription.trim() || `Custom habit: ${newHabitTitle.trim()}`,
        traits: formattedTraits
      });
      
      // Then add it to user's habits
      const userHabitResponse = await api.post('/api/habits/submitHabits', {
        userId: userId,
        habits: [habitResponse.data.habit_id]
      });
      
      // Add to local state
      const newHabit: Habit = {
        habit_id: habitResponse.data.habit_id,
        title: newHabitTitle.trim(),
        description: newHabitDescription.trim() || `Custom habit: ${newHabitTitle.trim()}`,
        traits: formattedTraits
      };
        setHabits(prev => [...prev, newHabit]);
      setSelectedHabits(prev => [...prev, newHabit]);
      setNewlyCreatedHabitId(newHabit.habit_id);
      
      // Reset modal state
      setNewHabitTitle("");
      setNewHabitDescription("");
      setSelectedTraits([]);
      setShowSuggestModal(false);
        // Clear the highlight after 3 seconds
      setTimeout(() => setNewlyCreatedHabitId(null), 3000);
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
    } catch (error) {
      console.error('Error creating habit:', error);
      alert('Failed to create habit. Please try again.');
    } finally {
      setSubmittingNewHabit(false);
    }
  };

  const closeSuggestModal = () => {
    setShowSuggestModal(false);
    setNewHabitTitle("");
    setNewHabitDescription("");
    setSelectedTraits([]);
  };

  if (loading) {
    return (
      <PageContainer
        title="Loading Habits..."
        background="gradient"
        centerContent={true}
      >
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Choose Your Habits"
      subtitle="Select the habits that resonate with you to get personalized insights"
      background="gradient"
      centerContent={false}
      maxWidth="xl"
    >
      <div className="space-y-8">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ModernCard variant="glass" className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Build Your Habit Profile
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Habits are automated response patterns that shape your daily life. 
              Select the ones that best represent your current lifestyle and aspirations.
            </p>
          </ModernCard>
        </motion.div>        {/* Personality Insights */}
        {personalityTraits && showPersonalityInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ModernCard variant="gradient" className="text-center">
              <div className="flex items-center justify-center mb-4">
                <FaBrain className="text-3xl text-primary mr-3" />
                <h3 className="text-xl font-bold text-primary">Personalized for You</h3>
              </div>
              <p className="text-primary/90 mb-4">
                {getPersonalityInsights(personalityTraits).motivationalMessage}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {getPersonalityInsights(personalityTraits).dominantTraits.map(trait => (
                  <span 
                    key={trait}
                    className="px-3 py-1 bg-white/20 text-primary rounded-full text-sm font-medium"
                  >
                    High {trait}
                  </span>
                ))}
              </div>
            </ModernCard>
          </motion.div>        )}

        {/* Success Message */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <ModernCard variant="default" className="border-green-200 bg-green-50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FaCheck className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-green-800 font-medium">Habit Created Successfully!</h4>
                    <p className="text-green-700 text-sm">Your new habit has been added to your selection and is ready for use.</p>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="md:col-span-2">
            <ModernCard variant="default">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search habits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </ModernCard>
          </div>

          {/* Sort Options */}
          <div>
            <ModernCard variant="default">
              <div className="flex items-center space-x-2">
                <FaSort className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recommended' | 'alphabetical')}
                  className="w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!personalityTraits}
                >
                  <option value="recommended">Recommended</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </ModernCard>
          </div>

          {/* Stats */}
          <div>
            <ModernCard variant="glass" className="text-center">
              <div className="text-2xl font-bold text-gray-900">{selectedHabits.length}</div>
              <div className="text-sm text-gray-600">Selected</div>
            </ModernCard>
          </div>
        </div>        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>            {sortedHabits.map((habit, index) => {
              const isSelected = selectedHabits.some(h => h.habit_id === habit.habit_id);
              const showPersonalityScore = personalityTraits && sortBy === 'recommended' && habit.personalityScore > 0;
              const isNewlyCreated = newlyCreatedHabitId === habit.habit_id;
              
              return (
                <motion.div
                  key={habit.habit_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <motion.div
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected ? "scale-105" : "hover:scale-102"
                    }`}
                    onClick={() => handleHabitToggle(habit)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >                    <ModernCard 
                      variant={isSelected ? "gradient" : "default"}
                      hover={!isSelected}
                      className={`h-full relative overflow-hidden ${
                        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
                      } ${isNewlyCreated ? "ring-2 ring-green-400 ring-offset-2 shadow-lg" : ""}`}
                    >
                      {/* New Habit Badge */}
                      {isNewlyCreated && (
                        <div className="absolute top-3 left-3 flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium z-10">
                          <FaPlus className="w-3 h-3" />
                          <span>New!</span>
                        </div>
                      )}

                      {/* Personality Score Badge */}
                      {showPersonalityScore && !isNewlyCreated && (
                        <div className="absolute top-3 left-3 flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          <FaStar className="w-3 h-3" />
                          <span>{habit.personalityScore}%</span>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                        >
                          <FaCheck className="text-blue-600 text-sm" />
                        </motion.div>
                      )}

                      <div className="space-y-3 pt-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getHabitIcon(habit.title)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold mb-2 ${
                              isSelected ? "text-primary" : "text-gray-900"
                            }`}>
                              {habit.title}
                            </h3>
                            <p className={`text-sm leading-relaxed ${
                              isSelected ? "text-primary/90" : "text-gray-600"
                            }`}>
                              {habit.description}
                            </p>
                          </div>
                        </div>

                        {/* Personality Match Reasons */}
                        {showPersonalityScore && habit.matchReasons.length > 0 && (
                          <div className={`text-xs space-y-1 ${
                            isSelected ? "text-primary/80" : "text-gray-500"
                          }`}>
                            <div className="font-medium">Why this matches you:</div>
                            {habit.matchReasons.slice(0, 2).map((reason, idx) => (
                              <div key={idx} className="flex items-start space-x-1">
                                <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Hover Effect */}
                      {!isSelected && (
                        <div className="absolute inset-0 bg-blue-50 opacity-0 hover:opacity-20 transition-opacity rounded-xl" />
                      )}
                    </ModernCard>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>        {/* No Results */}
        {sortedHabits.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ModernCard variant="default">
              <p className="text-gray-500 text-lg">No habits found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            </ModernCard>
          </motion.div>
        )}        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="text-sm text-gray-600">
            {personalityTraits && sortBy === 'recommended' && (
              <p className="mb-2">
                <span className="inline-flex items-center space-x-1">
                  <FaBrain className="text-blue-500" />
                  <span>Recommendations based on your personality profile</span>
                </span>
              </p>
            )}            <p>Have a habit not listed? 
              <button 
                onClick={() => setShowSuggestModal(true)}
                className="text-blue-600 hover:text-blue-700 ml-1 font-medium underline bg-transparent border-none cursor-pointer"
              >
                Suggest a new habit
              </button>
            </p>
          </div>

          <div className="flex space-x-4">
            <ModernButton
              title="Skip for now"
              onclick={() => navigate("/home")}
              variant="outline"
              fullWidth={false}
            />
            
            <ModernButton
              title={`Continue with ${selectedHabits.length} habit${selectedHabits.length !== 1 ? 's' : ''}`}
              onclick={submitHabits}
              loading={submitting}
              disabled={selectedHabits.length === 0}
              variant="primary"
              fullWidth={false}
            />          </div>
        </div>

        {/* Suggest New Habit Modal */}
        <AnimatePresence>
          {showSuggestModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.target === e.currentTarget && closeSuggestModal()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <ModernCard variant="default" className="m-0 shadow-none">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Suggest a New Habit</h3>
                    <button
                      onClick={closeSuggestModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    {/* Habit Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Habit Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter habit name (e.g., Daily meditation)"
                        value={newHabitTitle}
                        onChange={(e) => setNewHabitTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSuggestNewHabit()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe your habit and its benefits (optional)"
                        value={newHabitDescription}
                        onChange={(e) => setNewHabitDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        A good description helps you remember why this habit is important to you.
                      </p>
                    </div>

                    {/* Personality Traits */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Associated Personality Traits
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Select which personality traits this habit is most related to:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {personalityTraitsList.map((trait) => (
                          <button
                            key={trait}
                            onClick={() => toggleTrait(trait)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              selectedTraits.includes(trait)
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {trait.charAt(0) + trait.slice(1).toLowerCase()}
                            {selectedTraits.includes(trait) && " ✓"}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        This helps the system understand how this habit relates to your personality and can provide better recommendations.
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <ModernButton
                      title="Cancel"
                      onclick={closeSuggestModal}
                      variant="outline"
                      fullWidth={false}
                    />
                    <ModernButton
                      title="Create Habit"
                      onclick={handleSuggestNewHabit}
                      loading={submittingNewHabit}
                      disabled={!newHabitTitle.trim()}
                      variant="primary"
                      fullWidth={false}
                      icon={<FaPlus />}
                    />
                  </div>
                </ModernCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
};

export default SelectHabits;
