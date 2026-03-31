import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, HeartHandshake, CheckSquare } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // users, charities, draws
  
  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-20 relative">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.header variants={itemVariants} className="mb-10 text-center sm:text-left relative">
        <h1 className="text-4xl md:text-5xl font-extrabold flex items-center justify-center sm:justify-start bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400 font-display">
          <ShieldCheck size={42} className="mr-4 text-teal-400" /> Admin Command Center
        </h1>
        <p className="text-slate-400 mt-4 text-lg font-light tracking-wide max-w-2xl">Manage platform operations, verify winners, and view system data</p>
      </motion.header>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
        {['users', 'charities', 'draws'].map(tab => (
          <button
            key={tab}
            className={`px-6 py-3 rounded-2xl font-bold tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 ${
              activeTab === tab 
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 shadow-[0_0_20px_rgba(20,184,166,0.3)] border-transparent' 
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-700/50'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-10 rounded-[2rem] min-h-[450px] relative overflow-hidden backdrop-blur-xl border border-slate-700/60 shadow-2xl">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <h2 className="text-3xl font-extrabold flex items-center mb-6 font-display text-white tracking-tight"><Users className="mr-3 text-teal-400" size={32}/> Manage Users</h2>
            <div className="text-slate-400 p-12 text-center border-2 border-dashed border-slate-700/50 rounded-3xl bg-slate-900/30">
              <Users size={64} className="mx-auto mb-6 opacity-40 text-teal-400" />
              <p className="text-lg font-medium text-slate-300">User management interface goes here.</p>
              <p className="text-sm mt-2 opacity-80">In a full implementation, you would see a table of users, their subscription status, and options to edit/delete.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'charities' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <h2 className="text-3xl font-extrabold flex items-center text-white mb-6 font-display tracking-tight"><HeartHandshake className="mr-3 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" size={32}/> Manage Charities</h2>
            <div className="text-slate-400 p-12 text-center border-2 border-dashed border-slate-700/50 rounded-3xl bg-slate-900/30">
              <HeartHandshake size={64} className="mx-auto mb-6 opacity-40 text-pink-500" />
              <p className="text-lg font-medium text-slate-300">Charity management interface goes here.</p>
              <p className="text-sm mt-2 opacity-80">Allows adding new charities with descriptions and images.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'draws' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <h2 className="text-3xl font-extrabold flex items-center text-white mb-6 font-display tracking-tight"><CheckSquare className="mr-3 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" size={32}/> Verify Winners</h2>
            <div className="text-slate-400 p-12 text-center border-2 border-dashed border-slate-700/50 rounded-3xl bg-slate-900/30">
              <CheckSquare size={64} className="mx-auto mb-6 opacity-40 text-yellow-500" />
              <p className="text-lg font-medium text-slate-300">Winner verification interface.</p>
              <p className="text-sm mt-2 opacity-80">Admins can review pending payouts and mark them as 'Paid'.</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
