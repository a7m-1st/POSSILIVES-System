import { Big5Results } from './big5Scoring';

export interface VideoAnalysisResults {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface WeightedPersonalityResults extends Big5Results {
  source: 'big5-only' | 'video-only' | 'combined';
  big5Weight: number;
  videoWeight: number;
  breakdown?: {
    big5: Big5Results;
    video: VideoAnalysisResults;
  };
}

/**
 * Combines Big 5 test results with video analysis results using weighted averaging
 * @param big5Results - Results from the Big 5 personality test (0-100 scale)
 * @param videoResults - Results from video analysis (0-100 scale)
 * @param big5Weight - Weight for Big 5 results (default: 0.7 = 70%)
 * @param videoWeight - Weight for video results (default: 0.3 = 30%)
 * @returns Combined weighted personality results
 */
export const combinePersonalityResults = (
  big5Results: Big5Results,
  videoResults?: VideoAnalysisResults | null,
  big5Weight: number = 0.7,
  videoWeight: number = 0.3
): WeightedPersonalityResults => {
  // Ensure weights sum to 1
  const totalWeight = big5Weight + videoWeight;
  const normalizedBig5Weight = big5Weight / totalWeight;
  const normalizedVideoWeight = videoWeight / totalWeight;

  // If no video results, return Big 5 only
  if (!videoResults) {
    return {
      ...big5Results,
      source: 'big5-only',
      big5Weight: 1.0,
      videoWeight: 0.0
    };
  }

  // Calculate weighted averages for each trait
  const combinedResults: WeightedPersonalityResults = {
    openness: Math.round(
      (big5Results.openness * normalizedBig5Weight) + 
      (videoResults.openness * normalizedVideoWeight)
    ),
    conscientiousness: Math.round(
      (big5Results.conscientiousness * normalizedBig5Weight) + 
      (videoResults.conscientiousness * normalizedVideoWeight)
    ),
    extraversion: Math.round(
      (big5Results.extraversion * normalizedBig5Weight) + 
      (videoResults.extraversion * normalizedVideoWeight)
    ),
    agreeableness: Math.round(
      (big5Results.agreeableness * normalizedBig5Weight) + 
      (videoResults.agreeableness * normalizedVideoWeight)
    ),
    neuroticism: Math.round(
      (big5Results.neuroticism * normalizedBig5Weight) + 
      (videoResults.neuroticism * normalizedVideoWeight)
    ),
    source: 'combined',
    big5Weight: normalizedBig5Weight,
    videoWeight: normalizedVideoWeight,
    breakdown: {
      big5: big5Results,
      video: videoResults
    }
  };

  return combinedResults;
};

/**
 * Converts video analysis results from session storage format to VideoAnalysisResults
 * @param sessionResults - Array of personality scores from video analysis
 * @returns VideoAnalysisResults object or null if invalid
 */
export const parseVideoAnalysisResults = (sessionResults: any): VideoAnalysisResults | null => {
  if (!Array.isArray(sessionResults) || sessionResults.length !== 5) {
    return null;
  }

  return {
    openness: parseInt(sessionResults[0]) || 0,
    conscientiousness: parseInt(sessionResults[1]) || 0,
    extraversion: parseInt(sessionResults[2]) || 0,
    agreeableness: parseInt(sessionResults[3]) || 0,
    neuroticism: parseInt(sessionResults[4]) || 0
  };
};

/**
 * Gets existing video analysis results from session storage
 * @returns VideoAnalysisResults or null if not found
 */
export const getExistingVideoResults = (): VideoAnalysisResults | null => {
  try {
    const videoResults = sessionStorage.getItem("VideoAnalysisResult");
    if (videoResults) {
      const parsed = JSON.parse(videoResults);
      return parseVideoAnalysisResults(parsed);
    }
    
    // Also check for Big5Result which might be from video analysis
    const big5Results = sessionStorage.getItem("Big5Result");
    if (big5Results) {
      const parsed = JSON.parse(big5Results);
      // Check if this was from video analysis (we can add a flag for this)
      const isFromVideo = sessionStorage.getItem("Big5FromVideo") === "true";
      if (isFromVideo) {
        return parseVideoAnalysisResults(parsed);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting video analysis results:", error);
    return null;
  }
};

/**
 * Stores video analysis results for later combination
 * @param results - VideoAnalysisResults to store
 */
export const storeVideoAnalysisResults = (results: VideoAnalysisResults): void => {
  try {
    sessionStorage.setItem("VideoAnalysisResult", JSON.stringify([
      results.openness,
      results.conscientiousness,
      results.extraversion,
      results.agreeableness,
      results.neuroticism
    ]));
    
    // Flag that these results are from video analysis
    sessionStorage.setItem("Big5FromVideo", "true");
  } catch (error) {
    console.error("Error storing video analysis results:", error);
  }
};

/**
 * Clears all personality test results from session storage
 */
export const clearPersonalityResults = (): void => {
  sessionStorage.removeItem("Big5Result");
  sessionStorage.removeItem("VideoAnalysisResult");
  sessionStorage.removeItem("Big5FromVideo");
  sessionStorage.removeItem("CombinedPersonalityResult");
};

/**
 * Gets trait comparison text for displaying differences between Big 5 and video results
 * @param trait - The personality trait name
 * @param big5Score - Score from Big 5 test
 * @param videoScore - Score from video analysis
 * @returns Comparison text explaining the difference
 */
export const getTraitComparison = (trait: string, big5Score: number, videoScore: number): string => {
  const difference = Math.abs(big5Score - videoScore);
  
  if (difference <= 5) {
    return "Both methods show very similar results";
  } else if (difference <= 15) {
    return `Slight variation between methods (${difference} point difference)`;
  } else if (difference <= 30) {
    return `Moderate difference between self-assessment and behavioral analysis`;
  } else {
    return `Significant difference suggests different aspects of your ${trait.toLowerCase()}`;
  }
};

/**
 * Generates insights about the combined personality assessment
 * @param results - WeightedPersonalityResults from combination
 * @returns Array of insight messages
 */
export const generateCombinedInsights = (results: WeightedPersonalityResults): string[] => {
  const insights: string[] = [];
  
  if (results.source === 'combined' && results.breakdown) {
    const { big5, video } = results.breakdown;
    
    // Find largest differences
    const differences = [
      { trait: 'Openness', diff: Math.abs(big5.openness - video.openness) },
      { trait: 'Conscientiousness', diff: Math.abs(big5.conscientiousness - video.conscientiousness) },
      { trait: 'Extraversion', diff: Math.abs(big5.extraversion - video.extraversion) },
      { trait: 'Agreeableness', diff: Math.abs(big5.agreeableness - video.agreeableness) },
      { trait: 'Neuroticism', diff: Math.abs(big5.neuroticism - video.neuroticism) }
    ];
    
    const maxDiff = Math.max(...differences.map(d => d.diff));
    const avgDiff = differences.reduce((sum, d) => sum + d.diff, 0) / 5;
    
    if (avgDiff <= 10) {
      insights.push("Your self-assessment and behavioral analysis are highly consistent, indicating strong self-awareness.");
    } else if (avgDiff <= 20) {
      insights.push("Your results show good alignment between how you see yourself and how you naturally behave.");
    } else {
      insights.push("Interesting differences emerged between your self-perception and behavioral patterns - this is quite normal and provides valuable insights.");
    }
    
    // Highlight the trait with the biggest difference
    if (maxDiff > 20) {
      const maxDiffTrait = differences.find(d => d.diff === maxDiff);
      if (maxDiffTrait) {
        insights.push(`The biggest variation was in ${maxDiffTrait.trait}, suggesting this trait may express differently in different contexts.`);
      }
    }
    
    insights.push(`This combined assessment leverages both scientific questionnaire methodology (${Math.round(results.big5Weight * 100)}%) and behavioral AI analysis (${Math.round(results.videoWeight * 100)}%) for a comprehensive personality profile.`);
  }
  
  return insights;
};
