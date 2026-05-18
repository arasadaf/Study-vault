import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Home() {
  const navigate = useNavigate();
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

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);

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

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/leaderboard`);
      const data = await res.json();
      setLeaderboardData(data);
      setShowLeaderboard(true);
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  const handleCreateRoom = () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
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
            <button 
              onClick={fetchLeaderboard}
              className="w-full sm:w-auto btn-secondary py-3 px-8 text-lg flex items-center justify-center gap-2 border border-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Leaderboard
            </button>
          </div>
        </div>

        {/* Right Column - Join Form or User Stats */}
        {!isLoggedIn ? (
          <div className="glass-panel p-8 rounded-2xl">
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

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-sm text-slate-500 text-center">
                New to Vault? Create an account to track your study progress.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl border border-indigo-500/10 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getTierColor(userStats?.tier)} flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20 ring-2 ring-white/10`}>
                  {userStats?.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">{userStats?.username}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${getTierColor(userStats?.tier)} text-white shadow-sm`}>
                      {userStats?.tier?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">LEVEL {userStats?.level || 1}</span>
                    <span className="text-xs text-slate-500">{userStats?.xp || 0} TOTAL XP</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                    <span>XP Progress to Level { (userStats?.level || 1) + 1}</span>
                    <span>{((userStats?.xp || 0) % 100)} / 100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(userStats?.xp || 0) % 100}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                    Earn {100 - ((userStats?.xp || 0) % 100)} more XP to level up!
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Quick Join: Enter Room ID" 
                  className="input-field pr-12"
                  required
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
          </div>
        )}
        
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
            
            <form onSubmit={submitCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Room Name *</label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  placeholder="e.g. Computer Science Study Group"
                  value={newRoomData.name}
                  onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Unique Room ID *</label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  placeholder="e.g. cs-101-vault"
                  value={newRoomData.roomId}
                  onChange={(e) => setNewRoomData({...newRoomData, roomId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password (Optional)</label>
                <input 
                  type="password" 
                  className="input-field"
                  placeholder="Leave blank for public room"
                  value={newRoomData.password}
                  onChange={(e) => setNewRoomData({...newRoomData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea 
                  className="input-field min-h-[80px]"
                  placeholder="What is this room for?"
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

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-2xl w-full p-8 rounded-2xl shadow-2xl border border-indigo-500/20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-[64px]"></div>
            
            <div className="flex justify-between items-center mb-8 relative">
              <div>
                <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                  Global Leaderboard
                </h3>
                <p className="text-slate-400 text-sm">Top contributors in the Vault community.</p>
              </div>
              <button onClick={() => setShowLeaderboard(false)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 relative max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {leaderboardData.map((user, index) => (
                <div 
                  key={user._id} 
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${index === 0 ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-slate-900/50 border-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-yellow-500 text-slate-900' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 flex items-center gap-2">
                        {user.username}
                        {index === 0 && <span className="text-xs">👑</span>}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r ${getTierColor(user.tier)} text-white`}>
                          {user.tier}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Level {user.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-indigo-400">{user.xp}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Vault Points</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center text-xs text-slate-500 font-medium">
              Keep collaborating to climb the ranks! 🚀
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
