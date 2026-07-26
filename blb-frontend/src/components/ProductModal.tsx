import { ShoppingBag, Loader2, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import ImageViewerModal from './ImageViewerModal';

interface ProductModalProps {
  item: any;
  onClose: () => void;
  onBuy: (itemId: number) => Promise<void>;
}

export default function ProductModal({ item, onClose, onBuy }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    await onBuy(item.id);
    setLoading(false);
    onClose();
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-w-md w-full relative animate-in fade-in zoom-in duration-200">
        
        {/* Foto do Produto */}
        <div 
          className={`h-48 bg-black relative flex items-center justify-center border-b border-zinc-800 ${item.image_path ? 'cursor-pointer group' : ''}`}
          onClick={() => item.image_path && setShowImageViewer(true)}
        >
          {item.image_path ? (
            <>
              <img src={`${API_URL}/storage/${item.image_path}`} alt={item.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <span className="bg-blb-black/80 text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <ImageIcon size={14} /> Ampliar Imagem
                </span>
              </div>
            </>
          ) : (
            <ShoppingBag size={48} className="text-zinc-800" />
          )}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/90 text-zinc-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Detalhes */}
        <div className="p-6">
          <h3 className="font-black text-2xl text-white mb-2">{item.name}</h3>
          
          <div className="flex gap-3 text-sm mb-4">
            <span className="bg-blb-gold/20 text-blb-gold px-2 py-1 rounded font-bold border border-blb-gold/30">
              {item.price_btlcs} Btlcs
            </span>
            <span className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700">
              Estoque: {item.stock}
            </span>
          </div>

          {item.description && (
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Ações */}
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              disabled={item.stock <= 0}
              className="w-full bg-blb-gold hover:bg-blb-purple text-blb-black hover:text-white font-black py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              COMPRAR AGORA
            </button>
          ) : (
            <div className="bg-blb-purple/20 border border-blb-purple rounded-xl p-4 text-center animate-in slide-in-from-bottom-2">
              <p className="font-bold text-white mb-4">Você tem certeza que deseja comprar?</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setConfirming(false)} 
                  disabled={loading}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  NÃO
                </button>
                <button 
                  onClick={handleBuy}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-lg flex justify-center items-center transition-colors"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'SIM, COMPRAR'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showImageViewer && item.image_path && (
        <ImageViewerModal 
          imageUrl={`${API_URL}/storage/${item.image_path}`} 
          onClose={() => setShowImageViewer(false)} 
        />
      )}
    </div>
  );
}
