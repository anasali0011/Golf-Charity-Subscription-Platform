
import { useAuth } from '../context/AuthContext';
import ScoreWidget from '../components/ScoreWidget';
import SubscriptionWidget from '../components/SubscriptionWidget';
import DrawHistoryWidget from '../components/DrawHistoryWidget';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      className="space-y-8 pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.header variants={itemVariants} className="mb-10 text-center sm:text-left relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/20 blur-3xl rounded-full"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 drop-shadow-sm font-display">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-slate-400 mt-3 text-lg font-light tracking-wide max-w-2xl">
          Manage your scores, track subscriptions, and check your lottery status with ease.
        </p>
      </motion.header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[450px]">
        <motion.div variants={itemVariants} className="h-full">
          <ScoreWidget />
        </motion.div>

        <motion.div variants={itemVariants} className="h-full">
          <SubscriptionWidget />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <DrawHistoryWidget />
      </motion.div>
    </motion.div>
  );
}
