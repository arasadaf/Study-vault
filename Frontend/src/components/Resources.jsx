import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://localhost:5000';

export default function Resources({ roomId }) {
  const { user, openLogin } = useAuth();
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchResources = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/resources/${roomId}`);
      const data = await res.json();
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [roomId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !topic) return;
    if (!user) {
      openLogin();
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('topic', topic);
    formData.append('roomId', roomId);
    formData.append('uploadedBy', user.username);

    try {
      const res = await fetch(`${BACKEND_URL}/api/resources/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setTitle('');
        setTopic('');
        setFile(null);
        fetchResources();
      } else {
        const data = await res.json();
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setUploading(false);
    }
  };

  const handleVote = async (id, voteType) => {
    if (!user) {
      openLogin();
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/resources/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.username, voteType })
      });
      if (res.ok) fetchResources();
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-900/30">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Upload Section */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Upload Study Material
          </h3>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Title" 
              className="input-field" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input 
              type="text" 
              placeholder="Topic (e.g. Calculus, UI Design)" 
              className="input-field" 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)}
              required
            />
            <div className="md:col-span-2 flex gap-4 items-center">
              <input 
                type="file" 
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              <button 
                type="submit" 
                disabled={uploading}
                className="btn-primary whitespace-nowrap px-8 py-2 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Share'}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-1 md:col-span-2">{error}</p>}
          </form>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Shared Resources
          </h3>
          {resources.length === 0 ? (
            <div className="text-center py-12 text-slate-500 glass-panel rounded-2xl">
              No resources shared yet. Be the first!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map(res => (
                <div key={res._id} className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-100">{res.title}</h4>
                      <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold bg-indigo-400/10 px-2 py-0.5 rounded">
                        {res.topic}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 bg-slate-800/50 p-1.5 rounded-lg border border-white/5">
                      <button onClick={() => handleVote(res._id, 'upvote')} className="text-slate-500 hover:text-green-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="text-xs font-bold text-slate-300">
                        {res.upvotes.length - res.downvotes.length}
                      </span>
                      <button onClick={() => handleVote(res._id, 'downvote')} className="text-slate-500 hover:text-red-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-between items-center pt-3 border-t border-white/5">
                    <div className="text-[11px] text-slate-500">
                      By <span className="text-slate-300">{res.uploadedBy}</span>
                    </div>
                    <a 
                      href={`${BACKEND_URL}${res.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      Download
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
