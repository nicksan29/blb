import { useState } from 'react';
import { User as UserIcon, Lock, Key } from 'lucide-react';
import Layout from '../components/layout';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/profile/change-password', { new_password: newPassword });
      setMessage('Senha atualizada com sucesso!');
      setNewPassword('');
    } catch (err) {
      setMessage('Erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserIcon className="text-blb-gold" /> Meu Perfil
        </h2>
        <p className="text-zinc-400 text-sm mt-1">Gerencie suas informações de acesso.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center">
            <UserIcon size={32} className="text-zinc-500" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{user?.name}</h3>
            <p className="text-zinc-400 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 bg-blb-purple/20 text-blb-purple text-xs px-2 py-1 rounded font-bold uppercase">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Lock size={18} className="text-blb-gold" /> Alterar Senha
        </h3>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-bold text-center ${message.includes('sucesso') ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-red-900/50 text-red-400 border border-red-500'}`}>
            {message}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Nova Senha (Mín. 6 caracteres)</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-blb-black border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blb-gold"
              required 
              minLength={6}
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blb-gold hover:bg-blb-purple text-blb-black hover:text-white font-bold py-3 rounded-lg transition-colors"
        >
          SALVAR NOVA SENHA
        </button>
      </form>
    </Layout>
  );
}