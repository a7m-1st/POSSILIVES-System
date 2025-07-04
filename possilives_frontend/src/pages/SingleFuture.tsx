import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSave, FaRedo, FaEye, FaCalendarAlt, FaArrowLeft, FaImage } from "react-icons/fa";
import { api } from "../api/axiosConfig.ts";
import FutureCard from "../components/FutureCard/FutureCard.tsx";
import PageContainer from "../components/PageContainer/PageContainer.tsx";
import ModernCard from "../components/ModernCard/ModernCard.tsx";
import ModernButton from "../components/ModernButton/ModernButton.tsx";
import Markdown from "markdown-to-jsx";

const SingleFuture = () => {
  const [credits, setCredits] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { edit } = useParams();
  const navigate = useNavigate();
  
  const getDescription = () => {
    if (edit != null) {
      try {
        const selectedItemData = sessionStorage.getItem("selectedItem");
        if (selectedItemData) {
          const selectedItem = JSON.parse(selectedItemData);
          return selectedItem?.description || "Default description";
        }
      } catch (error) {
        console.error("Error parsing selectedItem for description:", error);
      }
      return "Default description";
    } else {
      return sessionStorage.getItem("response") || "Default description";
    }
  };

  const description = getDescription();

  useEffect(() => {
    // Load credits
    api.post(`/api/gens/credits`).then((response) => {
      setCredits(response.data.credits_left);
    }).catch(error => {
      console.error("Error fetching credits:", error);
    });
    
    // Load image URL
    if (edit == null) {
      const storedImageUrl = sessionStorage.getItem("responseImage");
      if (storedImageUrl) {
        setImageUrl(storedImageUrl);
      }
    } else {
      try {
        const selectedItemData = sessionStorage.getItem("selectedItem");
        if (selectedItemData) {
          const selectedItem = JSON.parse(selectedItemData);
          if (selectedItem) {
            if (selectedItem.image) {
              setImageUrl(selectedItem.image);
            } else if (selectedItem.images && selectedItem.images.length > 0) {
              setImageUrl(selectedItem.images[0].link);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing selectedItem:", error);
      }
    }
  }, [edit]);

  const onSubmit = async () => {
    try {
      setSaving(true);
      const userId = localStorage.getItem("userId");
      
      const generationData = {
        userId: userId,
        description: description,
        title: null,
        imageLink: imageUrl,
        note: null
      };
      
      await api.post("/api/gens/create", generationData);
      navigate("/gallery");
    } catch (error) {
      console.error("Error submitting generation:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      title={edit ? "View Future Scenario" : "Your Generated Future"}
      subtitle={edit ? "Exploring your saved scenario" : "Here's your personalized future scenario"}
      background="gradient"
      centerContent={false}
      maxWidth="4xl"
    >
      <div className="space-y-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ModernButton
            title="Back to Gallery"
            icon={<FaArrowLeft />}
            onclick={() => navigate("/gallery")}
            variant="outline"
            size="sm"
          />
        </motion.div>

        {/* Image Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ModernCard variant="elevated" className="overflow-hidden">
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Generated Future Scenario"
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute bottom-4 right-4">
                  <div className="flex items-center space-x-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    <FaImage />
                    <span>AI Generated</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 md:h-96 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FaImage className="text-4xl mb-4 mx-auto" />
                  <p>No image generated for this scenario</p>
                </div>
              </div>
            )}
          </ModernCard>
        </motion.div>

        {/* Content Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ModernCard variant="glass">
            <div className="prose prose-lg max-w-none">
              <Markdown 
                options={{
                  overrides: {
                    h1: { props: { className: 'text-2xl font-bold text-gray-900 mb-4' } },
                    h2: { props: { className: 'text-xl font-semibold text-gray-800 mb-3' } },
                    h3: { props: { className: 'text-lg font-medium text-gray-700 mb-2' } },
                    p: { props: { className: 'text-gray-600 mb-4 leading-relaxed' } },
                    ul: { props: { className: 'list-disc list-inside text-gray-600 mb-4 space-y-1' } },
                    ol: { props: { className: 'list-decimal list-inside text-gray-600 mb-4 space-y-1' } },
                  }
                }}
              >
                {description}
              </Markdown>
            </div>
          </ModernCard>
        </motion.div>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ModernCard variant="default">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt />
                  <span>Generated {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaEye />
                  <span>Personalized Scenario</span>
                </div>
              </div>
              {!edit && (
                <div className="text-sm text-gray-500">
                  Save this scenario to your gallery
                </div>
              )}
            </div>
          </ModernCard>
        </motion.div>

        {/* Action Buttons */}
        {!edit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <ModernButton
              title="Save to Gallery"
              icon={<FaSave />}
              onclick={onSubmit}
              loading={saving}
              variant="primary"
              size="lg"
            />
            
            <ModernButton
              title={`Regenerate (${credits} credits)`}
              icon={<FaRedo />}
              onclick={() => navigate("/generate")}
              variant="outline"
              size="lg"
              disabled={credits === 0}
            />
          </motion.div>
        )}

        {credits === 0 && !edit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ModernCard variant="glass" className="text-center">
              <p className="text-orange-600 font-medium">
                You have no generation credits remaining. Contact support to get more credits.
              </p>
            </ModernCard>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
};

export default SingleFuture;
