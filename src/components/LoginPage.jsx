import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff } from 'lucide-react';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="min-h-screen flex">
        {/* Left Side - Login Form (Narrower) */}
        <div className="w-2/5 flex items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-16" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="max-w-sm w-full space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2563eb' }}>
                <span className="text-xl font-bold text-white">T</span>
              </div>
              <h2 className="text-2xl font-light text-gray-800 mb-2">
                {isRegistering ? 'Join Teacher-meet' : 'Sign in'}
              </h2>
              <p className="text-sm text-gray-600">
                {isRegistering ? 'Make the most of your professional life' : 'Stay updated on your professional world'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="text-red-600 text-xs text-center bg-red-50 p-2 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-2.5 rounded-full font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-lg"
                style={{ backgroundColor: '#2563eb' }}
              >
                {loading ? 'Please wait...' : (isRegistering ? 'Agree & Join now' : 'Sign in')}
              </button>
            </form>

            {!isRegistering && (
              <div className="text-center">
                <a href="#" className="text-blue-600 hover:underline text-xs">
                  Forgot password?
                </a>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600 hover:underline text-xs font-medium"
              >
                {isRegistering ? 'Already on Teacher-meet? Sign in' : 'New to Teacher-meet? Join now'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowEmailForm(false)}
                className="text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto text-xs"
              >
                ← Back
              </button>
            </div>

            {isRegistering && (
              <div className="mt-4 text-xs text-gray-500 text-center leading-relaxed">
                By clicking Agree & Join now, you agree to the Teacher-meet{' '}
                <a href="#" className="text-blue-600 hover:underline">User Agreement</a>,{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>, and{' '}
                <a href="#" className="text-blue-600 hover:underline">Cookie Policy</a>.
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Branding Image (Wider) */}
        <div className="hidden lg:block relative w-3/5">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/TeachermeetBigpic.png"
            alt="Teacher-meet - Inviting teachers, Let's Connect"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#2563eb' }}>
                <span className="text-xl font-bold text-white">T</span>
              </div>
              <span className="text-2xl font-light" style={{ color: '#2563eb' }}>Teacher-meet</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  setIsRegistering(true);
                  setShowEmailForm(true);
                }}
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Join now
              </button>
              <button 
                onClick={() => setShowEmailForm(true)}
                className="border-2 text-white px-6 py-2 rounded-full hover:opacity-90 font-medium transition-all duration-200 shadow-md"
                style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="flex min-h-screen">
        {/* Left Side - Welcome Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="max-w-lg w-full">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-light text-gray-800 mb-6 leading-tight">
                Welcome to your
                <span className="block" style={{ color: '#2563eb' }}>professional community</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with educators worldwide. Share knowledge, build your career, and make a difference in education.
              </p>
            </div>
            
            <div className="space-y-4 max-w-sm mx-auto lg:mx-0">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-full bg-white text-gray-700 font-medium text-base hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
              <button
                onClick={handleMicrosoftSignIn}
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-full bg-white text-gray-700 font-medium text-base hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
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
                className="w-full flex items-center justify-center px-6 py-3 text-white font-medium text-base rounded-full hover:opacity-90 transition-all duration-200 shadow-lg"
                style={{ backgroundColor: '#2563eb' }}
              >
                Sign in with email
              </button>
            </div>

            <div className="mt-8 text-sm text-gray-500 leading-relaxed text-center lg:text-left">
              By clicking Continue, you agree to Teacher-meet's{' '}
              <a href="#" className="text-blue-600 hover:underline">User Agreement</a>,{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>, and{' '}
              <a href="#" className="text-blue-600 hover:underline">Cookie Policy</a>.
            </div>

            <div className="mt-6 text-center lg:text-left">
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
        </div>

        {/* Right Side - Background Image with Foreground Content */}
        <div className="hidden lg:block flex-1 relative">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url(/TeachermeetBigpic.png)',
              backgroundPosition: 'center center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          {/* Foreground Content */}
          <div className="relative z-10 h-full flex items-center justify-center p-8">
            <div className="max-w-lg w-full">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2563eb' }}>
                  <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Connect with Educators Worldwide</h3>
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  Join a global community of teachers, professors, and education professionals sharing knowledge and building careers together.
                </p>
                
                {/* Feature highlights */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Share Resources</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Professional Growth</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Network & Collaborate</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Events & Learning</p>
                  </div>
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

