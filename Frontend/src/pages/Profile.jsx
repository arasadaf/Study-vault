import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../utils/apiConfig';

export default function Profile() {
  const { user: authUser, openLogin } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vault_token');
    if (!token || !authUser) {
      openLogin();
      navigate('/');
      return;
    }

    // Fetch user profile
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

    // Fetch leaderboard
    fetch(`${BACKEND_URL}/api/auth/leaderboard`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setLeaderboardData(data);
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch leaderboard', err);
      setIsLoading(false);
    });

  }, [authUser, navigate, openLogin]);

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Diamond': return 'from-cyan-400 to-blue-500';
      case 'Platinum': return 'from-indigo-300 to-indigo-500';
      case 'Gold': return 'from-yellow-400 to-orange-500';
      case 'Silver': return 'from-slate-300 to-slate-500';
      default: return 'from-orange-400 to-amber-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          My Profile
        </h2>
        <p className="text-slate-400 mt-1">View your stats and the global leaderboard.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - User Stats */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-2xl border border-indigo-500/10 flex flex-col gap-6 sticky top-24">
          <div>
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getTierColor(userStats?.tier)} flex items-center justify-center text-4xl font-bold shadow-lg shadow-indigo-500/20 ring-4 ring-white/10`}>
                {userStats?.username?.[0]?.toUpperCase()}
              </div>
              <div className="text-center w-full">
                <div className="flex flex-col justify-center items-center mt-2">
                  <h3 className="text-3xl font-bold mb-2">{userStats?.username}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(userStats?.tier)} text-white shadow-sm`}>
                    {userStats?.tier?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-center items-center gap-4 mt-4">
                  <span className="text-sm font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded">LEVEL {userStats?.level || 1}</span>
                  <span className="text-sm text-slate-500 font-medium">{userStats?.xp || 0} TOTAL XP</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-4">
              <div className="bg-slate-900/50 p-5 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">
                  <span>Progress to Level { (userStats?.level || 1) + 1}</span>
                  <span>{((userStats?.xp || 0) % 100)} / 100</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(userStats?.xp || 0) % 100}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 italic text-center">
                  Earn {100 - ((userStats?.xp || 0) % 100)} more XP to level up!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Leaderboard */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-yellow-500/20 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-600/10 rounded-full blur-[64px] pointer-events-none"></div>
          
          <div className="mb-8 relative z-10">
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
              Global Leaderboard
            </h3>
            <p className="text-slate-400 text-sm mt-1">Top contributors in the Vault community.</p>
          </div>
          
          <div className="space-y-4 relative z-10">
            {leaderboardData.map((user, index) => (
              <div 
                key={user._id} 
                className={`flex items-center justify-between p-5 rounded-xl border transition-all ${index === 0 ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10 scale-[1.02]' : 'bg-slate-900/50 border-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${index === 0 ? 'bg-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                      {user.username}
                      {index === 0 && <span className="text-sm" title="Rank 1">👑</span>}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${getTierColor(user.tier)} text-white`}>
                        {user.tier}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Level {user.level}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-400">{user.xp}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Points</div>
                </div>
              </div>
            ))}
            
            {leaderboardData.length === 0 && (
              <div className="text-center text-slate-400 py-10">
                No users found on the leaderboard yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
