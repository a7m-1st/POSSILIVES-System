import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Tab, Tabs, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaUser, FaListUl, FaSave, FaTrash, FaEdit, FaPlus, FaChartBar, FaRedo } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosConfig.ts';
import PersonalityManager from '../components/PersonalityManager/PersonalityManager.tsx';
import PersonalityChart from '../components/PersonalityChart/PersonalityChart.tsx';
import HabitsManager from '../components/HabitsManager/HabitsManager.tsx';
import '../components/FactorsManager.css';

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
  const navigate = useNavigate();  const [activeTab, setActiveTab] = useState('personality');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validatingHabit, setValidatingHabit] = useState(false);
  
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
  
  // Alert state
  const [alert, setAlert] = useState<{type: 'success' | 'danger' | 'info', message: string} | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

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
        
        // Check if personality test was taken recently (within last 7 days)
        const testDate = new Date(latestPersonality.createdAt);
        const daysSinceTest = Math.floor((Date.now() - testDate.getTime()) / (1000 * 60 * 60 * 24));
        setCanEditPersonality(daysSinceTest <= 7);
      } else {
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
  const showAlert = (type: 'success' | 'danger' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };
  const handleHabitValidationError = (error: any, habitTitle: string) => {
    if (error.response?.data?.type === 'validation_error') {
      const errorData = error.response.data;
      const errorMessage = errorData.error || 'Habit validation failed';
      const suggestion = errorData.suggestion;
      
      // Categorize different types of validation errors
      let displayMessage = '';
      let alertType: 'danger' | 'info' = 'danger';
      
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        displayMessage = `🔄 "${habitTitle}" is already in your habits or very similar to an existing habit.`;
        alertType = 'info';
      } else if (errorMessage.toLowerCase().includes('nsfw') || errorMessage.toLowerCase().includes('inappropriate')) {
        displayMessage = `🚫 "${habitTitle}" contains inappropriate content and cannot be added.`;
      } else if (errorMessage.toLowerCase().includes('too short') || errorMessage.toLowerCase().includes('invalid')) {
        displayMessage = `📝 "${habitTitle}" doesn't meet the requirements for a valid habit.`;
      } else {
        displayMessage = `❌ "${habitTitle}" could not be added: ${errorMessage}`;
      }
      
      if (suggestion) {
        displayMessage += `\n\n💡 Suggestion: ${suggestion}`;
      }
      
      showAlert(alertType, displayMessage);
    } else if (error.response?.data?.message) {
      // Handle other API errors
      showAlert('danger', `⚠️ Failed to add "${habitTitle}": ${error.response.data.message}`);
    } else if (error.response?.status === 500) {
      // Server error
      showAlert('danger', `🔧 Server error while adding "${habitTitle}". The validation service might be temporarily unavailable. Please try again.`);
    } else if (error.response?.status === 404) {
      // API endpoint not found
      showAlert('danger', `🔗 API endpoint not found. Please contact support if this persists.`);
    } else {
      // Generic error
      showAlert('danger', `❌ Failed to add "${habitTitle}". Please check your connection and try again.`);
    }
  };

  const handlePersonalityChange = (trait: keyof PersonalityTraits, value: number) => {
    setPersonality(prev => ({ ...prev, [trait]: value }));
  };
  const savePersonality = async () => {
    if (!canEditPersonality) {
      showAlert('info', 'Please retake the personality test to update your traits.');
      return;
    }
    
    try {
      setSaving(true);
      const userId = localStorage.getItem('userId');
      
      // Convert 1-10 scale back to percentage
      const personalityData = {
        openness: personality.openness * 10,
        conscientiousness: personality.conscientiousness * 10,
        extraversion: personality.extraversion * 10,
        agreeableness: personality.agreeableness * 10,
        neuroticism: personality.neuroticism * 10
      };
      
      await api.put(`/api/users/${userId}/personality`, personalityData);
      setOriginalPersonality(personality);
      showAlert('success', 'Personality traits updated successfully!');
    } catch (error) {
      console.error('Error saving personality:', error);
      showAlert('danger', 'Failed to save personality traits. Please try again.');
    } finally {
      setSaving(false);
    }
  };  const addHabitFromAvailable = async (habit: Habit) => {
    if (!userHabits.find(h => h.id === habit.habit_id)) {
      try {
        setValidatingHabit(true);
        const userId = localStorage.getItem('userId');
        
        // Add habit to user's habits
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
        showAlert('success', `✅ Successfully added "${habit.title}" to your habits.`);
      } catch (error: any) {
        console.error('Error adding habit:', error);
        handleHabitValidationError(error, habit.title);
      } finally {
        setValidatingHabit(false);
      }
    }
  };  const addCustomHabit = async (title: string, description: string, traits: string[]) => {
    try {
      setValidatingHabit(true);
      
      // Format traits for API
      const formattedTraits = traits.map(trait => ({
        trait: trait
      }));

      // First create the habit
      const habitResponse = await api.post('/api/habits', {
        title: title,
        description: description || `Custom habit: ${title}`,
        traits: formattedTraits
      });
      
      // Then add it to user's habits
      const userId = localStorage.getItem('userId');
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
      showAlert('success', `✅ Successfully created and added "${title}" to your habits.`);
    } catch (error: any) {
      console.error('Error creating custom habit:', error);
      handleHabitValidationError(error, title);
    } finally {
      setValidatingHabit(false);
    }
  };

  const removeHabit = async (id: string) => {
    try {
      const userId = localStorage.getItem('userId');
      
      // Delete from backend
      await api.delete(`/api/habits/deleteHabit/${id}?userId=${userId}`);
      
      // Remove from state
      setUserHabits(prev => prev.filter(h => h.id !== id));
      showAlert('success', 'Habit removed successfully.');
    } catch (error) {
      console.error('Error removing habit:', error);
      showAlert('danger', 'Failed to remove habit. Please try again.');
    }
  };  const updateHabitInfluence = async (id: string, influence: number) => {
    // This function is now only called for immediate updates when not using save controls
    try {
      const habit = userHabits.find(h => h.id === id);
      if (habit?.user_habits_id) {
        // Update in backend with impact tracking
        await api.post('/api/habits/updateImpact', {
          user_habits_id: habit.user_habits_id,
          impact_rating: influence,
          average_impact: influence // Using the same value for simplicity
        });
        
        showAlert('success', `Updated influence for "${habit.title}" to ${influence}/10`);
      }
      
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
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={10}>
            <div className="manage-factors-header mb-4">
              <h1>Manage Factors Profile</h1>
              <p className="lead">View and modify your personality traits and habits</p>
            </div>            {validatingHabit && (
              <Alert variant="info" className="mb-3">
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  🔍 Validating habit with AI... Please wait while we check if this habit is appropriate and not a duplicate.
                </div>
              </Alert>
            )}

            {alert && (
              <Alert variant={alert.type} dismissible onClose={() => setAlert(null)} className="alert-enhanced">
                <div style={{ whiteSpace: 'pre-line' }}>
                  {alert.message}
                </div>
              </Alert>
            )}

            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'personality')}
              className="mb-4"
            >              {/* Personality Tab */}
              <Tab eventKey="personality" title={
                <span>
                  <FaUser className="me-2" />
                  Personality
                  {hasPersonalityChanges() && <span className="badge bg-warning ms-2">•</span>}
                </span>
              }>
                <Row>
                  <Col>
                    {/* Personality Chart Visualization */}
                    <PersonalityChart 
                      personality={personality}
                      title="Your Personality Profile Visualization"
                    />

                    {/* Personality Restriction Notice */}
                    {!canEditPersonality && (
                      <Alert variant="info" className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Personality Editing Restricted</strong>
                            <br />
                            <small>
                              {personalityLastUpdate 
                                ? `Last test taken: ${new Date(personalityLastUpdate).toLocaleDateString()}. You can only edit personality traits within 7 days of taking the test.`
                                : 'No personality test found. Please take the test first to set your personality traits.'
                              }
                            </small>
                          </div>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => navigate('/testbridge')}
                          >
                            <FaRedo className="me-1" />
                            Retake Test
                          </Button>
                        </div>
                      </Alert>
                    )}

                    {/* Editable Personality Manager */}
                    <PersonalityManager
                      personality={personality}
                      onPersonalityChange={handlePersonalityChange}
                      readOnly={!canEditPersonality}
                      title={canEditPersonality ? "Adjust Your Personality Traits" : "Your Current Personality Traits (Read-Only)"}
                    />
                      <div className="d-flex gap-2 justify-content-between">
                      <Button
                        variant="outline-primary"
                        onClick={() => navigate('/testbridge')}
                      >
                        <FaRedo className="me-2" />
                        Retake Personality Test
                      </Button>
                      
                      <div className="d-flex gap-2">
                        {hasPersonalityChanges() && canEditPersonality && (
                          <Button
                            variant="outline-secondary"
                            onClick={resetPersonality}
                            disabled={saving}
                          >
                            Reset Changes
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          onClick={savePersonality}
                          disabled={saving || !hasPersonalityChanges() || !canEditPersonality}
                        >
                          {saving ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <FaSave className="me-2" />
                              {canEditPersonality ? 'Save Changes' : 'Retake Test to Edit'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Personality Insights */}
                    <Card className="mt-4 bg-light">
                      <Card.Body>
                        <h6><FaChartBar className="me-2" />Personality Summary</h6>
                        <div className="row">
                          <div className="col-md-6">
                            <small className="text-muted">
                              <strong>Highest Trait:</strong> {
                                Object.entries(personality).reduce((a, b) => 
                                  personality[a[0] as keyof PersonalityTraits] > personality[b[0] as keyof PersonalityTraits] ? a : b
                                )[0].charAt(0).toUpperCase() + 
                                Object.entries(personality).reduce((a, b) => 
                                  personality[a[0] as keyof PersonalityTraits] > personality[b[0] as keyof PersonalityTraits] ? a : b
                                )[0].slice(1)
                              } ({Math.max(...Object.values(personality))}/10)
                            </small>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">
                              <strong>Average Score:</strong> {(Object.values(personality).reduce((a, b) => a + b, 0) / 5).toFixed(1)}/10
                            </small>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              {/* Habits Tab */}
              <Tab eventKey="habits" title={
                <span>
                  <FaListUl className="me-2" />
                  Habits ({userHabits.length})
                  {hasHabitsChanges() && <span className="badge bg-warning ms-2">•</span>}
                </span>
              }>
                <Row>
                  <Col>                    <HabitsManager
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
                      <Card className="bg-light">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">Habits Summary</h6>
                              <small className="text-muted">
                                You have {userHabits.length} habits configured. 
                                Average influence: {(userHabits.reduce((sum, h) => sum + h.influence, 0) / userHabits.length).toFixed(1)}/10
                              </small>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default ManageFactors;
