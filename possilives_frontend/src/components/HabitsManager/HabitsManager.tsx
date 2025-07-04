import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Modal, Badge, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaSave, FaUndo } from 'react-icons/fa';

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

interface HabitsManagerProps {
  availableHabits: Habit[];
  customHabits: CustomHabit[];
  onAddHabitFromAvailable: (habit: Habit) => void;
  onAddCustomHabit: (title: string, description: string, traits: string[]) => void;
  onRemoveHabit: (id: string) => void;
  onUpdateHabitInfluence: (id: string, influence: number) => void;
  onSaveHabits?: (habits: CustomHabit[]) => void;
  title?: string;
  showAvailableHabits?: boolean;
  editable?: boolean;
  showSaveControls?: boolean;
}

const HabitsManager: React.FC<HabitsManagerProps> = ({
  availableHabits,
  customHabits,
  onAddHabitFromAvailable,
  onAddCustomHabit,
  onRemoveHabit,
  onUpdateHabitInfluence,
  onSaveHabits,
  title = "Habits",
  showAvailableHabits = true,
  editable = true,
  showSaveControls = false
}) => {
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [localHabits, setLocalHabits] = useState<CustomHabit[]>([]);
  const [originalHabits, setOriginalHabits] = useState<CustomHabit[]>([]);

  const personalityTraits = [
    'OPENNESS',
    'CONSCIENTIOUSNESS', 
    'EXTRAVERSION',
    'AGREEABLENESS',
    'NEUROTICISM'
  ];

  // Initialize local habits when customHabits changes
  useEffect(() => {
    setLocalHabits([...customHabits]);
    setOriginalHabits([...customHabits]);
  }, [customHabits]);

  const handleLocalInfluenceChange = (id: string, influence: number) => {
    if (!showSaveControls) {
      // If not using save controls, update immediately (existing behavior)
      onUpdateHabitInfluence(id, influence);
      return;
    }

    // Otherwise, just update local state
    setLocalHabits(prev => 
      prev.map(h => h.id === id ? { ...h, influence } : h)
    );
  };

  const hasChanges = () => {
    if (!showSaveControls) return false;
    return JSON.stringify(localHabits) !== JSON.stringify(originalHabits);
  };

  const handleSaveChanges = () => {
    if (onSaveHabits && showSaveControls) {
      onSaveHabits(localHabits);
      setOriginalHabits([...localHabits]);
    }
  };
  const handleResetChanges = () => {
    setLocalHabits([...originalHabits]);
  };

  const habitsToDisplay = showSaveControls ? localHabits : customHabits;

  const handleAddCustomHabit = () => {
    if (newHabitTitle.trim()) {
      onAddCustomHabit(newHabitTitle.trim(), newHabitDescription.trim(), selectedTraits);
      setNewHabitTitle('');
      setNewHabitDescription('');
      setSelectedTraits([]);
      setShowAddHabitModal(false);
    }
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <div className="habits-header">
            <h3>{title}:</h3>
            {editable && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddHabitModal(true)}
                className="add-habit-button"
              >
                <FaPlus /> Add Habit
              </Button>
            )}
          </div>

          {/* Available Habits */}
          {showAvailableHabits && availableHabits.length > 0 && editable && (
            <div className="available-habits mb-3">
              <h6>Available Habits:</h6>              <div className="habits-grid">
                {availableHabits
                  .filter(habit => !habitsToDisplay.find(ch => ch.id === habit.habit_id))
                  .map((habit) => (
                    <Badge
                      key={habit.habit_id}
                      bg="outline-secondary"
                      className="habit-badge clickable"
                      onClick={() => onAddHabitFromAvailable(habit)}
                    >
                      {habit.title} <FaPlus size={10} />
                    </Badge>
                  ))}
              </div>
            </div>
          )}          {/* Selected/Current Habits */}
          <div className="selected-habits">
            <AnimatePresence>
              {habitsToDisplay.map((habit) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="habit-item"
                >
                  <div className="habit-content">
                    <div className="habit-info">
                      <span className="habit-title">{habit.title}</span>
                      {editable && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => onRemoveHabit(habit.id)}
                          className="remove-habit"
                        >
                          <FaTimes />
                        </Button>
                      )}
                    </div>
                    <div className="habit-influence">
                      <Form.Range
                        min={1}
                        max={10}
                        value={habit.influence}
                        onChange={(e) => editable && handleLocalInfluenceChange(habit.id, parseInt(e.target.value))}
                        className="influence-slider"
                        disabled={!editable}
                      />
                      <Badge bg="info" className="influence-value">
                        {habit.influence}/10
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {habitsToDisplay.length === 0 && (
              <div className="empty-state">
                <p className="text-muted">No habits selected yet.</p>
              </div>
            )}
          </div>

          {/* Save Controls */}
          {showSaveControls && editable && (
            <div className="save-controls mt-3 d-flex justify-content-end gap-2">
              {hasChanges() && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleResetChanges}
                >
                  <FaUndo className="me-1" />
                  Reset Changes
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveChanges}
                disabled={!hasChanges()}
              >
                <FaSave className="me-1" />
                Save Habits
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>      {/* Add Habit Modal */}
      <Modal show={showAddHabitModal} onHide={() => setShowAddHabitModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Custom Habit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Habit Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter habit name (e.g., Daily meditation)"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomHabit()}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe your habit and its benefits (optional)"
                value={newHabitDescription}
                onChange={(e) => setNewHabitDescription(e.target.value)}
              />
              <Form.Text className="text-muted">
                A good description helps you remember why this habit is important to you.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Associated Personality Traits</Form.Label>
              <div className="traits-selection mt-2">
                <small className="text-muted d-block mb-2">
                  Select which personality traits this habit is most related to:
                </small>
                <div className="d-flex flex-wrap gap-2">
                  {personalityTraits.map((trait) => (
                    <Badge
                      key={trait}
                      bg={selectedTraits.includes(trait) ? "primary" : "outline-secondary"}
                      className="trait-badge"
                      style={{ 
                        cursor: "pointer", 
                        fontSize: "0.85rem",
                        padding: "0.5rem 0.75rem",
                        color: "blue"
                      }}
                      onClick={() => toggleTrait(trait)}
                    >
                      {trait.charAt(0) + trait.slice(1).toLowerCase()}
                      {selectedTraits.includes(trait) && " ✓"}
                    </Badge>
                  ))}
                </div>
                <Form.Text className="text-muted mt-2">
                  This helps the system understand how this habit relates to your personality and can provide better recommendations.
                </Form.Text>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddHabitModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddCustomHabit}
            disabled={!newHabitTitle.trim()}
          >
            <FaPlus className="me-1" />
            Create Habit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default HabitsManager;
