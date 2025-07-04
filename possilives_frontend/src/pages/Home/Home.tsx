import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, ProgressBar, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaMagic, FaClock, FaCog, FaInfoCircle } from 'react-icons/fa';
import LoadingContext from "../../hooks/LoadingContext.tsx";
import MyCarousel from "../../components/Carousel/MyCarousel.tsx";
import { CarouselProps } from "../../types/types.ts";
import { api } from "../../api/axiosConfig.ts";
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { loading, setLoading } = React.useContext(LoadingContext);
  const [generationsLeft, setGenerationsLeft] = useState(5);
  const [maxGenerations, setMaxGenerations] = useState(10);
  const [carouselData, setCarouselData] = useState<CarouselProps[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
        
        // First request
        const generationsResponse = await api.post(`/api/gens`);
        setCarouselData(generationsResponse.data);
        
        // Second request (only starts after first one completes)
        const creditsResponse = await api.post(`/api/gens/credits`);
        const { credits_left, max_credits } = creditsResponse.data;
        setGenerationsLeft(credits_left);
        setMaxGenerations(max_credits);
        
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const actionButtons = [    { 
      icon: <FaQuestionCircle />, 
      text: "What if?",
      background: "linear-gradient(135deg, #6C5CE7 0%, #8E44AD 100%)",
      delay: 0.1,
      onClick: () => navigate("/whatif") 
    },
    { 
      icon: <FaMagic />, 
      text: "Generate New",
      background: "linear-gradient(135deg, #00B894 0%, #38D39F 100%)",
      delay: 0.2,
      onClick: () => navigate("/generate") 
    },
    { 
      icon: <FaClock />, 
      text: (
        <span className="stat-text">
          <span className="stat-number">{carouselData.length}</span>
          <span className="stat-label">Futures Generated</span>
        </span>
      ),
      background: "linear-gradient(135deg, #FF7675 0%, #FD9644 100%)",
      delay: 0.3,
      onClick: () => navigate("/statistics") 
    },
    { 
      icon: <FaCog />, 
      text: "Modify Factors",
      background: "linear-gradient(135deg, #54A0FF 0%, #2E86DE 100%)",
      delay: 0.4,
      onClick: () => navigate("/manage-factors") 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="home-container"
    >
      {/* Carousel Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/gallery" className="carousel-link">
          <MyCarousel items={carouselData} />
        </Link>
      </motion.div>
      
      <Container className="mt-4 mb-5">
        {/* Progress Bar Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="credits-container"
        >
          <div className="credits-header">
            <h4>Daily Generation Credits</h4>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id="tooltip-credits">
                  Number of futures you can generate today
                </Tooltip>
              }
            >
              <Button variant="link" className="info-button">
                <FaInfoCircle />
              </Button>
            </OverlayTrigger>
          </div>
          
          <div className="progress-section">
            <ProgressBar 
              now={(generationsLeft / maxGenerations) * 100} 
              variant="primary"
              className="custom-progress"
            />
            <div className="credits-info">
              <motion.div 
                className="credits-remaining"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              >
                {generationsLeft}
                <span className="credits-label">remaining</span>
              </motion.div>
              <div className="credits-total">of {maxGenerations}</div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons Grid */}
        <Row className="g-4 mt-2">
          {actionButtons.map((button, index) => (
            <Col md={6} key={index}>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: button.delay + 0.3, duration: 0.5 }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={button.onClick}
                  className="action-button"
                  style={{ background: button.background }}
                >
                  <div className="button-icon">{button.icon}</div>
                  <div className="button-text">{button.text}</div>
                </Button>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </motion.div>
  );
};

export default Home;