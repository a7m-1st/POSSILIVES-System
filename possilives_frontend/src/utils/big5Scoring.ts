// Big 5 personality traits scoring keys
// Each question maps to one of the 5 traits: E=Extraversion, A=Agreeableness, C=Conscientiousness, N=Neuroticism, O=Openness
// R indicates reverse scoring (6 - score)

export const questionMapping = [
  { trait: 'E', reverse: false }, // 1. I am the life of the party
  { trait: 'A', reverse: true },  // 2. I feel little concern for others
  { trait: 'C', reverse: false }, // 3. I am always prepared
  { trait: 'N', reverse: false }, // 4. I get stressed out easily
  { trait: 'O', reverse: false }, // 5. I have a rich vocabulary
  { trait: 'E', reverse: true },  // 6. I don't talk a lot
  { trait: 'A', reverse: false }, // 7. I am interested in people
  { trait: 'C', reverse: true },  // 8. I leave my belongings around
  { trait: 'N', reverse: true },  // 9. I am relaxed most of the time
  { trait: 'O', reverse: true },  // 10. I have difficulty understanding abstract ideas
  { trait: 'E', reverse: false }, // 11. I feel comfortable around people
  { trait: 'A', reverse: true },  // 12. I insult people
  { trait: 'C', reverse: false }, // 13. I pay attention to details
  { trait: 'N', reverse: false }, // 14. I worry about things
  { trait: 'O', reverse: false }, // 15. I have a vivid imagination
  { trait: 'E', reverse: true },  // 16. I keep in the background
  { trait: 'A', reverse: false }, // 17. I sympathize with others' feelings
  { trait: 'C', reverse: true },  // 18. I make a mess of things
  { trait: 'N', reverse: true },  // 19. I seldom feel blue
  { trait: 'O', reverse: true },  // 20. I am not interested in abstract ideas
  { trait: 'E', reverse: false }, // 21. I start conversations
  { trait: 'A', reverse: true },  // 22. I am not interested in other people's problems
  { trait: 'C', reverse: false }, // 23. I get chores done right away
  { trait: 'N', reverse: false }, // 24. I am easily disturbed
  { trait: 'O', reverse: false }, // 25. I have excellent ideas
  { trait: 'E', reverse: true },  // 26. I have little to say
  { trait: 'A', reverse: false }, // 27. I have a soft heart
  { trait: 'C', reverse: true },  // 28. I often forget to put things back in their proper place
  { trait: 'N', reverse: false }, // 29. I get upset easily
  { trait: 'O', reverse: true },  // 30. I do not have a good imagination
  { trait: 'E', reverse: false }, // 31. I talk to a lot of different people at parties
  { trait: 'A', reverse: true },  // 32. I am not really interested in others
  { trait: 'C', reverse: false }, // 33. I like order
  { trait: 'N', reverse: false }, // 34. I change my mood a lot
  { trait: 'O', reverse: false }, // 35. I am quick to understand things
  { trait: 'E', reverse: true },  // 36. I don't like to draw attention to myself
  { trait: 'A', reverse: false }, // 37. I take time out for others
  { trait: 'C', reverse: true },  // 38. I shirk my duties
  { trait: 'N', reverse: false }, // 39. I have frequent mood swings
  { trait: 'O', reverse: true },  // 40. I use difficult words
  { trait: 'E', reverse: true },  // 41. I don't mind being the center of attention
  { trait: 'A', reverse: false }, // 42. I feel others' emotions
  { trait: 'C', reverse: false }, // 43. I follow a schedule
  { trait: 'N', reverse: false }, // 44. I get irritated easily
  { trait: 'O', reverse: false }, // 45. I spend time reflecting on things
  { trait: 'E', reverse: true },  // 46. I am quiet around strangers
  { trait: 'A', reverse: true },  // 47. I make people feel at ease
  { trait: 'C', reverse: true },  // 48. I am exacting in my work
  { trait: 'N', reverse: true },  // 49. I often feel blue
  { trait: 'O', reverse: false }, // 50. I am full of ideas
];

export const calculateBig5Scores = (answers: number[]): Big5Results => {
  const scores = {
    E: 0, // Extraversion
    A: 0, // Agreeableness  
    C: 0, // Conscientiousness
    N: 0, // Neuroticism
    O: 0  // Openness
  };
  
  const counts = { E: 0, A: 0, C: 0, N: 0, O: 0 };
  
  answers.forEach((answer, index) => {
    const mapping = questionMapping[index];
    const score = mapping.reverse ? (6 - answer) : answer;
    scores[mapping.trait] += score;
    counts[mapping.trait]++;
  });
  
  // Calculate averages and convert to 0-100 scale
  const results: Big5Results = {
    extraversion: Math.round((scores.E / counts.E) * 20), // Convert 1-5 scale to 0-100
    agreeableness: Math.round((scores.A / counts.A) * 20),
    conscientiousness: Math.round((scores.C / counts.C) * 20),
    neuroticism: Math.round((scores.N / counts.N) * 20),
    openness: Math.round((scores.O / counts.O) * 20)
  };
  
  return results;
};

export interface Big5Results {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
}

export const getTraitDescription = (trait: string, score: number): string => {
  const descriptions = {
    extraversion: {
      high: "You are outgoing, energetic, and social. You enjoy being around people and are comfortable in social situations.",
      medium: "You balance social interaction with solitude, adapting your energy to different situations.",
      low: "You prefer quieter environments and smaller groups. You are thoughtful and enjoy introspection."
    },
    agreeableness: {
      high: "You are compassionate, trusting, and cooperative. You tend to see the best in others and value harmony.",
      medium: "You balance trust with healthy skepticism, being helpful while maintaining boundaries.",
      low: "You are competitive and skeptical. You value honesty over politeness and are willing to challenge others."
    },
    conscientiousness: {
      high: "You are organized, responsible, and goal-oriented. You plan ahead and follow through on commitments.",
      medium: "You balance structure with flexibility, being organized when needed but adaptable to change.",
      low: "You are spontaneous and flexible. You prefer to go with the flow rather than stick to rigid plans."
    },
    neuroticism: {
      high: "You tend to experience emotional fluctuations and may worry more than others. You're sensitive to stress.",
      medium: "You experience normal emotional ups and downs, handling stress reasonably well most of the time.",
      low: "You are emotionally stable and calm. You handle stress well and maintain composure under pressure."
    },
    openness: {
      high: "You are creative, curious, and open to new experiences. You enjoy exploring ideas and trying new things.",
      medium: "You balance routine with novelty, being open to new experiences while appreciating familiar patterns.",
      low: "You prefer traditional approaches and established routines. You value practical solutions over abstract ideas."
    }
  };
  
  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  return descriptions[trait]?.[level] || '';
};
