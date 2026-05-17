import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

// We'll separate these into their own components next
import Chat from '../components/Chat';
import Whiteboard from '../components/Whiteboard';
import Notes from '../components/Notes';
import Resources from '../components/Resources';
import Doubts from '../components/Doubts';

const BACKEND_URL = 'https://study-vault-1.onrender.com';
const SOCKET_URL = BACKEND_URL;

export default function StudyRoom() {
  const { roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('whiteboard'); // 'whiteboard' or 'notes'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  
  // State for initial room data loaded from backend
  const [roomData, setRoomData] = useState({
    notes: '',
    whiteboard: [],
    chat: []
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // 1. Check if room exists and if it has a password
    const checkRoomStatus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rooms/check/${roomId}`);
        const data = await res.json();
        
        if (res.ok) {
          setRoomInfo(data);
          if (data.hasPassword) {
            setIsPasswordRequired(true);
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        } else {
          setError(data.message || 'Room not found');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    };

    checkRoomStatus();
  }, [roomId]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to Socket.io server
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Get real username if logged in
    const storedUser = localStorage.getItem('vault_user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const username = user ? user.username : `Guest_${Math.floor(Math.random() * 1000)}`;

    newSocket.emit('join_room', { roomId, username });

    // Listen for initial room data
    newSocket.on('load_room_data', (data) => {
      setRoomData({
        notes: data.notes || '',
        whiteboard: data.whiteboard || [],
        chat: data.chat || []
      });
    });

    return () => newSocket.close();
  }, [isAuthenticated, roomId]);

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setError(data.message || 'Incorrect password');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Checking room status...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && isPasswordRequired) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-indigo-500/20 shadow-2xl">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">{roomInfo?.name || 'Protected Room'}</h2>
          <p className="text-slate-400 text-center mb-8">This room is password protected. Please enter the password to join.</p>
          
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div>
              <input 
                type="password" 
                className="input-field py-3 text-center text-lg tracking-widest" 
                placeholder="Enter Password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full btn-primary py-3 font-bold text-lg">
              Join Room
            </button>
            <button 
              type="button" 
              onClick={() => window.location.href = '/'}
              className="w-full text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
            >
              Back to Home
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error && !isPasswordRequired) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="glass-panel p-8 rounded-2xl border border-red-500/20 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-primary px-8 py-2"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      {/* Mobile Header (Room ID and Sidebar Toggle) */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-800 glass-panel z-20">
        <h2 className="font-bold truncate max-w-[200px]">Room: {roomId}</h2>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-indigo-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Sidebar - Tools & Chat */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-30 w-80 border-r border-slate-800 glass-panel flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold hidden md:block">Room: {roomId}</h2>
            <h2 className="text-xl font-bold md:hidden">Chat & Tools</h2>
            <div className="flex items-center gap-2 text-sm text-green-400 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              Connected
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Chat Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {socket && <Chat socket={socket} roomId={roomId} initialMessages={roomData.chat} />}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area (Whiteboard or Notes) */}
      <div className="flex-1 flex flex-col bg-slate-950/50 relative overflow-hidden">
        {/* Top toolbar - Responsive Grid */}
        <div className="min-h-14 border-b border-slate-800 flex flex-wrap items-center justify-between p-2 md:px-4 bg-slate-900/50 backdrop-blur-sm z-10 gap-2">
          <div className="flex flex-wrap gap-1 md:gap-2">
            {[
              { id: 'whiteboard', label: 'Whiteboard' },
              { id: 'notes', label: 'Notes' },
              { id: 'resources', label: 'Resources' },
              { id: 'doubts', label: 'Doubts' }
            ].map(tab => (
              <button 
                key={tab.id}
                className={`px-3 md:px-4 py-1.5 rounded-md font-medium text-xs md:text-sm transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs md:text-sm text-red-400 hover:text-white hover:bg-red-500/20 transition-colors border border-red-500/20 hover:border-red-500/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Exit Room</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>

        {/* Dynamic Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {socket && (
            <>
              <div className={`flex-1 w-full h-full ${activeTab === 'whiteboard' ? 'flex' : 'hidden'}`}>
                <Whiteboard socket={socket} roomId={roomId} initialDrawings={roomData.whiteboard} />
              </div>
              <div className={`flex-1 w-full h-full ${activeTab === 'notes' ? 'flex' : 'hidden'}`}>
                <Notes socket={socket} roomId={roomId} initialNotes={roomData.notes} />
              </div>
              <div className={`flex-1 w-full h-full overflow-y-auto ${activeTab === 'resources' ? 'flex' : 'hidden'}`}>
                <Resources roomId={roomId} />
              </div>
              <div className={`flex-1 w-full h-full overflow-y-auto ${activeTab === 'doubts' ? 'flex' : 'hidden'}`}>
                <Doubts roomId={roomId} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
