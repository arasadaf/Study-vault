import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function MyRooms() {
  const { user: authUser, openLogin } = useAuth();
  const [myRooms, setMyRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('vault_token');
    if (!token || !authUser) {
      openLogin();
      navigate('/');
      return;
    }

    fetch(`${BACKEND_URL}/api/rooms/my-rooms`, {
      headers: {
        'x-auth-token': token
      }
    })
    .then(res => {
      if (res.status === 401) {
        openLogin();
        navigate('/');
        return null;
      }
      return res.json();
    })
    .then(data => {
      if (data && Array.isArray(data)) {
        setMyRooms(data);
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch rooms', err);
      setError('Failed to load your rooms. Please try again.');
      setIsLoading(false);
    });
  }, [navigate, authUser]);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            My Recent Rooms
          </h2>
          <p className="text-slate-400 mt-1">Continue where you left off in your study sessions.</p>
        </div>
        <Link to="/" className="btn-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          New Room
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading your rooms...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center rounded-xl text-red-400 border-red-500/20">
          {error}
        </div>
      ) : myRooms.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border-white/5 flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-200">No rooms found</h3>
          <p className="text-slate-400 max-w-sm">
            You haven't joined or created any study rooms yet. Create a room or join one using an ID to get started.
          </p>
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-medium mt-2">
            Go to Home Page &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {myRooms.map(room => (
            <Link 
              key={room.roomId} 
              to={`/room/${room.roomId}`}
              className="glass-panel p-6 rounded-2xl hover:bg-slate-800/40 transition-all border border-white/5 hover:border-indigo-500/30 group relative overflow-hidden flex flex-col h-full"
            >
              {room.isCreator && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Creator
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-xl text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {room.name}
                </h4>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                <span className="bg-slate-950/50 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono">
                  ID: {room.roomId}
                </span>
                <span className="flex items-center gap-1 bg-slate-950/50 border border-white/5 px-2.5 py-1 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {room.participantCount}
                </span>
              </div>
              
              <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">
                {room.description || (room.notes ? room.notes : 'No description available.')}
              </p>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[12px] text-slate-500 font-medium mt-auto">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(room.lastActive).toLocaleDateString()}
                </span>
                <span className="text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter Room
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
