import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ProfilePage from './components/ProfilePage';
import MessagingPage from './components/MessagingPage';
import MessengerPopover from './components/MessengerPopover';
import './App.css';

// Protected Route wrapper component
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Main App component with routing
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        // Only redirect to dashboard if user is on login page and logged in
        if (session?.user && location.pathname === '/login') {
          navigate('/', { replace: true });
        }
        // If user is not logged in and not on login page, redirect to login
        else if (!session?.user && location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          // Only navigate to dashboard if currently on login page
          if (location.pathname === '/login') {
            navigate('/', { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const handleLoginSuccess = (user) => {
    setUser(user);
    navigate('/', { replace: true });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login', { replace: true });
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  const handleNavigateToMessaging = () => {
    // Open messenger popover instead of navigating to messaging page
    setIsMessengerOpen(true);
  };

  const handleToggleMessenger = () => {
    setIsMessengerOpen(!isMessengerOpen);
  };

  const handleNavigateToConnects = () => {
    navigate('/connects');
  };

  const handleNavigateToOpenings = () => {
    navigate('/openings');
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fff8f0' }}>
        <div className="text-center">
          <img src="/logo.png" alt="Teacher-meet" className="h-16 w-16 mx-auto mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        
        {/* Dashboard Route */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute user={user}>
              <DashboardPage 
                user={user} 
                onLogout={handleLogout} 
                onNavigateToProfile={handleNavigateToProfile}
                onNavigateToMessaging={handleNavigateToMessaging}
                onNavigateToConnects={handleNavigateToConnects}
                onNavigateToOpenings={handleNavigateToOpenings}
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile Route */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute user={user}>
              <ProfilePage user={user} onBack={handleBackToDashboard} />
            </ProtectedRoute>
          } 
        />
        
        {/* Messaging Route */}
        <Route 
          path="/messaging" 
          element={
            <ProtectedRoute user={user}>
              <MessagingPage user={user} onBack={handleBackToDashboard} />
            </ProtectedRoute>
          } 
        />
        
        {/* My Connects Route */}
        <Route 
          path="/connects" 
          element={
            <ProtectedRoute user={user}>
              <DashboardPage 
                user={user} 
                onLogout={handleLogout} 
                onNavigateToProfile={handleNavigateToProfile}
                onNavigateToMessaging={handleNavigateToMessaging}
                onNavigateToConnects={handleNavigateToConnects}
                onNavigateToOpenings={handleNavigateToOpenings}
                currentPage="connects"
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Openings Route */}
        <Route 
          path="/openings" 
          element={
            <ProtectedRoute user={user}>
              <DashboardPage 
                user={user} 
                onLogout={handleLogout} 
                onNavigateToProfile={handleNavigateToProfile}
                onNavigateToMessaging={handleNavigateToMessaging}
                onNavigateToConnects={handleNavigateToConnects}
                onNavigateToOpenings={handleNavigateToOpenings}
                currentPage="openings"
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect any unknown routes */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>

      {/* Messenger Popover - Available on all authenticated pages */}
      {user && location.pathname !== '/login' && (
        <MessengerPopover 
          isOpen={isMessengerOpen}
          onToggle={handleToggleMessenger}
          user={user}
        />
      )}
    </>
  );
}

// Main App component with Router wrapper
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

