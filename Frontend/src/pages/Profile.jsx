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
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
          My Profile
        </h2>
        <p className="text-slate-600 mt-1">View your stats and the global leaderboard.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - User Stats */}
        <div className="lg:col-span-1 glass-panel p-8 rounded-2xl border border-amber-500/10 flex flex-col gap-6 sticky top-24">
          <div>
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getTierColor(userStats?.tier)} flex items-center justify-center text-4xl font-bold shadow-lg shadow-amber-500/20 ring-4 ring-slate-900/10`}>
                {userStats?.username?.[0]?.toUpperCase()}
              </div>
              <div className="text-center w-full">
                <div className="flex flex-col justify-center items-center mt-2">
                  <h3 className="text-3xl font-bold mb-2 text-slate-900">{userStats?.username}</h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(userStats?.tier)} text-white shadow-sm`}>
                    {userStats?.tier?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-center items-center gap-4 mt-4">
                  <span className="text-sm font-bold text-amber-600 bg-amber-600/10 px-3 py-1 rounded">LEVEL {userStats?.level || 1}</span>
                  <span className="text-sm text-slate-600 font-medium">{userStats?.xp || 0} TOTAL XP</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 mb-4">
              <div className="bg-white/50 p-5 rounded-xl border border-slate-900/10">
                <div className="flex justify-between text-xs text-slate-600 mb-3 font-medium uppercase tracking-wider">
                  <span>Progress to Level { (userStats?.level || 1) + 1}</span>
                  <span>{((userStats?.xp || 0) % 100)} / 100</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-2">
                  <div className="bg-amber-600 h-full rounded-full transition-all duration-1000" style={{ width: `${(userStats?.xp || 0) % 100}%` }}></div>
                </div>
                <p className="text-xs text-slate-600 italic text-center">
                  Earn {100 - ((userStats?.xp || 0) % 100)} more XP to level up!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Leaderboard */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-amber-500/20 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-600/10 rounded-full blur-[64px] pointer-events-none"></div>
          
          <div className="mb-8 relative z-10">
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
              Global Leaderboard
            </h3>
            <p className="text-slate-600 text-sm mt-1">Top contributors in the Vault community.</p>
          </div>
          
          <div className="space-y-4 relative z-10">
            {leaderboardData.map((user, index) => (
              <div 
                key={user._id} 
                className={`flex items-center justify-between p-5 rounded-xl border transition-all ${index === 0 ? 'bg-amber-600/20 border-amber-500/50 shadow-lg shadow-amber-500/10 scale-[1.02]' : 'bg-white/50 border-slate-900/10 hover:border-slate-900/20'}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${index === 0 ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      {user.username}
                      {index === 0 && <span className="text-sm" title="Rank 1">👑</span>}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${getTierColor(user.tier)} text-white`}>
                        {user.tier}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">Level {user.level}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-600">{user.xp}</div>
                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Points</div>
                </div>
              </div>
            ))}
            
            {leaderboardData.length === 0 && (
              <div className="text-center text-slate-600 py-10">
                No users found on the leaderboard yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
