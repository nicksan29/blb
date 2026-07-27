import { X, Download } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string;
  type?: 'image' | 'video';
  onClose: () => void;
}

export default function ImageViewerModal({ imageUrl, type = 'image', onClose }: ImageViewerModalProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = type === 'video' ? 'mp4' : 'jpg'; // Basic fallback
      link.download = `evidencia-blb.${extension}`; // Você pode tornar o nome dinâmico se quiser
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar a imagem', error);
      alert('Não foi possível baixar a imagem.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
      
      {/* Botão Fechar no topo */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full p-2 transition-colors z-[201]"
      >
        <X size={24} />
      </button>

      {/* Container da Imagem */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {type === 'video' ? (
          <video 
            src={imageUrl} 
            controls
            autoPlay
            className="max-w-full max-h-[85vh] rounded-xl border border-zinc-800 shadow-2xl" 
          />
        ) : (
          <img 
            src={imageUrl} 
            alt="Imagem em tela cheia" 
            className="max-w-full max-h-[85vh] object-contain rounded-xl border border-zinc-800 shadow-2xl" 
          />
        )}
        
        {/* Botão de Download */}
        <button 
          onClick={handleDownload}
          className="mt-6 flex items-center gap-2 bg-blb-gold hover:bg-blb-purple text-blb-black font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
        >
          <Download size={20} />
          Baixar {type === 'video' ? 'Vídeo' : 'Imagem'}
        </button>
      </div>

    </div>
  );
}
