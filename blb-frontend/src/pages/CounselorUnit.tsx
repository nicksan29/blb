import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, CheckCircle, Clock, X } from 'lucide-react';
import Layout from '../components/layout';
import { api } from '../services/api';

export default function CounselorUnit() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    api.get('/counselor/unit').then(response => {
      setMembers(response.data);
      setLoading(false);
    }).catch(err => console.error(err));
  }, []);

  const getUnitColor = (unitName: string) => {
    if (!unitName) return '#D4AF37';
    if (unitName.includes('Judá')) return '#D4AF37'; 
    if (unitName.includes('Benjamim')) return '#A8A9AD'; 
    if (unitName.includes('Aser')) return '#CD7F32'; 
    if (unitName.includes('Gade')) return '#6A0D91'; 
    return '#D4AF37';
  };

  return (
    <Layout>
      <div className="mb-8">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold flex items-center gap-2"
        >
          <Shield className="text-blb-purple" /> Minha Unidade
        </motion.h2>
        <p className="text-zinc-400 text-sm mt-1">Acompanhe seus desbravadores e suas missões.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-zinc-500 font-bold">Carregando desbravadores...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map(member => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={member.id} 
              onClick={() => setSelectedUser(member)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors shadow-lg"
              style={{ borderLeftColor: getUnitColor(member.unit), borderLeftWidth: '4px' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-zinc-700">
                  {member.avatar_path ? (
                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${member.avatar_path}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-zinc-500">{member.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{member.name}</h3>
                  <div className="flex gap-3 text-xs font-bold mt-1">
                    <span className="text-zinc-400">Nível {member.level}</span>
                    <span className="text-blb-purple">{member.xp} XP</span>
                  </div>
                </div>
              </div>
              <Target className="text-zinc-600" />
            </motion.div>
          ))}
          {members.length === 0 && (
            <div className="col-span-2 text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              Nenhum membro encontrado na sua unidade.
            </div>
          )}
        </div>
      )}

      {/* Modal do Desbravador e Missões */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md relative shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-blb-gold">
                  {selectedUser.avatar_path ? (
                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${selectedUser.avatar_path}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-xl text-zinc-500">{selectedUser.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl">{selectedUser.name}</h3>
                  <p className="text-sm text-blb-gold font-bold">{selectedUser.unit}</p>
                </div>
              </div>

              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Target size={18} className="text-blb-purple" /> Histórico de Missões
              </h4>

              <div className="space-y-3">
                {selectedUser.submissions && selectedUser.submissions.length > 0 ? (
                  selectedUser.submissions.map((sub: any) => (
                    <div key={sub.id} className="bg-blb-black border border-zinc-800 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white text-sm">{sub.mission?.title}</span>
                        {sub.status === 'approved' && <CheckCircle size={16} className="text-green-500 shrink-0" />}
                        {sub.status === 'pending' && <Clock size={16} className="text-yellow-500 shrink-0" />}
                        {sub.status === 'rejected' && <X size={16} className="text-red-500 shrink-0" />}
                      </div>
                      <span className="text-xs text-zinc-500 font-bold uppercase">
                        {sub.status === 'approved' ? 'Concluída' : sub.status === 'pending' ? 'Pendente' : 'Recusada'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-4 bg-blb-black rounded-lg border border-zinc-800">
                    Nenhuma missão enviada ainda.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
