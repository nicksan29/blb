import { useState, useEffect } from 'react';
import { Target, PlusCircle, Trash2, Edit2, CheckCircle, Clock, Upload, X } from 'lucide-react';
import Layout from '../../components/layout';
import { api } from '../../services/api';

interface Mission {
    id: number;
    title: string;
    description: string;
    category: string;
    reward_xp: number;
    reward_btlcs: number;
    expires_at: string | null;
    media_paths?: string[] | null;
}

export default function CreateMission() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Estados do formulário
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Mental');
    const [rewardXp, setRewardXp] = useState('');
    const [rewardBtlcs, setRewardBtlcs] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [missionMedia, setMissionMedia] = useState<File[]>([]);

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchMissions = () => {
        // Agora o Admin busca da rota 'all' para ver tudo o que criou
        api.get('/admin/missions/all').then(res => setMissions(res.data)).catch(console.error);
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Usar FormData para suportar envio de arquivos
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('reward_xp', rewardXp.toString());
            formData.append('reward_btlcs', rewardBtlcs.toString());
            if (expiresAt) formData.append('expires_at', expiresAt);

            missionMedia.forEach(file => {
                formData.append('mission_media[]', file);
            });

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (editingId) {
                await api.post(`/admin/missions/${editingId}?_method=PUT`, formData, config);
                setMessage('Missão atualizada com sucesso!');
            } else {
                await api.post('/admin/missions', formData, config);
                setMessage('Missão criada e publicada com sucesso!');
            }

            resetForm();
            fetchMissions();
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setMessage('Erro ao salvar missão.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta missão?')) return;
        try {
            await api.delete(`/admin/missions/${id}`);
            setMessage('Missão excluída!');
            fetchMissions();
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setMessage('Erro ao excluir.');
        }
    };

    const handleEdit = (m: Mission) => {
        setEditingId(m.id);
        setTitle(m.title);
        setDescription(m.description);
        setCategory(m.category || 'Mental');
        setRewardXp(m.reward_xp.toString());
        setRewardBtlcs(m.reward_btlcs.toString());
        // Formata a data para o input datetime-local
        setExpiresAt(m.expires_at ? new Date(m.expires_at).toISOString().slice(0, 16) : '');
        setMissionMedia([]); // Limpa mídias novas ao editar
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setCategory('Mental');
        setRewardXp('');
        setRewardBtlcs('');
        setExpiresAt('');
        setMissionMedia([]);
    };

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Target className="text-blb-purple" /> {editingId ? 'Editar Missão' : 'Nova Missão'}
                </h2>
                <p className="text-zinc-400 text-sm mt-1">Gerencie os desafios da semana.</p>
            </div>

            {message && (
                <div className="mb-4 p-3 bg-blb-purple/20 border border-blb-purple text-purple-300 rounded-lg text-sm text-center font-bold">
                    {message}
                </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 mb-8 shadow-lg">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Título da Missão</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-white focus:border-blb-purple" required />
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Descrição e Regras</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-white focus:border-blb-purple h-24 resize-none" required />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Categoria</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-white focus:border-blb-purple outline-none">
                            <option value="Natureza">Natureza</option>
                            <option value="Espiritual">Espiritual</option>
                            <option value="Física">Física</option>
                            <option value="Mental">Mental</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">XP</label>
                        <input type="number" value={rewardXp} onChange={(e) => setRewardXp(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-blb-purple font-bold focus:border-blb-purple" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Btlcs</label>
                        <input type="number" value={rewardBtlcs} onChange={(e) => setRewardBtlcs(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-blb-gold font-bold focus:border-blb-purple" required />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase">Expira em (Opcional)</label>
                        <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="w-full bg-blb-black border border-zinc-700 rounded-lg p-3 text-white focus:border-blb-purple [color-scheme:dark]" />
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 mt-4">
                    <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase flex items-center gap-2">
                        <Upload size={14} /> Anexar Mídias de Exemplo (Opcional)
                    </label>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*,video/*" 
                        onChange={(e) => {
                            if (e.target.files) {
                                setMissionMedia(prev => [...prev, ...Array.from(e.target.files!)]);
                            }
                        }} 
                        className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 cursor-pointer"
                    />
                    
                    {/* Lista de mídias selecionadas */}
                    {missionMedia.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-xs text-blb-purple font-bold">{missionMedia.length} arquivo(s) selecionado(s):</p>
                            <div className="flex flex-col gap-2">
                                {missionMedia.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-black/40 border border-zinc-700 p-2 rounded-lg">
                                        <span className="text-xs text-zinc-300 truncate max-w-[250px]">{file.name}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setMissionMedia(prev => prev.filter((_, i) => i !== idx))}
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

                <div className="flex gap-2 mt-4">
                    {editingId && (
                        <button type="button" onClick={resetForm} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors">
                            CANCELAR
                        </button>
                    )}
                    <button type="submit" disabled={loading} className="flex-[2] bg-blb-purple hover:bg-blb-gold text-white hover:text-blb-black font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
                        {editingId ? <CheckCircle size={20} /> : <PlusCircle size={20} />}
                        {editingId ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR MISSÃO'}
                    </button>
                </div>
            </form>

            {/* Lista de Missões Existentes */}
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Target size={18} className="text-zinc-500" /> Histórico de Missões
                </h3>
            </div>
            <div className="space-y-3">
                {missions.map(m => {
                    // Verifica se expirou baseado na data de hoje
                    const isExpired = m.expires_at && new Date(m.expires_at) < new Date();

                    return (
                        <div key={m.id} className={`border rounded-xl p-4 flex justify-between items-center transition-colors ${isExpired ? 'bg-red-900/10 border-red-900/50' : 'bg-zinc-900 border-zinc-800'}`}>
                            <div>
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    {m.title}
                                    {isExpired && <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-bold uppercase">Expirada</span>}
                                    {!isExpired && <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded font-bold uppercase">Ativa</span>}
                                </h4>
                                <div className="flex items-center gap-3 text-xs mt-1">
                                    <span className="text-zinc-400 font-bold uppercase">{m.category || 'Mental'}</span>
                                    <span className="text-blb-purple font-bold">{m.reward_xp} XP</span>
                                    <span className="text-blb-gold font-bold">{m.reward_btlcs} Btlcs</span>
                                    {m.expires_at && (
                                        <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : 'text-zinc-500'}`}>
                                            <Clock size={12} /> Vencimento: {new Date(m.expires_at).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(m)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-blb-gold rounded-lg transition-colors"><Edit2 size={18} /></button>
                                <button onClick={() => handleDelete(m.id)} className="p-2 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    );
                })}

                {missions.length === 0 && (
                    <div className="text-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                        Nenhuma missão cadastrada ainda.
                    </div>
                )}
            </div>
        </Layout>
    );
}