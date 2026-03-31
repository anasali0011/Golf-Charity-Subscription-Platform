import { useState, useEffect } from 'react';
import { Target, PlusCircle } from 'lucide-react';
import client from '../api/client';

export default function ScoreWidget() {
  const [scores, setScores] = useState<any[]>([]);
  const [newScore, setNewScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchScores = async () => {
    try {
      const res = await client.get('/scores');
      setScores(res.data.scores);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore) return;
    setError('');
    setLoading(true);
    try {
      await client.post('/scores', { score: parseInt(newScore), date: new Date().toISOString() });
      setNewScore('');
      fetchScores();
    } catch(err: any) {
      setError(err.response?.data?.error || 'Failed to add score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden h-full flex flex-col bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors duration-500 shadow-2xl">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold flex items-center font-display tracking-wide text-white">
            <Target className="mr-3 text-emerald-400" size={28} /> 
            Your Last 5 Scores
          </h3>
          <p className="text-sm text-slate-400 mt-1.5 ml-10">Scores form the basis of your lottery draw</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] tracking-widest uppercase">
          {scores.length}/5
        </div>
      </div>

      <div className="flex-1">
        {scores.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/50 rounded-2xl p-8 bg-slate-900/20">
            <Target size={48} className="mb-4 opacity-50 text-slate-400" />
            <p className="font-medium text-slate-300">No scores entered yet</p>
            <p className="text-sm mt-1">Enter your first score below</p>
          </div>
        ) : (
          <ul className="space-y-3 mt-2 pr-2 custom-scrollbar max-h-48 overflow-y-auto">
            {scores.map((s) => (
              <li key={s.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="flex items-center px-5 py-2.5 bg-slate-800/80 rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] border border-slate-700">
                  <span className="font-display tracking-widest text-2xl font-extrabold text-teal-400 group-hover:text-emerald-400 transition-colors drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]">{s.score}</span>
                </div>
                <div className="text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                  {new Date(s.date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

      <form onSubmit={handleAddScore} className="mt-8 flex gap-4">
        <input 
          type="number" 
          min="1" 
          max="45"
          className="w-full bg-slate-900/60 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 text-slate-100 rounded-2xl px-5 py-3 outline-none transition-all duration-300 shadow-inner text-lg font-medium"
          placeholder="Enter Score (1-45)"
          value={newScore}
          onChange={e => setNewScore(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading || !newScore} 
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-100 placeholder-slate-400 font-bold py-3 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
        >
          {loading ? 'Adding...' : <><PlusCircle size={20} className="mr-2" /> Add</>}
        </button>
      </form>
    </div>
  );
}
