import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Image as ImageIcon } from 'lucide-react';
import Layout from '../../components/layout';
import { api } from '../../services/api';
import MissionReviewModal from '../../components/MissionReviewModal';

export default function PendingMissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchPending = () => {
    api.get('/admin/missions/pending')
      .then(res => { setSubmissions(res.data); setLoading(false); })
      .catch(console.error);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/admin/missions/submissions/${id}/approve`);
      fetchPending();
    } catch (err) { alert('Erro ao aprovar.'); }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      await api.post(`/admin/missions/submissions/${id}/reject`, { rejection_reason: reason });
      fetchPending();
    } catch (err) { alert('Erro ao recusar.'); }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CheckCircle className="text-blb-gold" /> Apuração de Evidências
        </h2>
        <p className="text-zinc-400 text-sm mt-1">Aprove ou recuse as missões feitas pelos desbravadores.</p>
      </div>

      {loading ? <div className="text-center py-10 text-zinc-500">Buscando fila...</div> : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <motion.div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4">
              
              <div 
                className="w-full md:w-32 h-32 bg-black rounded-lg border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                onClick={() => setSelectedSubmission(sub)}
              >
                {sub.proof_image_path ? (
                  <img src={`${API_URL}/storage/${sub.proof_image_path}`} alt="Evidência" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-zinc-600 flex flex-col items-center"><ImageIcon size={24} /><span className="text-xs mt-1">Sem Foto</span></div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-lg truncate">{sub.mission.title}</h3>
                  <p className="text-sm text-zinc-300 truncate"><span className="font-bold text-zinc-500">Desbravador:</span> {sub.user.name}</p>
                  <p className="text-sm text-zinc-300 mt-2 bg-blb-black p-2 rounded border border-zinc-800 line-clamp-2 break-all">
                    {sub.proof_text}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-3 text-sm font-bold">
                    <span className="text-blb-purple">+{sub.mission.reward_xp} XP</span>
                    <span className="text-blb-gold">+{sub.mission.reward_btlcs} Btlcs</span>
                  </div>
                  <button 
                    onClick={() => setSelectedSubmission(sub)}
                    className="bg-blb-gold hover:bg-blb-purple text-blb-black font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Avaliar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {submissions.length === 0 && <div className="text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">Fila limpa! Nenhuma missão pendente.</div>}
        </div>
      )}

      {selectedSubmission && (
        <MissionReviewModal 
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </Layout>
  );
}