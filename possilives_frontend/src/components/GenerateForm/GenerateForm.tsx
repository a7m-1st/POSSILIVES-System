import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket, FaUser, FaChartBar, FaListUl, FaStickyNote, FaCoins } from "react-icons/fa";
import api_ai from "../../api/axiosConfigAI.ts";
import { api } from "../../api/axiosConfig.ts";
import LoadingContext from "../../hooks/LoadingContext.tsx";
import ModernCard from "../ModernCard/ModernCard.tsx";
import ModernButton from "../ModernButton/ModernButton.tsx";

interface PersonalityPayload {
  details: {
    age: number;
    "current carrer": string;
    "future career": string;
    relionship_status: string
  };
  big_5_personality: string;
  social_circle: string;
  habits: string;
  note: string;
}

const GenerateForm = () => {
  const {loading, setLoading} = useContext(LoadingContext);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{note?: string}>({});
  const [response, setResponse] = useState<string>("");
  const [credits, setCredits] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load user credits
      const creditsResponse = await api.post(`/api/gens/credits`);
      setCredits(creditsResponse.data.credits_left);

      // Load user profile preview
      const userResponse = await api.post(`/api/users/getUser`);
      setUserProfile(userResponse.data);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const generatePersonalityResponse = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      
      // Check balance
      const balanceResponse = await api.post(`/api/gens/balance`);
      if (!balanceResponse.data) {
        alert("Insufficient balance to generate response");
        return;
      }

      const userResponse = await api.post(`/api/users/getUser`);
      const userData = userResponse.data;

      const payload: PersonalityPayload = {
        details: {
          age: userData.age,
          "current carrer": userData.current_career,
          "future career": userData.future_career,
          relionship_status: userData.relationship_status,
        },
        big_5_personality: userData.personalities,
        social_circle: userData.social_circle || [],
        habits: userData.user_habits.map((habit) => ({
          title: habit.habit.title,
          impact_rating: habit.impact_rating,
        })),
        note: note,
      };

      console.log("Generation payload:", payload);
      const result = await api_ai.post("/generate-response", payload);
      console.log("Response received:", result.data);
      
      // Handle both old string format and new JSON format
      if (typeof result.data === 'string') {
        setResponse(result.data);
        sessionStorage.setItem("response", result.data);
        sessionStorage.removeItem("responseImage");
      } else {
        setResponse(result.data.response_text || result.data);
        sessionStorage.setItem("response", result.data.response_text || result.data);
        if (result.data.image_url) {
          sessionStorage.setItem("responseImage", result.data.image_url);
        } else {
          sessionStorage.removeItem("responseImage");
        }
      }
      navigate("/future");
    } catch (err) {
      console.error(err);
      alert("Failed to generate future. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let formErrors: {note?: string} = {};
    
    if (note.trim().length === 0) {
      formErrors.note = "Please add some notes to guide the generation";
    }

    if (Object.keys(formErrors).length === 0) {
      try {
        console.log("Submitting generation request");
        await generatePersonalityResponse();
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="space-y-6">
      {/* Credits Display */}
      <ModernCard variant="gradient" className="text-center text-primary">
        <div className="flex items-center justify-center mb-2">
          <FaCoins className="text-2xl mr-3" />
          <span className="text-3xl font-bold">{credits}</span>
        </div>
        <p className="opacity-90">Generation Credits Remaining</p>
      </ModernCard>

      {/* Profile Preview */}
      {userProfile && (
        <ModernCard variant="glass">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaUser className="mr-2 text-blue-600" />
            Your Profile Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600"><strong>Age:</strong> {userProfile.age}</p>
              <p className="text-gray-600"><strong>Current Career:</strong> {userProfile.current_career}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Future Career:</strong> {userProfile.future_career}</p>
              <p className="text-gray-600"><strong>Habits:</strong> {userProfile.user_habits?.length || 0} configured</p>
            </div>
          </div>
        </ModernCard>
      )}

      {/* Generation Form */}
      <ModernCard variant="elevated">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaRocket className="mr-2 text-blue-600" />
              Generate Your Future
            </h3>
            <p className="text-gray-600 mb-6">
              Your personality traits and habits will be the foundation for creating your personalized future scenario.
            </p>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              <FaStickyNote className="inline mr-2 text-blue-600" />
              Additional Notes
            </label>
            <textarea
              id="note"
              rows={4}
              placeholder="Add any specific details, goals, or scenarios you'd like to explore... (e.g., 'I want to see how my fitness habits might impact my career in 5 years')"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.note ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.note && (
              <p className="mt-2 text-sm text-red-600">{errors.note}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              These notes help customize your future generation to be more specific and relevant to your interests.
            </p>
          </div>

          <div className="pt-4">
            <ModernButton
              title={loading ? "Generating..." : "Generate My Future"}
              icon={<FaRocket />}
              onclick={handleSubmit}
              loading={loading}
              disabled={credits === 0}
              variant="primary"
              size="lg"
              fullWidth={true}
            />
            
            {credits === 0 && (
              <p className="mt-2 text-sm text-red-600 text-center">
                You have no generation credits remaining. Please contact support to get more credits.
              </p>
            )}
          </div>
        </form>
      </ModernCard>

      {/* Tips */}
      <ModernCard variant="default">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">💡 Tips for Better Results</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Be specific about timeframes (e.g., "in 5 years", "by 2030")</li>
          <li>• Mention particular life areas you want to explore (career, relationships, health)</li>
          <li>• Include any challenges or opportunities you're curious about</li>
          <li>• Ask "what if" scenarios to explore different possibilities</li>
        </ul>
      </ModernCard>
    </div>
  );
};

export default GenerateForm;
