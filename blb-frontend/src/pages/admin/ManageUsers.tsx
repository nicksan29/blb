import { useState, useEffect } from 'react';
import { Users, Key } from 'lucide-react';
import Layout from '../../components/layout';
import { api } from '../../services/api';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(response => {
      setUsers(response.data);
    }).catch(err => console.error(err));
  }, []);

  const handleForcePasswordChange = async (e: React.FormEvent, userId: number) => {
    e.preventDefault();
    try {
      const response = await api.post(`/admin/users/${userId}/change-password`, { new_password: newPassword });
      setMessage(response.data.message);
      setNewPassword('');
      setExpandedId(null);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Erro ao alterar senha do usuário.');
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-blb-gold" /> Gerenciar Contas
        </h2>
        <p className="text-zinc-400 text-sm mt-1">Altere senhas e gerencie acessos do clube.</p>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blb-gold/20 border border-blb-gold text-blb-gold rounded-lg text-sm text-center font-bold">
          {message}
        </div>
      )}

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-zinc-800/50"
              onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
            >
              <div>
                <h3 className="font-bold text-white">{u.name}</h3>
                <p className="text-xs text-zinc-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${u.role === 'admin' ? 'bg-blb-purple/20 text-blb-purple' : 'bg-zinc-800 text-zinc-400'}`}>
                  {u.role}
                </span>
              </div>
            </div>

            {expandedId === u.id && (
              <form onSubmit={(e) => handleForcePasswordChange(e, u.id)} className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Forçar Nova Senha</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha..."
                    className="flex-1 bg-blb-black border border-zinc-700 rounded-lg p-2 text-white text-sm focus:border-blb-gold"
                    required
                    minLength={6}
                  />
                  <button 
                    type="submit"
                    className="bg-blb-gold hover:bg-blb-purple text-blb-black hover:text-white font-bold px-4 rounded-lg text-sm flex items-center gap-1 transition-colors"
                  >
                    <Key size={16} /> Salvar
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}