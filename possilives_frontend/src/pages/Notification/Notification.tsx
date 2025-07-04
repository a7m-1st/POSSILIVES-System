import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBell, 
  FaLightbulb, 
  FaExclamationCircle, 
  FaCog, 
  FaCheck, 
  FaFilter,
  FaRedo,
  FaCalendarAlt,
  FaStar,
  FaChartBar,
  FaClock,
  FaRobot
} from 'react-icons/fa';
import { api } from '../../api/axiosConfig.ts';
import { formatDistance } from 'date-fns';
import './Notification.css';

interface Notification {
  notif_id: string;
  title: string;
  description: string;
  type: 'RECOMMENDATION' | 'ALERT' | 'SYSTEM';
  seen: boolean;
  sentEmail: boolean;
  link?: string;
  createdAt: string;
  updatedAt?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  actionable?: boolean;
  metadata?: {
    aiConfidence?: number;
    habitId?: string;
    recommendationType?: 'HABIT_IMPROVEMENT' | 'NEW_HABIT' | 'SCHEDULE_OPTIMIZATION' | 'WELLNESS_TIP';
    actionTaken?: string;
  };
}

type FilterType = 'ALL' | 'RECOMMENDATION' | 'ALERT' | 'SYSTEM' | 'UNREAD';

const Notification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'danger' | 'info', message: string} | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [notifications, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not found');
        return;
      }

      const response = await api.get(`/api/notifications/${userId}`);
      const sortedNotifications = response.data.sort((a: Notification, b: Notification) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sortedNotifications);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...notifications];
    
    switch (filter) {
      case 'RECOMMENDATION':
      case 'ALERT':
      case 'SYSTEM':
        filtered = filtered.filter(notif => notif.type === filter);
        break;
      case 'UNREAD':
        filtered = filtered.filter(notif => !notif.seen);
        break;
      default:
        // ALL - no filtering
        break;
    }
    
    setFilteredNotifications(filtered);
  };

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    
    // Mark as read if not already seen
    if (!notification.seen) {
      await markAsRead(notification.notif_id);
    }
  };

  const markAsRead = async (notifId: string) => {
    try {
      const userId = localStorage.getItem('userId');
      await api.get(`/api/notifications/read/${userId}/${notifId}`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.notif_id === notifId ? { ...notif, seen: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(notif => !notif.seen);
    
    for (const notif of unreadNotifications) {
      await markAsRead(notif.notif_id);
    }
  };
  const refreshNotifications = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleRecommendationAction = async (notificationId: string, action: 'ACCEPT' | 'DISMISS' | 'SNOOZE') => {
    try {
      const userId = localStorage.getItem('userId');
      
      await api.post(`/api/notifications/recommendation-action`, {
        userId,
        notificationId,
        action,
        timestamp: new Date().toISOString()
      });
      
      // Update local state to reflect the action
      setNotifications(prev => 
        prev.map(notif => 
          notif.notif_id === notificationId 
            ? { ...notif, seen: true, metadata: { ...notif.metadata, actionTaken: action } }
            : notif
        )
      );
      
      setAlert({ type: 'success', message: `Recommendation ${action.toLowerCase()}ed successfully` });
    } catch (err) {
      console.error('Error handling recommendation action:', err);
      setAlert({ type: 'danger', message: 'Failed to process recommendation action' });
    }
  };

  const triggerNewRecommendations = async () => {
    try {
      setRefreshing(true);
      const userId = localStorage.getItem('userId');
      
      await api.post(`/api/habit-analysis/trigger`, { userId });
      
      // Wait a moment and then refresh notifications
      setTimeout(async () => {
        await loadNotifications();
        setAlert({ type: 'info', message: 'New recommendations are being generated based on your recent activity' });
      }, 2000);
      
    } catch (err) {
      console.error('Error triggering new recommendations:', err);
      setAlert({ type: 'danger', message: 'Failed to generate new recommendations' });
    } finally {
      setRefreshing(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'RECOMMENDATION':
        return <FaLightbulb className="text-warning" />;
      case 'ALERT':
        return <FaExclamationCircle className="text-danger" />;
      case 'SYSTEM':
        return <FaCog className="text-info" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };
  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case 'RECOMMENDATION':
        return 'warning';
      case 'ALERT':
        return 'danger';
      case 'SYSTEM':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getRecommendationTypeIcon = (type?: string) => {
    switch (type) {
      case 'HABIT_IMPROVEMENT':
        return <FaChartBar className="text-success" />;
      case 'NEW_HABIT':
        return <FaStar className="text-primary" />;
      case 'SCHEDULE_OPTIMIZATION':
        return <FaClock className="text-info" />;
      case 'WELLNESS_TIP':
        return <FaLightbulb className="text-warning" />;
      default:
        return <FaRobot className="text-secondary" />;
    }
  };

  const unreadCount = notifications.filter(notif => !notif.seen).length;

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadNotifications}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="notifications-container">
        {/* Alert Display */}
        {alert && (
          <Row className="mb-3">
            <Col>
              <Alert 
                variant={alert.type} 
                dismissible 
                onClose={() => setAlert(null)}
              >
                {alert.message}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Header */}
        <Row className="notifications-header mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="d-flex align-items-center">
                  <FaBell className="me-3 text-primary" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge bg="danger" className="ms-2">
                      {unreadCount}
                    </Badge>
                  )}
                </h2>
                <p className="text-muted mb-0">Stay updated with your personalized insights</p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={refreshNotifications}
                  disabled={refreshing}
                >
                  <FaRedo className={refreshing ? 'fa-spin' : ''} />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <FaCheck className="me-1" />
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col>
            <Card className="filter-card">
              <Card.Body className="py-2">
                <div className="d-flex align-items-center gap-3">
                  <FaFilter className="text-muted" />
                  <div className="d-flex gap-2 flex-wrap">
                    {[
                      { key: 'ALL', label: 'All', count: notifications.length },
                      { key: 'UNREAD', label: 'Unread', count: unreadCount },
                      { key: 'RECOMMENDATION', label: 'Recommendations', count: notifications.filter(n => n.type === 'RECOMMENDATION').length },
                      { key: 'ALERT', label: 'Alerts', count: notifications.filter(n => n.type === 'ALERT').length },
                      { key: 'SYSTEM', label: 'System', count: notifications.filter(n => n.type === 'SYSTEM').length }
                    ].map(filterOption => (
                      <Button
                        key={filterOption.key}
                        variant={filter === filterOption.key ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setFilter(filterOption.key as FilterType)}
                        className="filter-button"
                      >
                        {filterOption.label}
                        {filterOption.count > 0 && (
                          <Badge 
                            bg={filter === filterOption.key ? 'light' : 'secondary'} 
                            text={filter === filterOption.key ? 'dark' : 'light'}
                            className="ms-1"
                          >
                            {filterOption.count}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Notifications List */}
        <Row>
          <Col>
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="empty-state">
                    <Card.Body className="text-center py-5">
                      <FaBell size={48} className="text-muted mb-3" />
                      <h5>No notifications found</h5>
                      <p className="text-muted">
                        {filter === 'ALL' 
                          ? "You're all caught up! No notifications to show."
                          : `No ${filter.toLowerCase()} notifications found.`
                        }
                      </p>
                    </Card.Body>
                  </Card>
                </motion.div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.notif_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-3"
                  >
                    <Card 
                      className={`notification-card ${!notification.seen ? 'notification-unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Card.Body>
                        <div className="d-flex align-items-start">
                          <div className="notification-icon me-3">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="notification-title mb-0">
                                {notification.title}
                                {!notification.seen && (
                                  <span className="unread-indicator ms-2"></span>
                                )}
                              </h6>
                              <div className="d-flex align-items-center gap-2">
                                <Badge bg={getNotificationBadgeVariant(notification.type)}>
                                  {notification.type}
                                </Badge>
                                <small className="text-muted">
                                  <FaCalendarAlt className="me-1" />
                                  {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
                                </small>
                              </div>
                            </div>
                            <p className="notification-description mb-0">
                              {notification.description.length > 150 
                                ? `${notification.description.substring(0, 150)}...`
                                : notification.description
                              }
                            </p>
                            {notification.type === 'RECOMMENDATION' && (
                              <div className="mt-2">
                                <Badge bg="outline-warning" className="recommendation-badge">
                                  <FaStar className="me-1" />
                                  AI Recommendation
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </Col>
        </Row>

        {/* Notification Detail Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center">
              {selectedNotification && getNotificationIcon(selectedNotification.type)}
              <span className="ms-2">{selectedNotification?.title}</span>
              {selectedNotification && (
                <Badge 
                  bg={getNotificationBadgeVariant(selectedNotification.type)}
                  className="ms-2"
                >
                  {selectedNotification.type}
                </Badge>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedNotification && (
              <div>
                <div className="mb-3">
                  <small className="text-muted">
                    <FaCalendarAlt className="me-1" />
                    Received {formatDistance(new Date(selectedNotification.createdAt), new Date(), { addSuffix: true })}
                  </small>
                </div>
                <div className="notification-content">
                  {selectedNotification.description.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
                {selectedNotification.link && (
                  <div className="mt-3">
                    <Button 
                      variant="primary" 
                      href={selectedNotification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </motion.div>
  );
};

export default Notification;
