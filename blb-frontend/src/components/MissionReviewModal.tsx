import { useState } from 'react';
import { X, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import ImageViewerModal from './ImageViewerModal';

interface MissionSubmission {
  id: number;
  mission: {
    id: number;
    title: string;
    reward_xp: number;
    reward_btlcs: number;
  };
  user: {
    id: number;
    name: string;
  };
  proof_text: string;
  proof_image_path: string | null;
  status: string;
  created_at: string;
}

interface MissionReviewModalProps {
  submission: MissionSubmission;
  onClose: () => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number, reason: string) => Promise<void>;
}

export default function MissionReviewModal({ submission, onClose, onApprove, onReject }: MissionReviewModalProps) {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const imageUrl = submission.proof_image_path ? `${API_URL}/storage/${submission.proof_image_path}` : null;

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(submission.id);
    setLoading(false);
    onClose();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Digite o motivo da reprovação.');
      return;
    }
    setLoading(true);
    await onReject(submission.id, rejectReason);
    setLoading(false);
    onClose();
  };

  // Formata a data de envio
  const submissionDate = new Date(submission.created_at).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-black/50">
            <div>
              <h3 className="font-bold text-lg text-white">Avaliar Missão</h3>
              <p className="text-sm text-zinc-400">Desbravador: <span className="text-blb-gold font-bold">{submission.user.name}</span></p>
              <p className="text-xs text-zinc-500 mt-1">Enviado em: {submissionDate}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content (Scrollable) */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <h4 className="text-xl font-black text-white mb-2">{submission.mission.title}</h4>
            
            <div className="flex gap-3 text-sm mb-6">
              <span className="text-blb-purple font-bold">+{submission.mission.reward_xp} XP</span>
              <span className="text-blb-gold font-bold">+{submission.mission.reward_btlcs} Btlcs</span>
            </div>

            {/* Imagem */}
            {imageUrl ? (
              <div className="mb-6">
                <p className="text-zinc-400 text-sm mb-2 font-bold uppercase tracking-wider">Evidência (Imagem)</p>
                <div 
                  className="bg-black border border-zinc-700 rounded-xl overflow-hidden h-64 relative cursor-pointer group"
                  onClick={() => setShowImageViewer(true)}
                >
                  <img src={imageUrl} alt="Evidência" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                    <span className="bg-blb-black/80 text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <ImageIcon size={14} /> Ampliar Imagem
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-zinc-800/50 border border-dashed border-zinc-700 rounded-xl p-4 text-center text-zinc-500 text-sm">
                Nenhuma imagem enviada.
              </div>
            )}

            {/* Relatório */}
            <div>
              <p className="text-zinc-400 text-sm mb-2 font-bold uppercase tracking-wider">Relatório do Desbravador</p>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 break-words">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{submission.proof_text}</p>
              </div>
            </div>

          </div>

          {/* Footer (Ações) */}
          <div className="p-4 border-t border-zinc-800 bg-black/50">
            {!rejectMode ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => setRejectMode(true)}
                  disabled={loading}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-zinc-700 hover:border-red-500 hover:text-red-400"
                >
                  <XCircle size={20} /> REPROVAR
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-blb-gold hover:bg-blb-purple text-blb-black hover:text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle size={20} /> APROVAR MISSÃO
                </button>
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-2">
                <p className="text-sm font-bold text-red-400 mb-2">Motivo da Reprovação:</p>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explique o que faltou ou o que está errado para ele refazer..."
                  className="w-full bg-zinc-950 border border-red-900 focus:border-red-500 rounded-lg p-3 text-white mb-3 outline-none min-h-[80px]"
                ></textarea>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setRejectMode(false)}
                    disabled={loading}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={loading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
                  >
                    Confirmar Reprovação
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {showImageViewer && imageUrl && (
        <ImageViewerModal 
          imageUrl={imageUrl} 
          onClose={() => setShowImageViewer(false)} 
        />
      )}
    </>
  );
}
