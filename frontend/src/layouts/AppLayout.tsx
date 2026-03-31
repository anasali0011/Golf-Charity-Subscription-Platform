import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trophy, Settings, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  if (user?.is_admin) {
    navItems.push({ name: 'Admin', path: '/admin', icon: Settings });
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-900">
      {/* Background decoration across the app */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Navbar layer */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="glass-card sticky top-0 z-50 border-b border-slate-700/50 backdrop-blur-xl bg-slate-900/60 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="text-teal-400 p-2.5 rounded-xl bg-teal-500/10 mr-3 shadow-[0_0_15px_rgba(20,184,166,0.15)] border border-teal-500/20">
                <Trophy size={26} />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400 font-display tracking-wide">
                GolfLottery
              </span>
            </div>

            <div className="flex items-center space-x-6">
              {/* Desktop Nav */}
              <div className="hidden md:flex space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 font-medium ${
                        isActive 
                          ? 'bg-teal-500/15 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)] border border-teal-500/20' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon size={18} className="mr-2.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-5 border-l border-slate-700/60 pl-6 ml-4">
                <div className="text-sm text-right">
                  <span className="block text-slate-200 font-semibold">{user?.name}</span>
                  <span className="block text-xs text-teal-500/80 font-medium uppercase tracking-wider">{user?.is_admin ? 'Admin' : 'Member'}</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                  title="Logout"
                >
                  <LogOut size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
