import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Upload, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import Layout from '../components/layout';
import { api } from '../services/api';
import ImageViewerModal from '../components/ImageViewerModal';

export default function Missions() {
  const [missions, setMissions] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [proofText, setProofText] = useState('');
  const [proofMedia, setProofMedia] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState<{url: string, type: 'image' | 'video'} | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    proofMedia.forEach((file) => {
      formData.append('proof_media[]', file);
    });

    try {
      await api.post(`/missions/${missionId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProofText('');
      setProofMedia([]);
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

                    {/* Galeria de Mídias da Missão (Exemplos do Admin) */}
                    {mission.media_paths && mission.media_paths.length > 0 && (
                      <div className="mb-4">
                        <p className="text-zinc-500 text-xs font-bold uppercase mb-2">Exemplos da Missão:</p>
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                          {mission.media_paths.map((path: string, index: number) => {
                            const isVideo = path.match(/\.(mp4|mov|avi|wmv)$/i);
                            const mediaUrl = `${API_URL}/storage/${path}`;
                            return (
                              <div 
                                key={index} 
                                className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-zinc-700 relative cursor-pointer group bg-black"
                                onClick={() => setShowImageViewer({ url: mediaUrl, type: isVideo ? 'video' : 'image' })}
                              >
                                {isVideo ? (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-500 group-hover:bg-zinc-800 transition-colors">
                                    <span className="text-[10px] font-bold">Vídeo</span>
                                  </div>
                                ) : (
                                  <img src={mediaUrl} alt={`Exemplo ${index}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

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
                            <Upload size={14} /> Enviar Mídias (Fotos e Vídeos)
                          </label>
                          <input 
                            type="file" 
                            multiple
                            accept="image/*,video/*" 
                            onChange={(e) => {
                              if (e.target.files) {
                                setProofMedia(prev => [...prev, ...Array.from(e.target.files!)]);
                              }
                            }} 
                            className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blb-gold file:text-blb-black cursor-pointer" 
                          />
                          
                          {/* Lista de mídias selecionadas */}
                          {proofMedia.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs text-blb-gold font-bold">{proofMedia.length} arquivo(s) selecionado(s):</p>
                              <div className="flex flex-col gap-2">
                                {proofMedia.map((file, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-black/40 border border-zinc-700 p-2 rounded-lg">
                                    <span className="text-xs text-zinc-300 truncate max-w-[200px]">{file.name}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => setProofMedia(prev => prev.filter((_, i) => i !== idx))}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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

      {showImageViewer && (
        <ImageViewerModal 
          imageUrl={showImageViewer.url}
          type={showImageViewer.type}
          onClose={() => setShowImageViewer(null)} 
        />
      )}
    </Layout>
  );
}