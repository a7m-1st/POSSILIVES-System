import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Nav, Badge, ProgressBar, Image, Tab, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaUser, FaChartBar, FaListUl, FaLightbulb, FaPencilAlt, FaEnvelope, FaBriefcase, FaHeart, FaUsers, FaCalendarAlt, FaCheckCircle, FaCircle } from "react-icons/fa";
import LoadingContext from "../../hooks/LoadingContext.tsx";
import { api } from "../../api/axiosConfig.ts";
import Markdown from "markdown-to-jsx";
import "./Account.css";

const Account = () => {
  const { loading, setLoading } = React.useContext(LoadingContext);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const loadData = async () => {
      try {
        // setLoading(true);
        const userResponse = await api.post(`/api/users/getUser`);
        const userData = userResponse.data;
        setUser(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const personalityBarColors = {
    conscientiousness: "success",
    openness: "info",
    extraversion: "warning",
    neuroticism: "danger",
    agreeableness: "primary"
  };

  const getPersonalityDescription = (trait, value) => {
    const descriptions = {
      conscientiousness: {
        high: "Organized, responsible, and hardworking",
        medium: "Balanced between organization and flexibility",
        low: "Spontaneous, flexible, and casual"
      },
      openness: {
        high: "Curious, creative, and open to new experiences",
        medium: "Balanced between tradition and innovation",
        low: "Practical, conventional, and prefers routine"
      },
      extraversion: {
        high: "Outgoing, energetic, and social",
        medium: "Balanced between social and solitary activities",
        low: "Reserved, thoughtful, and values alone time"
      },
      neuroticism: {
        high: "Sensitive, emotional, and prone to stress",
        medium: "Moderately stable emotional responses",
        low: "Calm, emotionally stable, and resilient"
      },
      agreeableness: {
        high: "Cooperative, compassionate, and trusting",
        medium: "Balanced between cooperation and self-interest",
        low: "Competitive, critical, and analytical"
      }
    };
    
    let level = "medium";
    if (value > 70) level = "high";
    if (value < 30) level = "low";
    
    return descriptions[trait][level];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (loading || !user) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="account-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Container>
        <motion.div variants={itemVariants} className="account-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {user.username?.charAt(0) || "U"}
            </div>
            <div className="profile-details">
              <h1>{user.username || "User"}</h1>
              <p className="profile-stats">
                {
                  user.is_verified ?
                    <Badge bg="success" className="status-badge">
                      <FaCheckCircle /> Verified
                    </Badge>
                    :<Badge bg="warning" className="status-badge">
                      <FaCircle /> Unverified
                    </Badge>
                }
                
                <span className="joined-date">
                  <FaCalendarAlt /> Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "details")}>
          <Row className="mt-4">
            <Col md={3}>
              <motion.div variants={itemVariants}>
                <Nav variant="pills" className="flex-column account-nav">
                  <Nav.Item>
                    <Nav.Link eventKey="details" className="d-flex align-items-center">
                      <FaUser className="nav-icon" /> Profile Details
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="personality" className="d-flex align-items-center">
                      <FaChartBar className="nav-icon" /> Personality Traits
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="habits" className="d-flex align-items-center">
                      <FaListUl className="nav-icon" /> Habits
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="generations" className="d-flex align-items-center">
                      <FaLightbulb className="nav-icon" /> Generated Futures
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </motion.div>
            </Col>
            
            <Col md={9}>
              <Tab.Content>
                {/* User Details Tab */}
                <Tab.Pane eventKey="details">
                  <motion.div 
                    className="tab-inner-content"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h2 className="section-title">
                      <FaUser /> Personal Information
                    </h2>
                    
                    <Row className="mt-4">
                      <Col md={6}>
                        <Card className="info-card">
                          <Card.Body>
                            <h3><FaEnvelope /> Contact</h3>
                            <p className="info-item"><strong>Email:</strong> {user.email}</p>
                            <p className="info-item"><strong>Username:</strong> {user.username}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="info-card">
                          <Card.Body>
                            <h3><FaUsers /> Social</h3>
                            <p className="info-item"><strong>Relationship Status:</strong> {user.relationship_status}</p>
                            <p className="info-item"><strong>Social Circle:</strong> {user.social_circle}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    
                    <Row className="mt-4">
                      <Col md={12}>
                        <Card className="info-card">
                          <Card.Body>
                            <h3><FaBriefcase /> Career</h3>
                            <div className="career-path">
                              <div className="career-current">
                                <h4>Current</h4>
                                <p>{user.current_career || "Not specified"}</p>
                              </div>
                              <div className="career-arrow">→</div>
                              <div className="career-future">
                                <h4>Future Goal</h4>
                                <p>{user.future_career || "Not specified"}</p>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </motion.div>
                </Tab.Pane>
                
                {/* Personality Traits Tab */}
                <Tab.Pane eventKey="personality">
                  <motion.div 
                    className="tab-inner-content"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h2 className="section-title">
                      <FaChartBar /> Personality Profile
                    </h2>
                    
                    {user.personalities.length > 0 ? (
                      user.personalities.reverse().map((personality, index) => (
                        <Card key={personality.personality_id} className="personality-card mb-4">
                          <Card.Body>
                            {index === 0 && <Badge bg="info">Latest Assessment</Badge>}
                            
                            <div className="personality-traits">
                              {Object.entries(personality)
                                .filter(([key]) => 
                                  ['conscientiousness', 'openness', 'extraversion', 'neuroticism', 'agreeableness'].includes(key)
                                )
                                .map(([trait, value]) => (
                                  <div key={trait} className="personality-trait">
                                    <div className="trait-header">
                                      <h4 className="trait-name">{trait.charAt(0).toUpperCase() + trait.slice(1)}</h4>
                                      <span className="trait-value">{value}%</span>
                                    </div>
                                    <ProgressBar 
                                      now={value} 
                                      variant={personalityBarColors[trait]} 
                                      className="trait-bar" 
                                    />
                                    <p className="trait-description">
                                      {getPersonalityDescription(trait, value)}
                                    </p>
                                  </div>
                                ))}
                            </div>
                            
                            <div className="personality-date">
                              Assessed on {new Date(personality.createdAt).toLocaleDateString()}
                            </div>
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No personality assessments available.</p>
                      </div>
                    )}
                  </motion.div>
                </Tab.Pane>
                
                {/* Habits Tab */}
                <Tab.Pane eventKey="habits">
                  <motion.div 
                    className="tab-inner-content"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h2 className="section-title">
                      <FaListUl /> Your Habits
                    </h2>
                    
                    <Row className="habit-cards">
                        {user.user_habits.length > 0 ? (
                        [...user.user_habits].reverse().map((habit) => (
                          <Col md={6} key={habit.user_habits_id} className="mb-4">
                          <motion.div 
                            whileHover={{ y: -5, boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}
                            className="h-100"
                          >
                            <Card className="habit-card h-100">
                            <Card.Body>
                              <div className="habit-header">
                              <h3>{habit.habit.title}</h3>
                              <Badge 
                                bg={habit.impact_rating > 7 ? "danger" : 
                                 habit.impact_rating > 4 ? "warning" : "success"}
                                className="impact-badge"
                              >
                                Impact: {habit.impact_rating}/10
                              </Badge>
                              </div>
                              
                              <p className="habit-description">{habit.habit.description}</p>
                              
                              <div className="habit-footer">
                              <small className="text-muted">
                                Added on {new Date(habit.createdAt).toLocaleDateString()}
                              </small>
                              {/* <Button variant="outline-primary" size="sm">
                                <FaPencilAlt /> Edit
                              </Button> */}
                              </div>
                            </Card.Body>
                            </Card>
                          </motion.div>
                          </Col>
                        ))
                        ) : (
                        <Col md={12}>
                          <div className="empty-state">
                            <p>No habits added yet.</p>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </motion.div>
                </Tab.Pane>
                
                {/* Generations Tab */}
                <Tab.Pane eventKey="generations">
                  <motion.div 
                    className="tab-inner-content"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h2 className="section-title">
                      <FaLightbulb /> Generated Futures
                    </h2>
                    
                    {user.generations.length > 0 ? (
                      user.generations.map((gen) => (
                        <motion.div 
                          key={gen.gen_id}
                          whileHover={{ y: -5 }}
                          className="mb-4"
                        >
                          <Card className="generation-card">
                            <Row className="g-0">
                              <Col md={gen.image ? 8 : 12}>
                                <Card.Body>
                                  <h3>{gen.title || "Untitled Future"}</h3>
                                  
                                  <div className="generation-content">
                                    <Markdown options={{ forceBlock: true }}>{gen.description}</Markdown>
                                  </div>
                                  
                                  <div className="generation-footer">
                                    <small className="text-muted">
                                      Generated on {new Date(gen.createdAt).toLocaleDateString()}
                                    </small>
                                  </div>
                                </Card.Body>
                              </Col>
                              {gen.image && (
                                <Col md={4}>
                                  <div className="generation-image-container">
                                    <Image src={gen.image} alt="Generated visualization" fluid />
                                  </div>
                                </Col>
                              )}
                            </Row>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No futures have been generated yet.</p>
                      </div>
                    )}
                  </motion.div>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </motion.div>
  );
};

export default Account;