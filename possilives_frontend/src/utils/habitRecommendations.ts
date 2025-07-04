import { Big5Results } from './big5Scoring';

export interface HabitWithScore {
  habit_id: string;
  title: string;
  description: string;
  traits?: Array<{ trait: string }>;
  personalityScore: number;
  matchReasons: string[];
}

export interface PersonalityTraits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// Habit personality trait mappings based on psychological research
const HABIT_PERSONALITY_MAPPINGS: Record<string, {
  primaryTraits: Array<keyof PersonalityTraits>;
  secondaryTraits: Array<keyof PersonalityTraits>;
  keywords: string[];
  scoreModifiers: Record<keyof PersonalityTraits, number>;
}> = {
  // Exercise and Health
  'exercise': {
    primaryTraits: ['conscientiousness', 'extraversion'],
    secondaryTraits: ['openness'],
    keywords: ['exercise', 'workout', 'fitness', 'gym', 'running', 'sports', 'physical', 'health'],
    scoreModifiers: { conscientiousness: 2.0, extraversion: 1.5, openness: 1.2, agreeableness: 1.0, neuroticism: -0.5 }
  },
  'meditation': {
    primaryTraits: ['conscientiousness', 'openness'],
    secondaryTraits: ['neuroticism'],
    keywords: ['meditation', 'mindfulness', 'breathing', 'calm', 'zen', 'peace', 'relaxation', 'mental health'],
    scoreModifiers: { conscientiousness: 1.8, openness: 1.6, neuroticism: -1.2, agreeableness: 1.1, extraversion: 0.8 }
  },
  'reading': {
    primaryTraits: ['openness', 'conscientiousness'],
    secondaryTraits: [],
    keywords: ['reading', 'book', 'literature', 'novel', 'study', 'learn', 'knowledge', 'education'],
    scoreModifiers: { openness: 2.2, conscientiousness: 1.4, extraversion: 0.6, agreeableness: 1.0, neuroticism: 0.9 }
  },
  'social': {
    primaryTraits: ['extraversion', 'agreeableness'],
    secondaryTraits: ['openness'],
    keywords: ['social', 'friends', 'party', 'networking', 'community', 'group', 'team', 'collaboration'],
    scoreModifiers: { extraversion: 2.5, agreeableness: 2.0, openness: 1.3, conscientiousness: 1.0, neuroticism: -0.3 }
  },
  'creative': {
    primaryTraits: ['openness'],
    secondaryTraits: ['extraversion'],
    keywords: ['creative', 'art', 'music', 'painting', 'writing', 'design', 'craft', 'artistic', 'imagination'],
    scoreModifiers: { openness: 2.8, extraversion: 1.2, conscientiousness: 0.9, agreeableness: 1.1, neuroticism: 0.7 }
  },
  'organization': {
    primaryTraits: ['conscientiousness'],
    secondaryTraits: [],
    keywords: ['organize', 'plan', 'schedule', 'routine', 'systematic', 'structure', 'order', 'productivity'],
    scoreModifiers: { conscientiousness: 3.0, openness: 0.8, extraversion: 1.0, agreeableness: 1.0, neuroticism: -0.4 }
  },
  'learning': {
    primaryTraits: ['openness', 'conscientiousness'],
    secondaryTraits: [],
    keywords: ['learn', 'skill', 'course', 'education', 'training', 'development', 'growth', 'improvement'],
    scoreModifiers: { openness: 2.4, conscientiousness: 1.8, extraversion: 1.0, agreeableness: 1.0, neuroticism: 0.8 }
  },
  'helping': {
    primaryTraits: ['agreeableness'],
    secondaryTraits: ['extraversion', 'conscientiousness'],
    keywords: ['help', 'volunteer', 'charity', 'support', 'assist', 'care', 'service', 'kindness', 'empathy'],
    scoreModifiers: { agreeableness: 2.6, extraversion: 1.4, conscientiousness: 1.2, openness: 1.1, neuroticism: -0.2 }
  },
  'adventure': {
    primaryTraits: ['openness', 'extraversion'],
    secondaryTraits: [],
    keywords: ['adventure', 'travel', 'explore', 'new', 'experience', 'excitement', 'discovery', 'thrill'],
    scoreModifiers: { openness: 2.5, extraversion: 2.0, conscientiousness: 0.7, agreeableness: 1.0, neuroticism: -0.6 }
  },
  'routine': {
    primaryTraits: ['conscientiousness'],
    secondaryTraits: [],
    keywords: ['routine', 'daily', 'habit', 'consistent', 'regular', 'disciplined', 'systematic', 'steady'],
    scoreModifiers: { conscientiousness: 2.8, openness: 0.6, extraversion: 0.9, agreeableness: 1.0, neuroticism: -0.3 }
  },
  'reflection': {
    primaryTraits: ['openness', 'conscientiousness'],
    secondaryTraits: ['neuroticism'],
    keywords: ['reflect', 'journal', 'introspect', 'think', 'analyze', 'contemplate', 'self-awareness'],
    scoreModifiers: { openness: 1.9, conscientiousness: 1.6, neuroticism: 0.5, extraversion: 0.7, agreeableness: 1.0 }
  },
  'technology': {
    primaryTraits: ['openness'],
    secondaryTraits: ['conscientiousness'],
    keywords: ['technology', 'digital', 'tech', 'computer', 'app', 'online', 'coding', 'programming'],
    scoreModifiers: { openness: 2.1, conscientiousness: 1.3, extraversion: 0.8, agreeableness: 0.9, neuroticism: 0.8 }
  }
};

export const scoreHabitForPersonality = (
  habit: any,
  personalityTraits: PersonalityTraits
): HabitWithScore => {
  let score = 0;
  const matchReasons: string[] = [];
  const habitTitle = habit.title.toLowerCase();
  const habitDescription = habit.description.toLowerCase();
  
  // Combine title and description for analysis
  const habitText = `${habitTitle} ${habitDescription}`;

  // Check each habit category
  for (const [category, config] of Object.entries(HABIT_PERSONALITY_MAPPINGS)) {
    // Check if any keywords match
    const keywordMatches = config.keywords.some(keyword => 
      habitText.includes(keyword.toLowerCase())
    );

    if (keywordMatches) {
      // Calculate score based on personality traits
      let categoryScore = 0;
      
      // Primary traits have higher weight
      config.primaryTraits.forEach(trait => {
        const traitScore = personalityTraits[trait];
        const modifier = config.scoreModifiers[trait];
        const traitContribution = (traitScore / 100) * modifier * 40; // Scale to 0-40 for primary
        categoryScore += traitContribution;
        
        if (traitScore >= 70) {
          matchReasons.push(`High ${trait} (${traitScore}%) matches ${category} activities`);
        } else if (traitScore >= 40) {
          matchReasons.push(`Moderate ${trait} (${traitScore}%) aligns with ${category}`);
        }
      });

      // Secondary traits have lower weight
      config.secondaryTraits.forEach(trait => {
        const traitScore = personalityTraits[trait];
        const modifier = config.scoreModifiers[trait] || 1.0;
        const traitContribution = (traitScore / 100) * modifier * 20; // Scale to 0-20 for secondary
        categoryScore += traitContribution;
      });

      score += categoryScore;
    }
  }

  // Bonus scoring for explicit trait matches in habit data
  if (habit.traits && Array.isArray(habit.traits)) {
    habit.traits.forEach((traitObj: any) => {
      const traitName = traitObj.trait?.toLowerCase();
      switch (traitName) {
        case 'openness':
          score += (personalityTraits.openness / 100) * 25;
          if (personalityTraits.openness >= 70) {
            matchReasons.push(`Explicitly tagged for high Openness (${personalityTraits.openness}%)`);
          }
          break;
        case 'conscientiousness':
          score += (personalityTraits.conscientiousness / 100) * 25;
          if (personalityTraits.conscientiousness >= 70) {
            matchReasons.push(`Explicitly tagged for high Conscientiousness (${personalityTraits.conscientiousness}%)`);
          }
          break;
        case 'extraversion':
          score += (personalityTraits.extraversion / 100) * 25;
          if (personalityTraits.extraversion >= 70) {
            matchReasons.push(`Explicitly tagged for high Extraversion (${personalityTraits.extraversion}%)`);
          }
          break;
        case 'agreeableness':
          score += (personalityTraits.agreeableness / 100) * 25;
          if (personalityTraits.agreeableness >= 70) {
            matchReasons.push(`Explicitly tagged for high Agreeableness (${personalityTraits.agreeableness}%)`);
          }
          break;
        case 'neuroticism':
          // For neuroticism, lower scores might be better for most habits
          const neuroticismBonus = personalityTraits.neuroticism >= 70 ? 15 : 5;
          score += neuroticismBonus;
          if (personalityTraits.neuroticism >= 70) {
            matchReasons.push(`Suitable for managing high Neuroticism (${personalityTraits.neuroticism}%)`);
          }
          break;
      }
    });
  }

  // Normalize score to 0-100 range
  const normalizedScore = Math.min(100, Math.max(0, score));

  return {
    ...habit,
    personalityScore: Math.round(normalizedScore),
    matchReasons: matchReasons.slice(0, 3) // Limit to top 3 reasons
  };
};

export const getPersonalizedHabitRecommendations = (
  habits: any[],
  personalityTraits: PersonalityTraits,
  limit: number = 20
): HabitWithScore[] => {
  // Score all habits
  const scoredHabits = habits.map(habit => 
    scoreHabitForPersonality(habit, personalityTraits)
  );

  // Sort by personality score (descending)
  const sortedHabits = scoredHabits.sort((a, b) => {
    // Primary sort by personality score
    if (b.personalityScore !== a.personalityScore) {
      return b.personalityScore - a.personalityScore;
    }
    // Secondary sort by title alphabetically
    return a.title.localeCompare(b.title);
  });

  return sortedHabits.slice(0, limit);
};

export const getPersonalityInsights = (personalityTraits: PersonalityTraits): {
  dominantTraits: string[];
  habitRecommendationStyle: string;
  motivationalMessage: string;
} => {
  const traits = [
    { name: 'Openness', score: personalityTraits.openness },
    { name: 'Conscientiousness', score: personalityTraits.conscientiousness },
    { name: 'Extraversion', score: personalityTraits.extraversion },
    { name: 'Agreeableness', score: personalityTraits.agreeableness },
    { name: 'Neuroticism', score: personalityTraits.neuroticism }
  ];

  // Find dominant traits (above 70)
  const dominantTraits = traits
    .filter(trait => trait.score >= 70)
    .map(trait => trait.name);

  // Generate recommendation style
  let recommendationStyle = "balanced approach";
  if (personalityTraits.conscientiousness >= 70) {
    recommendationStyle = "structured, goal-oriented habits";
  } else if (personalityTraits.openness >= 70) {
    recommendationStyle = "creative and exploratory activities";
  } else if (personalityTraits.extraversion >= 70) {
    recommendationStyle = "social and energizing habits";
  } else if (personalityTraits.agreeableness >= 70) {
    recommendationStyle = "collaborative and helping-focused habits";
  }

  // Generate motivational message
  let motivationalMessage = "Build habits that align with your unique personality!";
  if (dominantTraits.length > 0) {
    motivationalMessage = `Your ${dominantTraits.join(' and ')} personality suggests you'll excel with ${recommendationStyle}.`;
  }

  return {
    dominantTraits,
    habitRecommendationStyle: recommendationStyle,
    motivationalMessage
  };
};

// Helper function to get user's personality from localStorage or API
export const getUserPersonalityTraits = async (): Promise<PersonalityTraits | null> => {
  try {
    // First, try to get from Big5 test results in sessionStorage
    const big5Results = sessionStorage.getItem("Big5Result");
    if (big5Results) {
      const results = JSON.parse(big5Results);
      if (Array.isArray(results) && results.length === 5) {
        return {
          openness: results[0],
          conscientiousness: results[1],
          extraversion: results[2],
          agreeableness: results[3],
          neuroticism: results[4]
        };
      }
    }

    // Fallback: get from user's latest personality assessment
    const userId = localStorage.getItem('userId');
    if (userId) {
      const { api } = await import('../api/axiosConfig');
      const userResponse = await api.post('/api/users/getUser');
      const userData = userResponse.data;
      
      if (userData.personalities && userData.personalities.length > 0) {
        const latestPersonality = userData.personalities[userData.personalities.length - 1];
        return {
          openness: latestPersonality.openness,
          conscientiousness: latestPersonality.conscientiousness,
          extraversion: latestPersonality.extraversion,
          agreeableness: latestPersonality.agreeableness,
          neuroticism: latestPersonality.neuroticism
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting user personality traits:', error);
    return null;
  }
};
