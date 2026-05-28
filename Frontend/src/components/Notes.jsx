import { useState, useEffect } from 'react';

export default function Notes({ socket, roomId, initialNotes = '' }) {
  const [content, setContent] = useState(initialNotes);

  useEffect(() => {
    setContent(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    // Listen for note updates
    const notesHandler = (data) => {
      setContent(data.content);
    };

    socket.on('receive_notes', notesHandler);

    return () => {
      socket.off('receive_notes', notesHandler);
    };
  }, [socket]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Broadcast changes
    socket.emit('update_notes', {
      roomId,
      content: newContent
    });
  };

  return (
    <div className="flex-1 w-full h-full p-8 flex justify-center bg-white/20">
      <div className="w-full max-w-4xl h-full flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-900/10 bg-white/50 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
          <h3 className="font-semibold text-lg text-slate-800">Shared Notes</h3>
        </div>
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Start typing to collaborate on notes..."
          className="flex-1 w-full bg-transparent resize-none p-6 outline-none text-slate-900 placeholder:text-slate-500 leading-relaxed font-medium"
        />
      </div>
    </div>
  );
}
