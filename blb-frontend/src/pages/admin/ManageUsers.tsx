import { useState, useEffect } from 'react';
import { Users, Key } from 'lucide-react';
import Layout from '../../components/layout';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  level: number;
  xp: number;
  betelcoins: number;
}

export default function ManageUsers() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<UserData[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [pointsData, setPointsData] = useState({ level: 0, xp: 0, betelcoins: 0 });
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

  const handleUpdatePoints = async (e: React.FormEvent, userId: number) => {
    e.preventDefault();
    try {
      const response = await api.put(`/admin/users/${userId}/points`, pointsData);
      setMessage(response.data.message);
      setExpandedId(null);
      // Atualiza a lista
      api.get('/admin/users').then(res => setUsers(res.data));
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Erro ao alterar pontuação.');
    }
  };

  const handleRowClick = (u: UserData) => {
    if (expandedId === u.id) {
      setExpandedId(null);
    } else {
      setExpandedId(u.id);
      setPointsData({ level: u.level || 0, xp: u.xp || 0, betelcoins: u.betelcoins || 0 });
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
              onClick={() => handleRowClick(u)}
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
              <div className="border-t border-zinc-800 bg-zinc-900/50 p-4 space-y-6">
                
                {/* Forçar Senha */}
                <form onSubmit={(e) => handleForcePasswordChange(e, u.id)}>
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

                {/* Editar Pontuação (Oculto para Denilson) */}
                {currentUser?.email !== 'denilson@admin.com' && (
                  <form onSubmit={(e) => handleUpdatePoints(e, u.id)} className="pt-4 border-t border-zinc-800">
                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Editar Pontuação</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 block mb-1">Nível</span>
                        <input 
                          type="number" 
                          value={pointsData.level}
                          onChange={(e) => setPointsData({ ...pointsData, level: Number(e.target.value) })}
                          className="w-full bg-blb-black border border-zinc-700 rounded-lg p-2 text-white text-sm focus:border-blb-gold"
                          required
                          min={0}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-blb-purple block mb-1">XP</span>
                        <input 
                          type="number" 
                          value={pointsData.xp}
                          onChange={(e) => setPointsData({ ...pointsData, xp: Number(e.target.value) })}
                          className="w-full bg-blb-black border border-zinc-700 rounded-lg p-2 text-blb-purple text-sm font-bold focus:border-blb-gold"
                          required
                          min={0}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-blb-gold block mb-1">Betelcoins</span>
                        <input 
                          type="number" 
                          value={pointsData.betelcoins}
                          onChange={(e) => setPointsData({ ...pointsData, betelcoins: Number(e.target.value) })}
                          className="w-full bg-blb-black border border-zinc-700 rounded-lg p-2 text-blb-gold text-sm font-bold focus:border-blb-gold"
                          required
                          min={0}
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-blb-purple hover:bg-blb-gold text-white hover:text-blb-black font-bold py-2 rounded-lg text-sm transition-colors"
                    >
                      Salvar Pontuação
                    </button>
                  </form>
                )}

              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}