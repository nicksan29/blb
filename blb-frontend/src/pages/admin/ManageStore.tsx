import { useState, useEffect } from 'react';
import { ShoppingBag, PlusCircle, Power, Edit2, Trash2, CheckCircle, Upload } from 'lucide-react';
import Layout from '../../components/layout';
import { api } from '../../services/api';

interface StoreItem {
  id: number;
  name: string;
  description: string;
  price_btlcs: number;
  stock: number;
  image_path: string | null;
}

export default function ManageStore() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Estados do formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceBtlcs, setPriceBtlcs] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchItems = () => {
    api.get('/admin/store/all').then(res => setItems(res.data.items || [])).catch(console.error);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        // Editando (sem alterar foto)
        await api.put(`/admin/store/${editingId}`, {
          name, description, price_btlcs: Number(priceBtlcs), stock: Number(stock)
        });
        setMessage('Produto atualizado com sucesso!');
      } else {
        // Criando (com foto)
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price_btlcs', priceBtlcs);
        formData.append('stock', stock);
        if (image) formData.append('image', image);

        await api.post('/admin/store', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMessage('Produto cadastrado com sucesso!');
      }

      resetForm();
      fetchItems();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Erro ao salvar produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await api.delete(`/admin/store/${id}`);
      setMessage('Produto excluído!');
      fetchItems();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Erro ao excluir.');
    }
  };

  const handleEdit = (item: StoreItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setPriceBtlcs(item.price_btlcs.toString());
    setStock(item.stock.toString());
    setImage(null); // Limpa o input de imagem
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStore = async () => {
    try {
      const res = await api.post('/admin/store/toggle-status');
      setMessage(res.data.message);
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setMessage('Erro ao alterar status.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPriceBtlcs('');
    setStock('');
    setImage(null);
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-blb-gold" /> {editingId ? 'Editar Produto' : 'Gerenciar Loja'}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Estoque, produtos e status.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.href = '/admin/loja/compras'}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-lg transition-colors font-bold text-sm border border-zinc-700 flex items-center gap-2"
          >
            Histórico de Compras
          </button>
          <button onClick={handleToggleStore} className="bg-zinc-800 hover:bg-zinc-700 text-white p-3 rounded-full transition-colors shadow-lg border border-zinc-700" title="Abrir/Fechar Loja">
            <Power className="text-red-500" />
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blb-gold/20 border border-blb-gold text-blb-gold rounded-lg text-sm text-center font-bold">
          {message}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 mb-8 shadow-lg">
        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Nome do Produto</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-white focus:border-blb-gold" required />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Descrição (Opcional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-white focus:border-blb-gold h-20 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Preço (Btlcs)</label>
            <input type="number" value={priceBtlcs} onChange={(e) => setPriceBtlcs(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-blb-gold font-bold focus:border-blb-gold" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Estoque</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-white font-bold focus:border-blb-gold" required />
          </div>
        </div>

        {/* Input de Imagem só aparece ao criar um novo item */}
        {!editingId && (
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase flex items-center gap-2">
              <Upload size={14} /> Foto do Produto (Opcional)
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blb-gold file:text-blb-black hover:file:bg-blb-purple hover:file:text-white transition-all" 
            />
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {editingId && (
            <button type="button" onClick={resetForm} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors">
              CANCELAR
            </button>
          )}
          <button type="submit" disabled={loading} className="flex-[2] bg-blb-gold hover:bg-blb-purple text-blb-black hover:text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
            {editingId ? <CheckCircle size={20} /> : <PlusCircle size={20} />}
            {editingId ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR PRODUTO'}
          </button>
        </div>
      </form>

      {/* Lista de Produtos Existentes */}
      <h3 className="font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
        <ShoppingBag size={18} className="text-zinc-500" /> Itens Cadastrados
      </h3>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex gap-4 items-center">
            <div className="w-16 h-16 bg-black rounded-lg border border-zinc-800 overflow-hidden shrink-0">
              {item.image_path ? (
                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${item.image_path}`} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700"><ShoppingBag size={20} /></div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-sm">{item.name}</h4>
              <div className="flex gap-3 text-xs mt-1">
                <span className="text-blb-gold font-bold">{item.price_btlcs} Btlcs</span>
                <span className="text-zinc-400">Estoque: {item.stock}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleEdit(item)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-blb-gold rounded-lg transition-colors"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}