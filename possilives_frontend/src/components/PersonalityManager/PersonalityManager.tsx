import React from 'react';
import { Card, Form, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaUser, FaHeart, FaBrain, FaHandshake, FaEye } from 'react-icons/fa';

interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface PersonalityManagerProps {
  personality: PersonalityTraits;
  onPersonalityChange: (trait: keyof PersonalityTraits, value: number) => void;
  readOnly?: boolean;
  title?: string;
}

const PersonalityManager: React.FC<PersonalityManagerProps> = ({
  personality,
  onPersonalityChange,
  readOnly = false,
  title = "Personality Traits"
}) => {
  const personalityTraits = [
    { key: 'openness' as keyof PersonalityTraits, label: 'Openness to experience', icon: <FaEye />, color: '#e74c3c' },
    { key: 'conscientiousness' as keyof PersonalityTraits, label: 'Conscientiousness', icon: <FaBrain />, color: '#3498db' },
    { key: 'extraversion' as keyof PersonalityTraits, label: 'Extraversion', icon: <FaUser />, color: '#f39c12' },
    { key: 'agreeableness' as keyof PersonalityTraits, label: 'Agreeableness', icon: <FaHandshake />, color: '#27ae60' },
    { key: 'neuroticism' as keyof PersonalityTraits, label: 'Neuroticism', icon: <FaHeart />, color: '#9b59b6' }
  ];

  return (
    <Card className="mb-4">
      <Card.Body>
        <h3>{title}:</h3>
        <div className="personality-traits">
          {personalityTraits.map((trait) => (
            <motion.div
              key={trait.key}
              className="trait-row"
              whileHover={{ scale: readOnly ? 1 : 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="trait-label">
                <span className="trait-icon" style={{ color: trait.color }}>
                  {trait.icon}
                </span>
                <span className="trait-name">{trait.label}</span>
              </div>
              <div className="trait-controls">
                <div className="trait-slider-container">
                  <Form.Range
                    min={1}
                    max={10}
                    value={personality[trait.key]}
                    onChange={(e) => !readOnly && onPersonalityChange(trait.key, parseInt(e.target.value))}
                    className="trait-slider"
                    disabled={readOnly}
                    style={{
                      background: `linear-gradient(to right, ${trait.color}20 0%, ${trait.color} ${personality[trait.key] * 10}%, #e9ecef ${personality[trait.key] * 10}%, #e9ecef 100%)`
                    }}
                  />
                </div>
                <div className="trait-value">
                  <Badge bg="primary" className="value-badge">
                    {personality[trait.key]}/10
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PersonalityManager;
