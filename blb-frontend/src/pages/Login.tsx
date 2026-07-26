import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blb-black flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-[0_0_15px_rgba(212,175,55,0.1)] border border-zinc-800"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-blb-black rounded-full border-2 border-blb-gold flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
            <Shield className="text-blb-gold" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider"> <span className="text-blb-gold">BLB</span></h1>
          <p className="text-zinc-400 text-sm mt-1">Sempre com você</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="email" 
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-blb-black border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blb-gold transition-colors"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="password" 
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-blb-black border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blb-gold transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blb-gold hover:bg-blb-purple text-blb-black hover:text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'ENTRAR'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}