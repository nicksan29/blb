import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Layout from '../components/layout';
import { api } from '../services/api';

export default function Missions() {
  const [missions, setMissions] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMissions = () => {
    api.get('/missions').then(response => setMissions(response.data)).catch(console.error);
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent, missionId: number) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('proof_text', proofText);
    if (proofImage) formData.append('proof_image', proofImage);

    try {
      await api.post(`/missions/${missionId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProofText('');
      setProofImage(null);
      fetchMissions(); // Recarrega para pintar de amarelo
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao enviar.');
    } finally {
      setLoading(false);
    }
  };

  // Função para saber a cor do card baseado na categoria e status
  const getCardStyle = (mission: any) => {
    const category = mission.category || 'Mental';
    let baseStyle = 'bg-zinc-900 border-zinc-800';
    
    if (category === 'Natureza') baseStyle = 'bg-green-900/20 border-green-900/50';
    else if (category === 'Espiritual') baseStyle = 'bg-purple-900/20 border-purple-900/50';
    else if (category === 'Física') baseStyle = 'bg-yellow-900/20 border-yellow-900/50';
    else if (category === 'Mental') baseStyle = 'bg-zinc-800/50 border-zinc-700/50';

    const submissions = mission.submissions;
    if (!submissions || submissions.length === 0) return baseStyle;
    
    const status = submissions[0].status;
    if (status === 'pending') return `${baseStyle} ring-1 ring-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]`;
    if (status === 'approved') return `${baseStyle} ring-1 ring-green-500/50 opacity-60`;
    if (status === 'rejected') return `${baseStyle} ring-1 ring-red-500/50`;
    
    return baseStyle;
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="text-blb-gold" /> Missões da Semana
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Cumpra os desafios para ganhar XP e Btlcs.</p>
        </div>
        
        {/* Bolinha de Notificação se tiver missão nova (sem submissão) */}
        {missions.some(m => !m.submissions?.length) && (
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blb-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blb-gold"></span>
          </span>
        )}
      </div>

      <div className="space-y-4">
        {missions.map((mission) => {
          const submission = mission.submissions?.[0]; // Pega a tentativa mais recente
          const status = submission?.status;

          return (
            <motion.div layout key={mission.id} className={`border rounded-xl overflow-hidden transition-colors ${getCardStyle(mission)}`}>
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-black/20"
                onClick={() => setExpandedId(expandedId === mission.id ? null : mission.id)}
              >
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    {mission.title}
                    {status === 'pending' && <Clock size={16} className="text-yellow-500" />}
                    {status === 'approved' && <CheckCircle size={16} className="text-green-500" />}
                    {status === 'rejected' && <AlertTriangle size={16} className="text-red-500" />}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-bold uppercase">
                      {mission.category || 'Mental'}
                    </span>
                    {status === 'pending' && <p className="text-xs text-yellow-500 font-bold uppercase">Em Análise</p>}
                    {status === 'approved' && <p className="text-xs text-green-500 font-bold uppercase">Concluída</p>}
                    {status === 'rejected' && <p className="text-xs text-red-500 font-bold uppercase">Recusada - Tente Novamente</p>}
                  </div>
                </div>
                <div className="flex gap-3 text-sm font-bold">
                  <span className={status === 'approved' ? 'text-zinc-500 line-through' : 'text-blb-purple'}>{mission.reward_xp} XP</span>
                  <span className={status === 'approved' ? 'text-zinc-500 line-through' : 'text-blb-gold'}>{mission.reward_btlcs} Btlcs</span>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === mission.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4">
                    <p className="text-zinc-400 text-sm mb-4 bg-blb-black p-3 rounded-lg border border-zinc-800">
                      {mission.description}
                    </p>

                    {/* Exibe o motivo da recusa */}
                    {status === 'rejected' && (
                      <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-sm text-red-200">
                        <span className="font-bold block mb-1">Feedback da Diretoria:</span>
                        "{submission.rejection_reason}"
                      </div>
                    )}

                    {/* Bloqueia o formulário se já estiver pendente ou aprovado */}
                    {status === 'pending' || status === 'approved' ? (
                      <div className="text-center p-4 bg-black/30 rounded-lg text-sm text-zinc-400 font-bold border border-zinc-800">
                        {status === 'pending' ? 'Sua evidência está sendo avaliada. Aguarde.' : 'Você já concluiu esta missão!'}
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleSubmit(e, mission.id)} className="space-y-4 border-t border-zinc-800 pt-4 mt-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Relatório da Missão</label>
                          <textarea value={proofText} onChange={(e) => setProofText(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-white focus:border-blb-gold h-24 resize-none" required></textarea>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase flex items-center gap-2">
                            <Upload size={14} /> Enviar Foto (Opcional)
                          </label>
                          <input type="file" accept="image/*" onChange={(e) => setProofImage(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blb-gold file:text-blb-black" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-blb-gold hover:bg-blb-purple text-blb-black hover:text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">
                          <CheckCircle size={20} /> ENVIAR EVIDÊNCIA
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </Layout>
  );
}