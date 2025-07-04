import { api } from '../api/axiosConfig.ts';

export interface UserProfileStatus {
  hasBasicProfile: boolean;
  hasPersonality: boolean;
  hasHabits: boolean;
  profileComplete: boolean;
}

export const checkUserProfileStatus = async (): Promise<UserProfileStatus> => {
  try {
    const response = await api.post('/api/users/getUser');
    const userData = response.data;
    
    const hasBasicProfile = userData.age && userData.current_career && userData.future_career && 
                           userData.relationship_status && userData.social_circle;
    
    const hasPersonality = userData.personalities && userData.personalities.length > 0;
    
    const hasHabits = userData.user_habits && userData.user_habits.length > 0;
    
    const profileComplete = hasBasicProfile && hasPersonality && hasHabits;
    
    return {
      hasBasicProfile: !!hasBasicProfile,
      hasPersonality: !!hasPersonality,
      hasHabits: !!hasHabits,
      profileComplete
    };
  } catch (error) {
    console.error('Error checking profile status:', error);
    return {
      hasBasicProfile: false,
      hasPersonality: false,
      hasHabits: false,
      profileComplete: false
    };
  }
};

export const getNextProfileStep = (status: UserProfileStatus): string => {
  if (!status.hasBasicProfile) {
    return '/createprofile';
  }
  if (!status.hasPersonality) {
    return '/testbridge';
  }
  if (!status.hasHabits) {
    return '/newhabits';
  }
  return '/home';
};
