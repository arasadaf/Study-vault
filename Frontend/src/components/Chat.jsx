import { useState, useEffect, useRef } from 'react';

export default function Chat({ socket, roomId, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for incoming messages
    const messageHandler = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const userJoinedHandler = (data) => {
      setMessages((prev) => [
        ...prev, 
        { type: 'system', message: `${data.username} joined the room.` }
      ]);
    };

    socket.on('receive_message', messageHandler);
    socket.on('user_joined', userJoinedHandler);

    return () => {
      socket.off('receive_message', messageHandler);
      socket.off('user_joined', userJoinedHandler);
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const storedUser = localStorage.getItem('vault_user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const currentUsername = user ? user.username : 'Guest';

      const messageData = {
        roomId,
        username: currentUsername,
        message: input,
        timestamp: new Date().toISOString(),
      };

      // Emit to server
      socket.emit('send_message', messageData);
      
      // Update local state immediately
      setMessages((prev) => [...prev, messageData]);
      setInput('');
    }
  };

    const storedUser = localStorage.getItem('vault_user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const currentUsername = user ? user.username : 'Guest';

    return (
      <div className="flex flex-col h-full bg-slate-900/30">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            msg.type === 'system' ? (
              <div key={idx} className="flex justify-center">
                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                  {msg.message}
                </span>
              </div>
            ) : (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${msg.username === currentUsername ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <span className="text-xs text-slate-400 mb-1 ml-1">{msg.username}</span>
                <div className={`px-4 py-2 rounded-2xl ${
                  msg.username === currentUsername 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            )
          ))}
          <div ref={messagesEndRef} />
        </div>

      {/* Chat Input */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input-field py-2 flex-1"
          />
          <button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
