import { useState, useEffect } from 'react';
import { CreditCard, Heart, CheckCircle } from 'lucide-react';
import client from '../api/client';

export default function SubscriptionWidget() {
  const [status, setStatus] = useState<any>(null);
  const [charities, setCharities] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedCharity, setSelectedCharity] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await client.get('/subscriptions/status');
      setStatus(res.data);
      if (!res.data.isActive) {
        const cRes = await client.get('/subscriptions/charities');
        setCharities(cRes.data.charities);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedCharity) return alert('Please select a charity');
    setLoading(true);
    try {
      await client.post('/subscriptions', { planType: selectedPlan, charityId: selectedCharity });
      fetchStatus();
    } catch(err: any) {
      alert(err.response?.data?.error || 'Failed to subscribe');
      setLoading(false);
    }
  };

  if (loading) return <div className="glass-card rounded-2xl p-6 h-full flex items-center justify-center animate-pulse">Loading...</div>;

  if (status?.isActive) {
    const sub = status.subscription;
    return (
      <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 shadow-2xl h-full flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-2xl font-bold flex items-center text-teal-400 font-display">
            <CheckCircle className="mr-3" size={28} /> Active Plan
          </h3>
          <span className="bg-teal-500/20 text-teal-300 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            {sub.plan_type}
          </span>
        </div>
        
        <div className="space-y-5 relative z-10">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/60 shadow-inner group hover:border-teal-500/30 transition-colors">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Billing Period</p>
            <p className="text-slate-200 font-medium text-lg tracking-wide">
              {new Date(sub.start_date).toLocaleDateString()} <span className="text-teal-500 mx-2">→</span> {new Date(sub.end_date).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-700/60 shadow-inner group hover:border-pink-500/30 transition-colors">
            <p className="text-xs text-slate-400 mb-2 font-semibold flex items-center uppercase tracking-wider">
              <Heart size={14} className="text-pink-500 mr-2 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" /> Supported Charity
            </p>
            <p className="text-slate-200 font-medium text-lg tracking-wide">{sub.users.charities.name}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2rem] p-8 flex flex-col justify-between h-full border border-slate-700/50 hover:bg-slate-800/40 transition-colors shadow-2xl relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold flex items-center mb-8 font-display text-white">
          <CreditCard className="mr-3 text-emerald-400" size={28} /> Start Subscription
        </h3>
        
        <div className="flex space-x-4 mb-8">
          <button 
            className={`flex-1 py-4 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 font-bold tracking-wide ${selectedPlan === 'monthly' ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.2)]' : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-500 shadow-inner'}`}
            onClick={() => setSelectedPlan('monthly')}
          >
            Monthly <span className="text-sm font-medium opacity-80 block mt-1">($10)</span>
          </button>
          <button 
            className={`flex-1 py-4 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 font-bold tracking-wide ${selectedPlan === 'yearly' ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.2)]' : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:border-slate-500 shadow-inner'}`}
            onClick={() => setSelectedPlan('yearly')}
          >
            Yearly <span className="text-sm font-medium opacity-80 block mt-1">($100)</span>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider flex items-center">
            <Heart size={14} className="text-pink-500 mr-2 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" /> Select Charity (10% Match)
          </p>
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
            {charities.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCharity(c.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedCharity === c.id ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-slate-50 shadow-[0_0_15px_rgba(236,72,153,0.25)]' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800/80 hover:border-slate-600'}`}
              >
                <div className="font-bold text-base tracking-wide flex justify-between items-center">
                  {c.name}
                  {selectedCharity === c.id && <CheckCircle size={18} className="text-pink-400" />}
                </div>
                <div className="text-sm mt-1.5 opacity-80 leading-relaxed font-medium">{c.description}</div>
              </div>
            ))}
            {charities.length === 0 && <p className="text-slate-500 text-sm italic text-center py-4 bg-slate-900/30 rounded-xl">No charities available</p>}
          </div>
        </div>
      </div>

      <button onClick={handleSubscribe} className="bg-emerald-500 hover:bg-emerald-400 text-slate-100 font-bold w-full py-4 h-16 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] tracking-widest text-lg uppercase relative z-10" disabled={!selectedCharity}>
        Subscribe Now
      </button>
    </div>
  );
}
