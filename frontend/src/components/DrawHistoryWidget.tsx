import { useState, useEffect } from 'react';
import { Calendar, Trophy, PlayCircle, RefreshCw } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DrawHistoryWidget() {
  const [history, setHistory] = useState<any[]>([]);
  const [myWins, setMyWins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [runningDraw, setRunningDraw] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await client.get('/draws/history');
      setHistory(res.data.draws);
      setMyWins(res.data.myWins || []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRunDraw = async () => {
    if (!user?.is_admin) return;
    setRunningDraw(true);
    try {
      await client.post('/draws/run');
      alert('Draw ran successfully!');
      fetchHistory();
    } catch(err: any) {
      alert(err.response?.data?.error || 'Failed to run draw');
    } finally {
      setRunningDraw(false);
    }
  };

  if (loading) return <div className="glass-card rounded-[2rem] p-8 h-64 animate-pulse flex items-center justify-center">Loading...</div>;

  return (
    <div className="glass-card rounded-[2rem] p-8 mt-8 border border-slate-700/50 relative overflow-hidden shadow-2xl">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h3 className="text-2xl font-bold flex items-center font-display text-white">
            <Trophy className="mr-3 text-teal-400" size={28} /> Draw History & Winnings
          </h3>
          <p className="text-sm text-slate-400 mt-1.5 ml-10">See past draws and your jackpot wins</p>
        </div>
        {user?.is_admin && (
          <button 
            onClick={handleRunDraw} 
            disabled={runningDraw} 
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-900 font-bold py-3 px-6 rounded-2xl flex items-center disabled:opacity-50 transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transform hover:-translate-y-0.5 tracking-wide"
          >
            {runningDraw ? <RefreshCw className="animate-spin mr-2" size={20} /> : <PlayCircle className="mr-2" size={20} />}
            Run Month Draw
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <div>
          <h4 className="font-semibold text-slate-300 mb-5 text-lg flex items-center tracking-wide uppercase">
            <Calendar size={18} className="mr-2 text-teal-500" /> Past Draws
          </h4>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {history.map(d => (
              <div key={d.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50 hover:border-teal-500/30 transition-colors group">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-slate-200 text-lg tracking-wide bg-slate-800/80 px-3 py-1 rounded-lg">{d.month}</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-md uppercase tracking-widest font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">{d.status}</span>
                </div>
                <div className="mt-4 flex gap-2 justify-center">
                  {(d.numbers_generated || []).map((n: number, i: number) => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-slate-900 flex items-center justify-center font-bold font-display text-lg shadow-[0_4px_10px_rgba(20,184,166,0.4)] transform group-hover:-translate-y-1 transition-transform">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {history.length === 0 && <div className="text-slate-500 p-8 border border-dashed border-slate-700 rounded-2xl text-center bg-slate-900/30 font-medium">No draws available yet</div>}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-300 mb-5 text-lg flex items-center tracking-wide uppercase">
            <Trophy size={18} className="mr-2 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" /> My Winnings
          </h4>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {myWins.map(w => (
              <div key={w.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50 border-l-4 border-l-yellow-500 hover:bg-slate-800/80 transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-start font-medium">
                  <div>
                    <span className="text-slate-200 text-lg tracking-wide bg-slate-800/80 px-3 py-1 rounded-lg">{w.draw_month || w.draws?.month}</span>
                    <span className="ml-3 text-sm text-yellow-500 font-bold tracking-wider uppercase">{w.match_type.replace('_', ' ')}</span>
                  </div>
                  <span className="text-2xl font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                    ${typeof w.prize_amount === 'number' ? w.prize_amount.toFixed(2) : parseFloat(w.prize_amount).toFixed(2)}
                  </span>
                </div>
                <div className="mt-4 flex gap-2 justify-start opacity-80 items-center">
                  <span className="text-xs text-slate-500 mr-2 uppercase tracking-wide font-semibold">Winning Numbers:</span>
                  {(w.draws?.numbers_generated || []).map((n: number, i: number) => (
                    <div key={i} className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm border border-slate-700 shadow-inner">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {myWins.length === 0 && <div className="text-slate-500 p-8 border border-dashed border-slate-700 rounded-2xl text-center bg-slate-900/30 font-medium">No winnings yet. Good luck!</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
