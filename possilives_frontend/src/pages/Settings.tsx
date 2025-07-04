import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Badge, Tab, Tabs } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  FaCog, 
  FaBell, 
  FaUser, 
  FaShieldAlt, 
  FaSave, 
  FaRedo, 
  FaTrash, 
  FaExclamationTriangle,
  FaLightbulb,
  FaRobot,
  FaChartBar,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaClock,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import { api } from '../api/axiosConfig.ts';
import './Settings.css';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  recommendationNotifications: boolean;
  systemNotifications: boolean;
  alertNotifications: boolean;
  habitAnalysisFrequency: 'daily' | 'weekly' | 'monthly';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  dataSharing: boolean;
  analyticsTracking: boolean;
  marketingEmails: boolean;
}

interface GeneralSettings {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{type: 'success' | 'danger' | 'info', message: string} | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    recommendationNotifications: true,
    systemNotifications: true,
    alertNotifications: true,
    habitAnalysisFrequency: 'weekly',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00'
    }
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    language: 'en',
    timezone: 'Asia/Kuala_Lumpur',
    theme: 'light',
    autoSave: true
  });

  const [originalSettings, setOriginalSettings] = useState({
    notification: {} as NotificationSettings,
    privacy: {} as PrivacySettings,
    general: {} as GeneralSettings
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        showAlert('danger', 'User not found');
        return;
      }

      // In a real app, you'd load these from an API
      // For now, we'll use localStorage with defaults
      const savedNotificationSettings = localStorage.getItem('notificationSettings');
      const savedPrivacySettings = localStorage.getItem('privacySettings');
      const savedGeneralSettings = localStorage.getItem('generalSettings');

      if (savedNotificationSettings) {
        const parsed = JSON.parse(savedNotificationSettings);
        setNotificationSettings(parsed);
        setOriginalSettings(prev => ({ ...prev, notification: parsed }));
      } else {
        setOriginalSettings(prev => ({ ...prev, notification: notificationSettings }));
      }

      if (savedPrivacySettings) {
        const parsed = JSON.parse(savedPrivacySettings);
        setPrivacySettings(parsed);
        setOriginalSettings(prev => ({ ...prev, privacy: parsed }));
      } else {
        setOriginalSettings(prev => ({ ...prev, privacy: privacySettings }));
      }

      if (savedGeneralSettings) {
        const parsed = JSON.parse(savedGeneralSettings);
        setGeneralSettings(parsed);
        setOriginalSettings(prev => ({ ...prev, general: parsed }));
      } else {
        setOriginalSettings(prev => ({ ...prev, general: generalSettings }));
      }

    } catch (error) {
      console.error('Error loading settings:', error);
      showAlert('danger', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage (in a real app, you'd save to API)
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
      localStorage.setItem('generalSettings', JSON.stringify(generalSettings));

      // Update original settings
      setOriginalSettings({
        notification: { ...notificationSettings },
        privacy: { ...privacySettings },
        general: { ...generalSettings }
      });

      showAlert('success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert('danger', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setNotificationSettings(originalSettings.notification);
    setPrivacySettings(originalSettings.privacy);
    setGeneralSettings(originalSettings.general);
    setShowResetModal(false);
    showAlert('info', 'Settings reset to last saved state');
  };

  const resetToDefaults = () => {
    const defaultNotificationSettings: NotificationSettings = {
      emailNotifications: true,
      pushNotifications: true,
      recommendationNotifications: true,
      systemNotifications: true,
      alertNotifications: true,
      habitAnalysisFrequency: 'weekly',
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    };

    const defaultPrivacySettings: PrivacySettings = {
      profileVisibility: 'private',
      dataSharing: false,
      analyticsTracking: true,
      marketingEmails: false
    };

    const defaultGeneralSettings: GeneralSettings = {
      language: 'en',
      timezone: 'UTC',
      theme: 'light',
      autoSave: true
    };

    setNotificationSettings(defaultNotificationSettings);
    setPrivacySettings(defaultPrivacySettings);
    setGeneralSettings(defaultGeneralSettings);
    showAlert('info', 'Settings reset to defaults');
  };

  const showAlert = (type: 'success' | 'danger' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const hasChanges = () => {
    return JSON.stringify(notificationSettings) !== JSON.stringify(originalSettings.notification) ||
           JSON.stringify(privacySettings) !== JSON.stringify(originalSettings.privacy) ||
           JSON.stringify(generalSettings) !== JSON.stringify(originalSettings.general);
  };

  const triggerHabitAnalysis = async () => {
    try {
      setSaving(true);
      await api.post('/api/habit-analysis/trigger');
      showAlert('success', 'Habit analysis triggered successfully! Check your notifications for insights.');
    } catch (error) {
      console.error('Error triggering habit analysis:', error);
      showAlert('danger', 'Failed to trigger habit analysis');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="settings-container">
        {/* Header */}
        <Row className="settings-header mb-4">
          <Col>
            <h2 className="d-flex align-items-center">
              <FaCog className="me-3 text-primary" />
              Settings
            </h2>
            <p className="text-muted mb-0">Manage your account preferences and notifications</p>
          </Col>
        </Row>

        {/* Alert */}
        {alert && (
          <Row className="mb-4">
            <Col>
              <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>
                {alert.message}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Settings Tabs */}
        <Row>
          <Col>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'general')}
              className="mb-4 settings-tabs"
            >
              {/* General Settings Tab */}
              <Tab eventKey="general" title={
                <span>
                  <FaCog className="me-2" />
                  General
                </span>
              }>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">General Preferences</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Language</Form.Label>
                          <Form.Select
                            value={generalSettings.language}
                            onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Timezone</Form.Label>
                          <Form.Select
                            value={generalSettings.timezone}
                            onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                          >
                            <option value="UTC">UTC</option>
                            <option value="EST">Eastern Time</option>
                            <option value="PST">Pacific Time</option>
                            <option value="GMT">GMT</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Theme</Form.Label>                      <div className="d-flex gap-3">
                        {[
                          { value: 'light', label: 'Light', icon: FaEye },
                          { value: 'dark', label: 'Dark', icon: FaEyeSlash },
                          { value: 'auto', label: 'Auto', icon: FaCog }
                        ].map(theme => (
                          <Form.Check
                            key={theme.value}
                            type="radio"
                            id={`theme-${theme.value}`}
                            name="theme"
                            label={
                              <span className="d-flex align-items-center">
                                <theme.icon className="me-2" />
                                {theme.label}
                              </span>
                            }
                            checked={generalSettings.theme === theme.value}
                            onChange={() => setGeneralSettings(prev => ({ ...prev, theme: theme.value as any }))}
                          />
                        ))}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="auto-save"
                        label="Auto-save changes"
                        checked={generalSettings.autoSave}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                      />
                      <Form.Text className="text-muted">
                        Automatically save your changes without manual confirmation
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Tab>

              {/* Notification Settings Tab */}
              <Tab eventKey="notifications" title={
                <span>
                  <FaBell className="me-2" />
                  Notifications
                </span>
              }>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Notification Preferences</h5>
                  </Card.Header>
                  <Card.Body>
                    {/* Basic Notification Settings */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2">Communication</h6>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          id="email-notifications"
                          label={
                            <span className="d-flex align-items-center">
                              <FaEnvelope className="me-2" />
                              Email Notifications
                            </span>
                          }
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            emailNotifications: e.target.checked 
                          }))}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          id="push-notifications"
                          label={
                            <span className="d-flex align-items-center">
                              <FaBell className="me-2" />
                              Push Notifications
                            </span>
                          }
                          checked={notificationSettings.pushNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            pushNotifications: e.target.checked 
                          }))}
                        />
                      </Form.Group>
                    </div>

                    {/* Notification Types */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2">Notification Types</h6>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          id="recommendation-notifications"
                          label={
                            <span className="d-flex align-items-center">
                              <FaLightbulb className="me-2" />
                              AI Recommendations
                              <Badge bg="warning" className="ms-2">New</Badge>
                            </span>
                          }
                          checked={notificationSettings.recommendationNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            recommendationNotifications: e.target.checked 
                          }))}
                        />
                        <Form.Text className="text-muted">
                          Receive personalized habit and lifestyle recommendations
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          id="system-notifications"
                          label={
                            <span className="d-flex align-items-center">
                              <FaCog className="me-2" />
                              System Notifications
                            </span>
                          }
                          checked={notificationSettings.systemNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            systemNotifications: e.target.checked 
                          }))}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          id="alert-notifications"
                          label={
                            <span className="d-flex align-items-center">
                              <FaExclamationTriangle className="me-2" />
                              Alert Notifications
                            </span>
                          }
                          checked={notificationSettings.alertNotifications}
                          onChange={(e) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            alertNotifications: e.target.checked 
                          }))}
                        />
                      </Form.Group>
                    </div>

                    {/* Habit Analysis Settings */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2">AI Analysis</h6>
                      <Form.Group className="mb-3">
                        <Form.Label>Habit Analysis Frequency</Form.Label>
                        <Form.Select
                          value={notificationSettings.habitAnalysisFrequency}
                          onChange={(e) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            habitAnalysisFrequency: e.target.value as any 
                          }))}
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                          How often should AI analyze your habits for recommendations?
                        </Form.Text>
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={triggerHabitAnalysis}
                          disabled={saving}
                        >
                          <FaRobot className="me-1" />
                          {saving ? 'Analyzing...' : 'Trigger Analysis Now'}
                        </Button>
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2">Quiet Hours</h6>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="switch"
                          id="quiet-hours"
                          label={
                            <span className="d-flex align-items-center">
                              <FaClock className="me-2" />
                              Enable Quiet Hours
                            </span>
                          }
                          checked={notificationSettings.quietHours.enabled}
                          onChange={(e) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, enabled: e.target.checked }
                          }))}
                        />
                      </Form.Group>

                      {notificationSettings.quietHours.enabled && (
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Start Time</Form.Label>
                              <Form.Control
                                type="time"
                                value={notificationSettings.quietHours.startTime}
                                onChange={(e) => setNotificationSettings(prev => ({ 
                                  ...prev, 
                                  quietHours: { ...prev.quietHours, startTime: e.target.value }
                                }))}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>End Time</Form.Label>
                              <Form.Control
                                type="time"
                                value={notificationSettings.quietHours.endTime}
                                onChange={(e) => setNotificationSettings(prev => ({ 
                                  ...prev, 
                                  quietHours: { ...prev.quietHours, endTime: e.target.value }
                                }))}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Tab>

              {/* Privacy Settings Tab */}
              <Tab eventKey="privacy" title={
                <span>
                  <FaShieldAlt className="me-2" />
                  Privacy
                </span>
              }>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Privacy & Data</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Profile Visibility</Form.Label>
                      <div className="d-flex gap-3">
                        <Form.Check
                          type="radio"
                          id="profile-public"
                          name="profileVisibility"
                          label="Public"
                          checked={privacySettings.profileVisibility === 'public'}
                          onChange={() => setPrivacySettings(prev => ({ ...prev, profileVisibility: 'public' }))}
                        />
                        <Form.Check
                          type="radio"
                          id="profile-private"
                          name="profileVisibility"
                          label="Private"
                          checked={privacySettings.profileVisibility === 'private'}
                          onChange={() => setPrivacySettings(prev => ({ ...prev, profileVisibility: 'private' }))}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="data-sharing"
                        label="Allow Data Sharing for Research"
                        checked={privacySettings.dataSharing}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, dataSharing: e.target.checked }))}
                      />
                      <Form.Text className="text-muted">
                        Help improve our AI recommendations by sharing anonymized usage data
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="analytics-tracking"
                        label="Analytics Tracking"
                        checked={privacySettings.analyticsTracking}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, analyticsTracking: e.target.checked }))}
                      />
                      <Form.Text className="text-muted">
                        Allow us to track your usage to improve the app experience
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        id="marketing-emails"
                        label="Marketing Emails"
                        checked={privacySettings.marketingEmails}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                      />
                      <Form.Text className="text-muted">
                        Receive emails about new features and updates
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Tab>

              {/* Account Tab */}
              <Tab eventKey="account" title={
                <span>
                  <FaUser className="me-2" />
                  Account
                </span>
              }>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Account Management</h5>
                  </Card.Header>
                  <Card.Body>
                    <Alert variant="info">
                      <h6>Data Export</h6>
                      <p className="mb-2">Download all your data including personality profiles, habits, and generated futures.</p>
                      <Button variant="outline-info" size="sm">
                        <FaChartBar className="me-1" />
                        Export Data
                      </Button>
                    </Alert>

                    <Alert variant="warning">
                      <h6>Reset Settings</h6>
                      <p className="mb-2">Reset all settings to their default values.</p>
                      <Button variant="outline-warning" size="sm" onClick={() => setShowResetModal(true)}>
                        <FaRedo className="me-1" />
                        Reset to Defaults
                      </Button>
                    </Alert>

                    <Alert variant="danger">
                      <h6>Danger Zone</h6>
                      <p className="mb-2">Once you delete your account, there is no going back. Please be certain.</p>
                      <Button variant="outline-danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                        <FaTrash className="me-1" />
                        Delete Account
                      </Button>
                    </Alert>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </Col>
        </Row>

        {/* Action Buttons */}
        {hasChanges() && (
          <Row className="mt-4">
            <Col className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={resetSettings}
                disabled={saving}
              >
                <FaRedo className="me-1" />
                Reset Changes
              </Button>
              <Button
                variant="primary"
                onClick={saveSettings}
                disabled={saving}
              >
                <FaSave className="me-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Col>
          </Row>
        )}

        {/* Delete Account Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <FaTrash className="me-2" />
              Delete Account
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert variant="danger">
              <FaExclamationTriangle className="me-2" />
              This action cannot be undone. All your data will be permanently deleted.
            </Alert>
            <p>Are you sure you want to delete your account?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => {
              // Handle account deletion
              setShowDeleteModal(false);
              showAlert('info', 'Account deletion feature coming soon');
            }}>
              Delete Account
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Reset Modal */}
        <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaRedo className="me-2" />
              Reset Settings
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to reset all settings to their default values?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={() => {
              resetToDefaults();
              setShowResetModal(false);
            }}>
              Reset to Defaults
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </motion.div>
  );
};

export default Settings;
