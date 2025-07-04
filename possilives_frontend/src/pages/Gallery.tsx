import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaFilter, FaPlus, FaCalendarAlt, FaEye, FaSortAmountDown } from "react-icons/fa";
import FloatingAdd from "../components/FloatingAdd/FloatingAdd.tsx";
import { CarouselProps } from "../types/types.ts";
import FutureCard from "../components/FutureCard/FutureCard.tsx";
import { api } from "../api/axiosConfig.ts";
import PageContainer from "../components/PageContainer/PageContainer.tsx";
import ModernCard from "../components/ModernCard/ModernCard.tsx";
import ModernButton from "../components/ModernButton/ModernButton.tsx";

const Gallery = () => {
  const [loading, setLoading] = useState(false);
  const [carouselData, setCarouselData] = useState<CarouselProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  
  useEffect(() => {
    fetchFutures();
  }, []);

  const fetchFutures = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/api/gens`);
      setCarouselData(response.data);
    } catch (error) {
      console.error("Error fetching carousel data:", error);
    } finally {
      setLoading(false);
    }
  };
  const filteredAndSortedData = carouselData
    .filter(item => {
      const matchesSearch = item.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "title":
          return (a.note || "").localeCompare(b.note || "");
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <PageContainer
        title="Loading Your Gallery..."
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
      title="Your Future Gallery"
      subtitle="Explore and manage all your generated futures"
      background="gradient"
      centerContent={false}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <ModernCard variant="glass" className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your futures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </ModernCard>

          {/* Sort and Filter */}
          <ModernCard variant="default">
            <div className="flex items-center justify-between">              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Note</option>
              </select>
            </div>
          </ModernCard>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ModernCard variant="gradient" className="text-center text-primary">
            <div className="flex items-center justify-center mb-2">
              <FaEye className="text-2xl mr-3" />
              <span className="text-3xl font-bold">{carouselData.length}</span>
            </div>
            <p className="opacity-90">Total Futures</p>
          </ModernCard>

          <ModernCard variant="glass" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FaCalendarAlt className="text-2xl mr-3 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{filteredAndSortedData.length}</span>
            </div>
            <p className="text-gray-600">Matching Results</p>
          </ModernCard>

          <ModernCard variant="elevated" className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FaSortAmountDown className="text-2xl mr-3 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{searchTerm ? "Filtered" : "All"}</span>
            </div>
            <p className="text-gray-600">View Mode</p>
          </ModernCard>
        </div>

        {/* Gallery Grid */}
        {filteredAndSortedData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredAndSortedData.map((item, index) => (
                <motion.div
                  key={item.gen_id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <FutureCard item={item} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <ModernCard variant="glass" className="text-center max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {searchTerm ? "No matching futures found" : "No futures yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `Try adjusting your search term "${searchTerm}"` 
                  : "Start creating your first future scenario!"
                }
              </p>
              {!searchTerm && (
                <ModernButton
                  title="Generate Your First Future"
                  icon={<FaPlus />}
                  onclick={() => window.location.href = "/generate"}
                  variant="primary"
                />
              )}
              {searchTerm && (
                <ModernButton
                  title="Clear Search"
                  onclick={() => setSearchTerm("")}
                  variant="outline"
                />
              )}
            </ModernCard>
          </motion.div>
        )}
      </div>

      <FloatingAdd />
    </PageContainer>
  );
};

export default Gallery;
