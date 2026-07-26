import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Search, Loader2 } from 'lucide-react';
import Layout from '../../components/layout';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Purchase {
  id: number;
  user_id: number;
  store_item_id: number;
  price_paid: number;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
  store_item: {
    id: number;
    name: string;
  } | null;
}

export default function Transactions() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await api.get('/admin/store/purchases');
      setPurchases(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(p => 
    p.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.store_item?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <button 
            onClick={() => navigate('/admin/loja')}
            className="flex items-center gap-2 text-zinc-400 hover:text-blb-gold mb-2 text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Voltar para Loja
          </button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-blb-gold" /> Histórico de Compras
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Veja tudo o que os desbravadores compraram.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 flex items-center gap-3">
        <Search className="text-zinc-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por desbravador ou produto..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-white outline-none flex-1 text-sm placeholder-zinc-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-blb-gold" size={32} />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="text-xs uppercase bg-black/40 text-zinc-300">
                <tr>
                  <th className="px-6 py-4 font-bold">Data</th>
                  <th className="px-6 py-4 font-bold">Desbravador</th>
                  <th className="px-6 py-4 font-bold">Produto</th>
                  <th className="px-6 py-4 font-bold text-right">Valor Pago</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center italic text-zinc-600">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        {new Date(purchase.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {purchase.user?.name || 'Usuário Deletado'}
                      </td>
                      <td className="px-6 py-4">
                        {purchase.store_item?.name || 'Produto Excluído'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blb-gold">
                        {purchase.price_paid} Btlcs
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
