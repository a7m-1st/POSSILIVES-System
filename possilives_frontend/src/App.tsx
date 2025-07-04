import './App.css'
import './styles/animations.css'
import React, { useEffect } from 'react';
import Layout from './components/Layout/Layout.tsx';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

//Pages
import Login from "./pages/Login.tsx";
import Home from './pages/Home/Home.tsx';
import Verify from './pages/Verify.tsx';
import CreateProfile from './pages/CreateProfile.tsx';
import TestBridge from './pages/TestBridge.tsx';
import Recorder from './pages/Recorder.tsx';
import Result from './pages/Result.tsx';
import EnhancedResult from './pages/EnhancedResult.tsx';
import SelectHabits from './pages/SelectHabits.tsx';
import LoadingContext from './hooks/LoadingContext.tsx';
import Generate from './pages/Generate.tsx';
import Gallery from './pages/Gallery.tsx';
import SingleFuture from './pages/SingleFuture.tsx';
import Loading from './components/Layout/Loading/Loading.tsx';
import Account from './pages/Account/Account.tsx';

//keycloak
import { useKeycloak } from '@react-keycloak/web';
import keycloakInst from './services/keycloak.ts';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { initUser } from './api/axiosConfig.ts';
import Prediction from './components/Personality/Prediction/Prediction.js';
import Personality from './components/Personality/index.tsx';
import Statistics from './pages/Statistics/Statistics.tsx';
import Whatif from './pages/Whatif.tsx';
import ManageFactors from './pages/ManageFactors.tsx';
import Notification from './pages/Notification/Notification.tsx';
import Settings from './pages/Settings.tsx';
import { checkUserProfileStatus, getNextProfileStep } from './utils/profileUtils.ts';

const initOptions = { 
  onLoad: 'login-required', 
  checkLoginIframe: false, // Disable the login status check iframe
  pkceMethod: 'S256',
  responseMode: "query", //Less safe than fragment
};

const ProtectedRoute: React.FC = () => {
  const [userId, setUserId] = React.useState("");
  const [profileComplete, setProfileComplete] = React.useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  try {
    const { keycloak, initialized } = useKeycloak();
    
    useEffect(() => {
      if (!initialized) {
        return;
      }

      const fetchUserData = async () => {
        try {
          const userData = await initUser();
          if (userData) {
            setUserId(userData);
            localStorage.setItem('userId', userData);
            console.log("User ID fetched and stored:", userData);
            
            // Check complete profile status using the utility function
            const profileStatus = await checkUserProfileStatus();
            
            // If profile is not complete and user is not on a profile setup page, redirect
            const profileSetupPages = [
              '/createprofile', 
              '/testbridge', 
              '/big5test', 
              '/smartpersonality', 
              '/big5result', 
              '/newhabits'
            ];
            
            const isOnProfileSetupPage = profileSetupPages.some(page => 
              location.pathname.includes(page)
            );
            
            if (!profileStatus.profileComplete && !isOnProfileSetupPage) {
              const nextStep = getNextProfileStep(profileStatus);
              console.log("Redirecting to next profile step:", nextStep);
              navigate(nextStep);
            } else if (profileStatus.profileComplete) {
              // Mark profile as complete in localStorage for faster checks
              localStorage.setItem('profileComplete', 'true');
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // If there's an error fetching user data, redirect to profile creation
          navigate('/createprofile');
        }
      };
  
      fetchUserData();
    }, [initialized, location.pathname, navigate]);
  
    if (!initialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Service...</p>
          </div>
        </div>
      );
    }
  
    return <Outlet />;
  } catch (error) {
    console.error("Error in ProtectedRoute:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error initializing Service...</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
};

export const RedirectRoute: React.FC = () => {
  try {
    const { keycloak, initialized } = useKeycloak();
  
    //If not logged in then redirect
    useEffect(() => {
      if (initialized) {
        if (!keycloak.authenticated) {
          console.log("Keycloak not authenticated, redirecting to login...");
          keycloak.login();
        }
      } else new Error("Keycloak not initialized,")
    }, [initialized, keycloak]);
    
  
    if (!initialized || !keycloak.authenticated) {
      console.warn('Keycloak not initialized or is not authenticated.');
      return <div>Loading Service...</div>;
    }
  
  //Account Authenticated - redirect to create profile
  return <Navigate to={"/createprofile"} replace />;
  } catch (error) {
    console.error("Error in RedirectRoute:", error);
  }
};

function App() {
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="App">
      <ReactKeycloakProvider 
        authClient={keycloakInst} 
        initOptions={initOptions}
      >
        <LoadingContext.Provider value={{ loading, setLoading }}>
          <Router>
            <Routes>
              <Route path="/login" element={<RedirectRoute />} />

              <Route element={<ProtectedRoute/>}>
                {/* <Route path="/verify" element={<Verify />} /> */}
                <Route path="/createprofile" element={<CreateProfile />} />
                <Route path="/testbridge" element={<TestBridge />} />
                <Route path="/big5test" element={<Personality/>} />
                <Route path="/prediction" element={<Prediction/>} />
                <Route path="/smartpersonality" element={<Recorder />} />
                <Route path="/big5result" element={<EnhancedResult />} />
                <Route path="/newhabits" element={<SelectHabits />} />

                {/* Render the child routes with Layout */}
                <Route path="/" element={<Layout/>}>
                  <Route index element={<Home />} />
                  <Route path="home" element={<Home />} />
                  <Route path="generate" element={<Generate />} />
                  <Route path="gallery" element={<Gallery />} />
                  <Route path="future" element={<SingleFuture />} />
                  <Route path="future/:edit" element={<SingleFuture />} />
                  <Route path="account" element={<Account />} />
                  <Route path="statistics" element={<Statistics />} />
                  <Route path="whatif" element={<Whatif />} />
                  <Route path="manage-factors" element={<ManageFactors />} />
                  <Route path="notification" element={<Notification />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

              <Route path="*" element={<h1>Not Found</h1>} />
              </Route>
            </Routes>
          </Router>
        </LoadingContext.Provider>
      </ReactKeycloakProvider>
    </div>
  )
}

export default App