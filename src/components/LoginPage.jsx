import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { BookOpen, Users, Calendar, Award, MessageCircle, Smartphone } from 'lucide-react';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      
      if (isRegistering) {
        // Sign up new user
        result = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (result.error) {
          throw result.error;
        }
        
        if (result.data.user && !result.data.user.email_confirmed_at) {
          setError('Please check your email for verification link');
          setLoading(false);
          return;
        }
      } else {
        // Sign in existing user
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (result.error) {
          throw result.error;
        }
      }
      
      if (result.data.user && onLoginSuccess) {
        onLoginSuccess(result.data.user);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      setError(error.message);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
      });
      if (error) throw error;
    } catch (error) {
      console.error('Microsoft sign in error:', error);
      setError(error.message);
    }
  };

  if (showEmailForm) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto pt-20 px-4">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Teacher-meet.com" className="h-12 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900">
              {isRegistering ? 'Join Teacher-meet' : 'Sign in to Teacher-meet'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isRegistering ? 'Join now' : 'Sign in')}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-600 hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign in' : 'New to Teacher-meet? Join now'}
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => setShowEmailForm(false)}
              className="text-gray-600 hover:underline"
            >
              ← Back to sign-in options
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="Teacher-meet.com" className="h-8 w-8 mr-2" />
              <span className="text-xl font-semibold text-blue-600">Teacher-meet</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                <BookOpen className="h-5 w-5 mr-1" />
                Resources
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                <Users className="h-5 w-5 mr-1" />
                Educators
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                <Calendar className="h-5 w-5 mr-1" />
                Learning
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                <Award className="h-5 w-5 mr-1" />
                Events
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                <MessageCircle className="h-5 w-5 mr-1" />
                Groups
              </a>
              <a href="#" className="flex items-center text-gray-600 hover:text-gray-900">
                <Smartphone className="h-5 w-5 mr-1" />
                Get the app
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Join now</span>
              <button className="bg-transparent border border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-50">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-16">
          {/* Left Side - Welcome Message and Sign-in */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-light text-gray-700 mb-8 leading-tight">
              Welcome to your professional community
            </h1>
            
            <div className="space-y-4 max-w-md">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
              <button
                onClick={handleMicrosoftSignIn}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                  <path fill="#7fba00" d="M1 13h10v10H1z"/>
                  <path fill="#ffb900" d="M13 13h10v10H13z"/>
                </svg>
                Continue with Microsoft
              </button>
              
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign in with email
              </button>
            </div>

            <div className="mt-8 text-sm text-gray-600">
              By clicking Continue to join or sign in, you agree to Teacher-meet's{' '}
              <a href="#" className="text-blue-600 hover:underline">User Agreement</a>,{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>, and{' '}
              <a href="#" className="text-blue-600 hover:underline">Cookie Policy</a>.
            </div>

            <div className="mt-6 text-center">
              <span className="text-gray-600">New to Teacher-meet? </span>
              <button 
                onClick={() => {
                  setIsRegistering(true);
                  setShowEmailForm(true);
                }}
                className="text-blue-600 hover:underline font-medium"
              >
                Join now
              </button>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect with Educators</h3>
                  <p className="text-gray-600">Join a global community of teachers, professors, and education professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;

