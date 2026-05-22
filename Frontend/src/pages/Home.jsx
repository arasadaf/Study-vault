import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../utils/apiConfig';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, openLogin } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [myRooms, setMyRooms] = useState([]);
  const isLoggedIn = !!authUser;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    roomId: '',
    password: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    if (location.state?.openCreateModal) {
      if (isLoggedIn) {
        setNewRoomData({
          name: '',
          roomId: '',
          password: '',
          description: ''
        });
        setError('');
        setShowCreateModal(true);
      } else {
        openLogin();
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isLoggedIn, openLogin]);

  useEffect(() => {
    const token = localStorage.getItem('vault_token');
    if (token && authUser) {
      // Fetch latest User Stats from /me
      fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'x-auth-token': token }
      })
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          setUserStats(data);
        }
      })
      .catch(err => console.error('Failed to fetch user profile', err));

      fetch(`${BACKEND_URL}/api/rooms/my-rooms`, {
        headers: {
          'x-auth-token': token
        }
      })
      .then(res => {
        if (res.status === 401) {
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          setMyRooms(data);
        }
      })
      .catch(err => console.error('Failed to fetch rooms', err));
    }
  }, [authUser]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  const handleCreateRoom = () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    // Reset the form so previous values don't stick around
    setNewRoomData({
      name: '',
      roomId: '',
      password: '',
      description: ''
    });
    setError('');
    setShowCreateModal(true);
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Diamond': return 'from-cyan-400 to-blue-500';
      case 'Platinum': return 'from-indigo-300 to-indigo-500';
      case 'Gold': return 'from-yellow-400 to-orange-500';
      case 'Silver': return 'from-slate-300 to-slate-500';
      default: return 'from-orange-400 to-amber-700';
    }
  };

  const submitCreateRoom = async (e) => {
    e.preventDefault();
    setError('');
    
    const token = localStorage.getItem('vault_token');
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(newRoomData)
      });
      
      const data = await res.json();
      if (res.ok) {
        navigate(`/room/${data.roomId}`);
      } else {
        setError(data.message || 'Failed to create room');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        
        {/* Left Column - Hero Text */}
        <div className="space-y-6">
          <div className="inline-block px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-4">
            ✨ Next Generation Collaborative Study
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight text-center md:text-left">
            Learn Together, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Anywhere.
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-lg leading-relaxed text-center md:text-left mx-auto md:mx-0">
            Vault provides a real-time collaborative environment equipped with whiteboards, chat, and shared notes, designed to supercharge your study sessions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 items-center md:items-start justify-center md:justify-start">
            <button 
              onClick={handleCreateRoom}
              className="w-full sm:w-auto btn-primary py-3 px-8 text-lg flex items-center justify-center gap-2"
            >
              Create a Room
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Column - Join Form */}
        <div className="glass-panel p-8 rounded-2xl md:mt-16 border border-indigo-500/10">
          <h3 className="text-2xl font-bold mb-2">Join a Study Room</h3>
          <p className="text-slate-400 mb-6">Enter a room ID to collaborate instantly.</p>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Room ID</label>
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. math-101" 
                className="input-field"
                required
              />
            </div>
            <button type="submit" className="w-full btn-primary py-3 flex justify-center items-center gap-2">
              Join Room
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>

          {!isLoggedIn && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-sm text-slate-500 text-center">
                New to Vault? Create an account to track your study progress.
              </p>
            </div>
          )}
        </div>
        
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full p-8 rounded-2xl shadow-2xl border border-indigo-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Create New Room</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={submitCreateRoom} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Room Name *</label>
                <input 
                  type="text" 
                  required
                  autoComplete="off"
                  className="input-field"
                  value={newRoomData.name}
                  onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Unique Room ID *</label>
                <input 
                  type="text" 
                  required
                  autoComplete="off"
                  className="input-field"
                  value={newRoomData.roomId}
                  onChange={(e) => setNewRoomData({...newRoomData, roomId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password (Optional)</label>
                <input 
                  type="password" 
                  autoComplete="new-password"
                  className="input-field"
                  value={newRoomData.password}
                  onChange={(e) => setNewRoomData({...newRoomData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea 
                  className="input-field min-h-[80px]"
                  value={newRoomData.description}
                  onChange={(e) => setNewRoomData({...newRoomData, description: e.target.value})}
                />
              </div>
              
              <button type="submit" className="w-full btn-primary py-3 mt-4 flex justify-center items-center gap-2">
                Create Room
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
