import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../utils/apiConfig';

export default function Doubts({ roomId }) {
  const { user, openLogin } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [answerInputs, setAnswerInputs] = useState({});

  const fetchDoubts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/doubts/${roomId}`);
      const data = await res.json();
      setDoubts(data);
    } catch (err) {
      console.error('Failed to fetch doubts', err);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, [roomId]);

  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    if (!user) {
      openLogin();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/doubts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          description,
          roomId,
          askedBy: user.username,
          bountyPoints: 10
        })
      });

      if (res.ok) {
        setQuestion('');
        setDescription('');
        fetchDoubts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnswer = async (doubtId) => {
    const answer = answerInputs[doubtId];
    if (!user) {
      openLogin();
      return;
    }
    if (!answer) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/doubts/${doubtId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer,
          answeredBy: user.username
        })
      });

      if (res.ok) {
        setAnswerInputs({ ...answerInputs, [doubtId]: '' });
        fetchDoubts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (doubtId, answerId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/doubts/${doubtId}/answers/${answerId}/accept`, {
        method: 'PATCH'
      });
      if (res.ok) fetchDoubts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-900/30">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        
        {/* Post a Doubt */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/10">
          <h3 className="text-xl font-bold mb-4">Have a Doubt?</h3>
          <form onSubmit={handleSubmitDoubt} className="space-y-4">
            <input 
              type="text" 
              placeholder="What is your question?" 
              className="input-field" 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            <textarea 
              placeholder="Explain your doubt in detail..." 
              className="input-field min-h-[100px]" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary px-8 py-2">
              {loading ? 'Posting...' : 'Post Question'}
            </button>
          </form>
        </div>

        {/* Doubts List */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Community Doubts</h3>
          {doubts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No doubts posted yet.</div>
          ) : (
            doubts.map(doubt => (
              <div key={doubt._id} className={`glass-panel p-6 rounded-2xl border transition-all ${doubt.isResolved ? 'border-green-500/20' : 'border-white/5'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-100 mb-1">{doubt.question}</h4>
                    <p className="text-sm text-slate-400 mb-3">{doubt.description}</p>
                    <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider">
                      <span className="text-indigo-400">Asked by {doubt.askedBy}</span>
                      <span className="text-slate-500">•</span>
                      <span className={doubt.isResolved ? 'text-green-400' : 'text-orange-400'}>
                        {doubt.isResolved ? 'Resolved' : 'Open'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Answers Section */}
                <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                  <h5 className="text-sm font-bold text-slate-300">Answers ({doubt.answers.length})</h5>
                  {doubt.answers.map(ans => (
                    <div key={ans._id} className={`p-4 rounded-xl text-sm ${ans.isAccepted ? 'bg-green-500/10 border border-green-500/20' : 'bg-slate-800/30 border border-transparent'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-200 mb-2">{ans.answer}</p>
                          <span className="text-[10px] text-slate-500">Answered by {ans.answeredBy}</span>
                        </div>
                        {ans.isAccepted && (
                          <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded font-bold">ACCEPTED</span>
                        )}
                        {!doubt.isResolved && JSON.parse(localStorage.getItem('vault_user'))?.username === doubt.askedBy && (
                          <button 
                            onClick={() => handleResolve(doubt._id, ans._id)}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 border border-indigo-400/30 rounded"
                          >
                            Accept Answer
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {!doubt.isResolved && (
                    <div className="flex gap-2 mt-4">
                      <input 
                        type="text" 
                        placeholder="Write an answer..." 
                        className="input-field py-2 text-sm"
                        value={answerInputs[doubt._id] || ''}
                        onChange={(e) => setAnswerInputs({ ...answerInputs, [doubt._id]: e.target.value })}
                      />
                      <button 
                        onClick={() => handleAddAnswer(doubt._id)}
                        className="btn-secondary px-4 text-sm whitespace-nowrap"
                      >
                        Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
