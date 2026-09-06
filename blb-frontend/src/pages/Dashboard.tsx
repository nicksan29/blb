import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Coins, BarChart2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Layout from '../components/layout';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [levelRanking, setLevelRanking] = useState<any[]>([]);
  const [coinsRanking, setCoinsRanking] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'levels' | 'coins'>('levels');
  const [loading, setLoading] = useState(true);
  const [isRankingVisible, setIsRankingVisible] = useState(true);
  
  // Estado para controlar o modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    // Atualiza os dados do usuário no topo da tela
    api.get('/me').then(res => {
      useAuthStore.getState().updateUser(res.data);
    }).catch(err => console.error(err));

    api.get('/ranking').then(response => {
      setIsRankingVisible(response.data.is_visible);
      
      // Mapeia para adicionar a pontuação real e desempatar a barra
      const mappedLevelRanking = response.data.level_ranking.map((u: any) => ({
        ...u,
        score: (u.level * 100) + u.xp
      }));
      setLevelRanking(mappedLevelRanking);
      
      setCoinsRanking(response.data.betelcoins_ranking);
      setLoading(false);
    }).catch(err => console.error(err));
  }, []);

  const handleToggleRanking = async () => {
    try {
      const response = await api.post('/admin/ranking/toggle-status');
      alert(response.data.message);
      window.location.reload(); 
    } catch (err) {
      console.error('Erro ao alterar status do ranking', err);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-white mb-1">{data.name}</p>
          <p className="text-blb-gold font-bold">
            {activeTab === 'levels' 
              ? `Nível: ${data.level} (${data.xp} XP)`
              : `${data.betelcoins} Btlcs`}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Clique para ver mais</p>
        </div>
      );
    }
    return null;
  };

  const getIndividualColor = (index: number) => {
    if (index === 0) return '#D4AF37'; 
    if (index === 1) return '#A8A9AD'; 
    if (index === 2) return '#CD7F32'; 
    return '#6A0D91';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Função para abrir o modal unindo os dados do usuário (Nível + Moedas)
  const handleBarClick = (data: any) => {
    const levelData = levelRanking.find((u: any) => u.id === data.id) || {};
    const coinsData = coinsRanking.find((u: any) => u.id === data.id) || {};
    setSelectedUser({ ...levelData, ...coinsData });
  };

  return (
    <Layout>
      <div className="mb-8">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          Olá, <span className="text-blb-gold">{user?.name.split(' ')[0]}</span>!
        </motion.h2>
        <p className="text-zinc-400 text-sm mt-1">
          {user?.role === 'admin' ? 'Painel da Diretoria' : 'Resumo do Desbravador'}
        </p>
      </div>

      {!isRankingVisible && user?.role !== 'admin' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 text-center shadow-lg">
          <Trophy className="text-zinc-600 mx-auto mb-2" size={32} />
          <h3 className="text-lg font-bold text-white mb-1">Métricas em Apuração</h3>
          <p className="text-zinc-400 text-sm">Seu nível, XP e Betelcoins estão ocultos temporariamente pela diretoria para a apuração da semana.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 mb-8">
          <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center col-span-2 shadow-lg">
            <Trophy className="text-blb-gold mb-2" size={32} />
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Seu Nível Atual</span>
            <span className="text-4xl font-black text-white">{user?.level}</span>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 w-full h-1 bg-blb-purple opacity-50"></div>
            <Zap className="text-blb-purple mb-2" size={24} />
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">XP Atual</span>
            <span className="text-2xl font-bold text-white">{user?.xp}<span className="text-sm text-zinc-500 font-normal">/100</span></span>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 w-full h-1 bg-blb-gold opacity-50"></div>
            <Coins className="text-blb-gold mb-2" size={24} />
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Betelcoins</span>
            <span className="text-2xl font-bold text-white">{user?.betelcoins}</span>
          </motion.div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="text-blb-gold" />
            <h3 className="text-lg font-bold text-white">Ranking Geral</h3>
          </div>
          
          {user?.role === 'admin' && (
            <button 
              onClick={handleToggleRanking}
              className={`text-xs font-bold px-3 py-1 rounded-full border ${isRankingVisible ? 'bg-green-900/30 text-green-500 border-green-500' : 'bg-red-900/30 text-red-500 border-red-500'}`}
            >
              {isRankingVisible ? 'OCULTAR RANKING' : 'MOSTRAR RANKING'}
            </button>
          )}
        </div>

        {!isRankingVisible && user?.role !== 'admin' ? (
          <div className="text-center py-10 bg-zinc-800/50 rounded-lg border border-zinc-700 border-dashed">
            <BarChart2 className="text-zinc-600 mx-auto mb-2" size={32} />
            <p className="text-zinc-400 font-bold">O Ranking está sendo apurado pela Diretoria.</p>
            <p className="text-zinc-500 text-sm">Volte novamente mais tarde!</p>
          </div>
        ) : (
          <>
            <div className="flex bg-blb-black p-1 rounded-lg mb-6">
              <button 
                onClick={() => setActiveTab('levels')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'levels' ? 'bg-zinc-800 text-blb-gold' : 'text-zinc-500'}`}
              >
                NÍVEL / XP
              </button>
              <button 
                onClick={() => setActiveTab('coins')}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'coins' ? 'bg-zinc-800 text-blb-gold' : 'text-zinc-500'}`}
              >
                BETELCOINS
              </button>
            </div>

            {!loading && (
              <div className="w-full" style={{ height: Math.max(400, (activeTab === 'levels' ? levelRanking.length : coinsRanking.length) * 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={activeTab === 'levels' ? levelRanking : coinsRanking} 
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 'bold' }} 
                      width={120} 
                      interval={0}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
                    <Bar 
                      dataKey={activeTab === 'levels' ? 'score' : 'betelcoins'} 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                      animationDuration={1500}
                      onClick={(data) => handleBarClick(data.payload)}
                      cursor="pointer"
                    >
                      {(activeTab === 'levels' ? levelRanking : coinsRanking).map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={getIndividualColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* MODAL DO USUÁRIO */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm relative shadow-2xl"
            >
              <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
                <X size={24} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-zinc-800 rounded-full border-2 border-blb-gold mb-4 overflow-hidden flex items-center justify-center">
                  {selectedUser?.avatar_path ? (
                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${selectedUser.avatar_path}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-zinc-600">{selectedUser.name.charAt(0)}</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{selectedUser.name}</h3>
                
                <div className="w-full grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                    <Trophy className="text-blb-gold mx-auto mb-1" size={20} />
                    <p className="text-xs text-zinc-400 font-bold uppercase">Nível</p>
                    <p className="text-xl font-bold text-white">{selectedUser.level || 0}</p>
                  </div>
                  <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                    <Zap className="text-blb-purple mx-auto mb-1" size={20} />
                    <p className="text-xs text-zinc-400 font-bold uppercase">XP</p>
                    <p className="text-xl font-bold text-white">{selectedUser.xp || 0}</p>
                  </div>
                  <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 col-span-2">
                    <Coins className="text-blb-gold mx-auto mb-1" size={20} />
                    <p className="text-xs text-zinc-400 font-bold uppercase">Betelcoins</p>
                    <p className="text-xl font-bold text-white">{selectedUser.betelcoins || 0}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}