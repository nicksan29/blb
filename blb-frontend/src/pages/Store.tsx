import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Lock, ShoppingCart } from 'lucide-react';
import Layout from '../components/layout'; // Corrigido para l minúsculo
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import ProductModal from '../components/ProductModal';

interface StoreItem {
  id: number;
  name: string;
  description: string;
  price_btlcs: number;
  image_path: string | null;
  stock: number;
}

export default function Store() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const { user, updateUser } = useAuthStore();
  const [message, setMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StoreItem | null>(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // 1. Criamos a função fetchItems corretamente para poder ser chamada várias vezes
  const fetchItems = useCallback(() => {
    api.get('/store').then(response => {
      setIsStoreOpen(response.data.is_open);
      if (response.data.is_open) {
        setItems(response.data.items);
      }
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleBuy = async (itemId: number) => {
    setMessage('');
    try {
      const response = await api.post(`/store/buy/${itemId}`);
      
      setMessage(response.data.message || 'Compra realizada com sucesso!');
      fetchItems(); 
      
      if (response.data.new_balance !== undefined) {
        updateUser({ betelcoins: response.data.new_balance });
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao tentar realizar a compra.';
      setMessage(errorMsg);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="text-blb-gold" /> Loja BLB
        </h2>
        <p className="text-zinc-400 text-sm mt-1 italic">"Sempre com você"</p>
        
        {/* Mostra o saldo atualizado na hora */}
        <div className="mt-4 inline-block bg-blb-purple/20 border border-blb-purple px-4 py-2 rounded-lg">
          <span className="text-sm font-bold text-zinc-300 mr-2">Seu Saldo:</span>
          <span className="text-lg font-black text-blb-gold">{user?.betelcoins} Btlcs</span>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg font-bold text-center ${message.includes('sucesso') ? 'bg-green-900/50 text-green-400 border border-green-500' : 'bg-red-900/50 text-red-400 border border-red-500'}`}>
          {message}
        </div>
      )}

      {!isStoreOpen ? (
        <div className="flex flex-col items-center justify-center p-10 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
          <Lock size={48} className="text-zinc-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Loja Fechada</h3>
          <p className="text-zinc-400 text-sm">A diretoria fechou a loja temporariamente. Volte mais tarde!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
              {/* Espaço para Imagem - Placeholder se não tiver */}
              <div 
                className="h-40 bg-black border-b border-zinc-800 flex items-center justify-center relative cursor-pointer"
                onClick={() => setSelectedProduct(item)}
              >
                {item.image_path ? (
                  <img src={`${API_URL}/storage/${item.image_path}`} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag size={48} className="text-zinc-800" />
                )}
                <div className="absolute top-2 right-2 bg-blb-black/80 px-2 py-1 rounded text-xs font-bold text-zinc-400 backdrop-blur">
                  Estoque: {item.stock}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg">{item.name}</h3>
                  {item.description && <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{item.description}</p>}
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-black text-blb-gold">{item.price_btlcs} Btlcs</span>
                  <button
                    onClick={() => setSelectedProduct(item)}
                    disabled={item.stock <= 0}
                    className="bg-blb-gold hover:bg-blb-purple text-blb-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors font-bold flex items-center gap-2"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              Nenhum item disponível na loja no momento.
            </div>
          )}
        </div>
      )}

      {selectedProduct && (
        <ProductModal 
          item={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onBuy={handleBuy} 
        />
      )}
    </Layout>
  );
}