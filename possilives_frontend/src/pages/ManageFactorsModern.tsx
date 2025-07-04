import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaListUl, FaSave, FaTrash, FaEdit, FaPlus, FaChartBar, FaRedo, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosConfig.ts';
import PersonalityManager from '../components/PersonalityManager/PersonalityManager.tsx';
import PersonalityChart from '../components/PersonalityChart/PersonalityChart.tsx';
import HabitsManager from '../components/HabitsManager/HabitsManager.tsx';
import PageContainer from '../components/PageContainer/PageContainer';
import ModernCard from '../components/ModernCard/ModernCard';
import ModernButton from '../components/ModernButton/ModernButton';

interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface CustomHabit {
  id: string;
  title: string;
  influence: number;
  user_habits_id?: string;
}

interface Habit {
  habit_id: string;
  title: string;
  description: string;
}

interface UserHabit {
  user_habits_id: string;
  impact_rating: number;
  habit: {
    habit_id: string;
    title: string;
    description: string;
  };
}

const ManageFactors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personality');
  
  // Alert state
  const [alert, setAlert] = useState<{type: 'success' | 'danger' | 'info', message: string} | null>(null);
  
  // Personality state
  const [personality, setPersonality] = useState<PersonalityTraits>({
    openness: 5,
    conscientiousness: 5,
    extraversion: 5,
    agreeableness: 5,
    neuroticism: 5
  });
  const [originalPersonality, setOriginalPersonality] = useState<PersonalityTraits | null>(null);
  const [personalityLastUpdate, setPersonalityLastUpdate] = useState<string | null>(null);
  const [canEditPersonality, setCanEditPersonality] = useState(false);
  
  // Habits state
  const [availableHabits, setAvailableHabits] = useState<Habit[]>([]);
  const [userHabits, setUserHabits] = useState<CustomHabit[]>([]);
  const [originalUserHabits, setOriginalUserHabits] = useState<CustomHabit[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const showAlert = (type: 'success' | 'danger' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      // Load user data including personality and habits
      const userResponse = await api.post('/api/users/getUser');
      const userData = userResponse.data;
      
      // Set personality data (use latest personality or defaults)
      if (userData.personalities && userData.personalities.length > 0) {
        const latestPersonality = userData.personalities[userData.personalities.length - 1];
        const personalityData = {
          openness: Math.round((latestPersonality.openness / 10) * 10) / 10,
          conscientiousness: Math.round((latestPersonality.conscientiousness / 10) * 10) / 10,
          extraversion: Math.round((latestPersonality.extraversion / 10) * 10) / 10,
          agreeableness: Math.round((latestPersonality.agreeableness / 10) * 10) / 10,
          neuroticism: Math.round((latestPersonality.neuroticism / 10) * 10) / 10
        };
        setPersonality(personalityData);
        setOriginalPersonality(personalityData);
        setPersonalityLastUpdate(latestPersonality.createdAt);
        
        // Check if user can edit personality (24 hours cooldown)
        const lastUpdate = new Date(latestPersonality.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        setCanEditPersonality(hoursDiff >= 24);
      } else {
        setOriginalPersonality(personality);
        setCanEditPersonality(false);
      }
      
      // Load user habits
      const habitsResponse = await api.get(`/api/habits/userHabits/${userId}`);
      const userHabitsData = habitsResponse.data.map((userHabit: UserHabit) => ({
        id: userHabit.habit.habit_id,
        title: userHabit.habit.title,
        influence: userHabit.impact_rating,
        user_habits_id: userHabit.user_habits_id
      }));
      setUserHabits(userHabitsData);
      setOriginalUserHabits([...userHabitsData]);
      
      // Load available habits
      const availableHabitsResponse = await api.get('/api/habits');
      setAvailableHabits(availableHabitsResponse.data);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      showAlert('danger', 'Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalityChange = (trait: keyof PersonalityTraits, value: number) => {
    setPersonality(prev => ({
      ...prev,
      [trait]: value
    }));
  };

  const savePersonality = async () => {
    try {
      setSaving(true);
      const userId = localStorage.getItem('userId');
      
      await api.put(`/api/users/${userId}/personality`, personality);
      
      setOriginalPersonality(personality);
      setPersonalityLastUpdate(new Date().toISOString());
      setCanEditPersonality(false);
      
      showAlert('success', 'Personality traits updated successfully!');
    } catch (error) {
      console.error('Error saving personality:', error);
      showAlert('danger', 'Failed to save personality changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addHabitFromAvailable = async (habit: Habit) => {
    try {
      const userId = localStorage.getItem('userId');
      
      const response = await api.post('/api/habits/submitHabits', {
        userId: userId,
        habits: [habit.habit_id]
      });
      
      const newHabit: CustomHabit = {
        id: habit.habit_id,
        title: habit.title,
        influence: 5,
        user_habits_id: response.data[0]?.user_habits_id
      };
      
      setUserHabits(prev => [...prev, newHabit]);
      showAlert('success', `Added "${habit.title}" to your habits.`);
    } catch (error) {
      console.error('Error adding habit:', error);
      showAlert('danger', 'Failed to add habit. Please try again.');
    }
  };

  const addCustomHabit = async (title: string, description: string, traits: string[]) => {
    try {
      const userId = localStorage.getItem('userId');
      
      // Create custom habit
      const habitResponse = await api.post('/api/habits/create', {
        title: title,
        description: description,
        personality_traits: traits
      });
      
      // Add to user habits
      const userHabitResponse = await api.post('/api/habits/submitHabits', {
        userId: userId,
        habits: [habitResponse.data.habit_id]
      });
      
      const newHabit: CustomHabit = {
        id: habitResponse.data.habit_id,
        title: title,
        influence: 5,
        user_habits_id: userHabitResponse.data[0]?.user_habits_id
      };
      
      setUserHabits(prev => [...prev, newHabit]);
      showAlert('success', `Created and added "${title}" to your habits.`);
    } catch (error) {
      console.error('Error creating custom habit:', error);
      showAlert('danger', 'Failed to create custom habit. Please try again.');
    }
  };

  const removeHabit = async (id: string) => {
    try {
      const userId = localStorage.getItem('userId');
      
      // Delete from backend
      await api.delete(`/api/habits/deleteHabit/${id}?userId=${userId}`);
      
      // Update state
      setUserHabits(prev => prev.filter(habit => habit.id !== id));
      showAlert('success', 'Habit removed successfully.');
    } catch (error) {
      console.error('Error removing habit:', error);
      showAlert('danger', 'Failed to remove habit. Please try again.');
    }
  };

  const updateHabitInfluence = async (id: string, influence: number) => {
    try {
      const habit = userHabits.find(h => h.id === id);
      if (!habit?.user_habits_id) return;
      
      await api.post('/api/habits/updateImpact', {
        user_habits_id: habit.user_habits_id,
        impact_rating: influence,
      });
      
      // Update in state
      setUserHabits(prev => 
        prev.map(h => h.id === id ? { ...h, influence } : h)
      );
    } catch (error) {
      console.error('Error updating habit influence:', error);
      showAlert('danger', 'Failed to update habit influence. Please try again.');
    }
  };

  const saveHabits = async (habitsToSave: CustomHabit[]) => {
    try {
      setSaving(true);
      
      // Find habits that have changed influence
      const changedHabits = habitsToSave.filter(habit => {
        const original = originalUserHabits.find(oh => oh.id === habit.id);
        return original && original.influence !== habit.influence;
      });

      // Update each changed habit
      for (const habit of changedHabits) {
        if (habit.user_habits_id) {
          await api.post('/api/habits/updateImpact', {
            user_habits_id: habit.user_habits_id,
            impact_rating: habit.influence,
          });
        } else {
          await api.post('/api/habits/create', {
            title: habit.title,
            average_impact: habit.influence
          });
        }
      }

      // Update state
      setUserHabits(habitsToSave);
      setOriginalUserHabits([...habitsToSave]);
      
      showAlert('success', `Successfully updated ${changedHabits.length} habit${changedHabits.length !== 1 ? 's' : ''}.`);
    } catch (error) {
      console.error('Error saving habits:', error);
      showAlert('danger', 'Failed to save habit changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetPersonality = () => {
    if (originalPersonality) {
      setPersonality(originalPersonality);
    }
  };

  const resetHabits = () => {
    setUserHabits([...originalUserHabits]);
  };

  const hasPersonalityChanges = () => {
    if (!originalPersonality) return false;
    return JSON.stringify(personality) !== JSON.stringify(originalPersonality);
  };

  const hasHabitsChanges = () => {
    return JSON.stringify(userHabits) !== JSON.stringify(originalUserHabits);
  };

  if (loading) {
    return (
      <PageContainer
        title="Loading Your Profile..."
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
      title="Manage Your Profile"
      subtitle="View and modify your personality traits and habits"
      background="gradient"
      centerContent={false}
      maxWidth="6xl"
    >
      <div className="space-y-6">
        {/* Alert */}
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ModernCard variant={alert.type === 'success' ? 'default' : 'elevated'} 
              className={`border-l-4 ${
                alert.type === 'success' ? 'border-green-500 bg-green-50' : 
                alert.type === 'danger' ? 'border-red-500 bg-red-50' : 
                'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`mb-0 ${
                  alert.type === 'success' ? 'text-green-800' : 
                  alert.type === 'danger' ? 'text-red-800' : 
                  'text-blue-800'
                }`}>
                  {alert.message}
                </p>
                <button
                  onClick={() => setAlert(null)}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  ×
                </button>
              </div>
            </ModernCard>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernButton
            title={`Personality ${hasPersonalityChanges() ? '•' : ''}`}
            icon={<FaUser />}
            onclick={() => setActiveTab('personality')}
            variant={activeTab === 'personality' ? 'primary' : 'outline'}
            fullWidth={true}
          />
          <ModernButton
            title={`Habits (${userHabits.length}) ${hasHabitsChanges() ? '•' : ''}`}
            icon={<FaListUl />}
            onclick={() => setActiveTab('habits')}
            variant={activeTab === 'habits' ? 'primary' : 'outline'}
            fullWidth={true}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'personality' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Personality Chart */}
            <PersonalityChart 
              personality={personality}
              title="Your Personality Profile Visualization"
            />

            {/* Personality Editing Restriction Notice */}
            {!canEditPersonality && (
              <ModernCard variant="glass" className="border-l-4 border-yellow-500 bg-yellow-50">
                <div className="flex items-start space-x-3">
                  <FaExclamationTriangle className="text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Personality Editing Restricted</h4>
                    <p className="text-yellow-700 text-sm mt-1">
                      You can only edit your personality traits once every 24 hours to maintain consistency.
                      {personalityLastUpdate && (
                        <>
                          <br />
                          Last updated: {new Date(personalityLastUpdate).toLocaleString()}
                        </>
                      )}
                    </p>
                    <div className="mt-3">
                      <ModernButton
                        title="Retake Personality Test"
                        icon={<FaRedo />}
                        onclick={() => navigate('/testbridge')}
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </ModernCard>
            )}

            {/* Personality Manager */}
            <PersonalityManager
              personality={personality}
              onPersonalityChange={handlePersonalityChange}
              title="Adjust Your Personality Traits"
              editable={canEditPersonality}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              {hasPersonalityChanges() && canEditPersonality && (
                <ModernButton
                  title="Reset Changes"
                  onclick={resetPersonality}
                  disabled={saving}
                  variant="outline"
                />
              )}
              <ModernButton
                title={saving ? "Saving..." : canEditPersonality ? "Save Changes" : "Retake Test to Edit"}
                icon={<FaSave />}
                onclick={savePersonality}
                loading={saving}
                disabled={!hasPersonalityChanges() || !canEditPersonality}
                variant="primary"
              />
            </div>

            {/* Personality Insights */}
            <ModernCard variant="default" className="bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FaChartBar className="mr-2" />
                Personality Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p><strong>Highest trait:</strong> {Object.entries(personality).reduce((a, b) => personality[a[0] as keyof PersonalityTraits] > personality[b[0] as keyof PersonalityTraits] ? a : b)[0]}</p>
                  <p><strong>Most balanced:</strong> {Object.entries(personality).find(([_, value]) => value >= 4 && value <= 6)?.[0] || 'None'}</p>
                </div>
                <div>
                  <p><strong>Total traits:</strong> 5 factors measured</p>
                  <p><strong>Profile completeness:</strong> 100%</p>
                </div>
              </div>
            </ModernCard>
          </motion.div>
        )}

        {activeTab === 'habits' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <HabitsManager
              availableHabits={availableHabits}
              customHabits={userHabits}
              onAddHabitFromAvailable={addHabitFromAvailable}
              onAddCustomHabit={addCustomHabit}
              onRemoveHabit={removeHabit}
              onUpdateHabitInfluence={updateHabitInfluence}
              onSaveHabits={saveHabits}
              title="Your Habits"
              showAvailableHabits={true}
              editable={true}
              showSaveControls={true}
            />
            
            {userHabits.length > 0 && (
              <ModernCard variant="default" className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Habits Summary</h4>
                    <p className="text-sm text-gray-600">
                      You have {userHabits.length} habits configured. 
                      Average influence: {(userHabits.reduce((sum, h) => sum + h.influence, 0) / userHabits.length).toFixed(1)}/10
                    </p>
                  </div>
                </div>
              </ModernCard>
            )}
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
};

export default ManageFactors;
