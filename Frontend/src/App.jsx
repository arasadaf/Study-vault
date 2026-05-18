import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import StudyRoom from './pages/StudyRoom';
import MyRooms from './pages/MyRooms';
import AuthModal from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, isAuthModalOpen, authMode, openLogin, openSignup, logout, closeAuth } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        {/* Navigation Bar */}
        <nav className="glass-panel sticky top-0 z-50 py-4 px-4 md:px-8 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <span className="font-bold text-white text-xl">V</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                Vault
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-6 items-center">
              {user ? (
                <>
                  <NavLink to="/" className={({ isActive }) => isActive ? "text-indigo-400 font-bold drop-shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all" : "text-slate-300 hover:text-white font-medium transition-colors"}>Home</NavLink>
                  <NavLink to="/my-rooms" className={({ isActive }) => isActive ? "text-indigo-400 font-bold drop-shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all" : "text-slate-300 hover:text-white font-medium transition-colors"}>My Rooms</NavLink>
                  <div className="h-4 w-px bg-slate-800"></div>
                  <span className="text-slate-300">Hello, <span className="font-semibold text-white">{user.username}</span></span>
                  <button onClick={logout} className="btn-secondary py-1.5 px-4 text-sm">Logout</button>
                </>
              ) : (
                <>
                  <NavLink to="/" className={({ isActive }) => isActive ? "text-indigo-400 font-bold drop-shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all" : "text-slate-300 hover:text-white font-medium transition-colors"}>Home</NavLink>
                  <button onClick={openLogin} className="btn-secondary py-1.5 px-6">Login</button>
                  <button onClick={openSignup} className="btn-primary py-1.5 px-6">Sign Up</button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 glass-panel border-t border-white/5 animate-fade-in py-4 px-6 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.username}</p>
                      <p className="text-xs text-slate-400">Collaborator</p>
                    </div>
                  </div>
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => `block py-2 transition-colors ${isActive ? "text-indigo-400 font-bold" : "text-slate-300 hover:text-white"}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </NavLink>
                  <NavLink 
                    to="/my-rooms" 
                    className={({ isActive }) => `block py-2 transition-colors ${isActive ? "text-indigo-400 font-bold" : "text-slate-300 hover:text-white"}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Rooms
                  </NavLink>
                  <button 
                    onClick={logout} 
                    className="w-full btn-secondary py-2 text-center"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => `block py-2 transition-colors text-center ${isActive ? "text-indigo-400 font-bold" : "text-slate-300 hover:text-white font-medium"}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </NavLink>
                  <button onClick={openLogin} className="w-full btn-secondary py-2 text-center">Login</button>
                  <button onClick={openSignup} className="w-full btn-primary py-2 text-center">Sign Up</button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] -z-10 pointer-events-none"></div>
          
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={closeAuth} 
            initialMode={authMode} 
          />
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<StudyRoom />} />
            <Route path="/my-rooms" element={<MyRooms />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
