import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Shield } from 'lucide-react';
import { GiLion, GiWolfHead, GiTigerHead, GiBearFace } from 'react-icons/gi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import confetti from 'canvas-confetti';
import Layout from '../components/layout';
import { api } from '../services/api';

export default function UnitsRanking() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [cheerMessage, setCheerMessage] = useState<{ text: string, colorClass: string } | null>(null);

  useEffect(() => {
    api.get('/units/ranking').then(response => {
      setRanking(response.data);
      setLoading(false);
    }).catch(err => console.error(err));
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-white mb-1">{payload[0].payload.name}</p>
          <p className="text-blb-gold font-bold">Pontuação: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const getUnitColor = (unitName: string) => {
    if (unitName.includes('Judá')) return 'url(#colorJuda)';
    if (unitName.includes('Benjamim')) return 'url(#colorBenjamim)';
    if (unitName.includes('Aser')) return 'url(#colorAser)';
    if (unitName.includes('Gade')) return 'url(#colorGade)';
    return '#D4AF37';
  };

  const getUnitTabStyle = (unitName: string, isSelected: boolean) => {
    if (!isSelected) return 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700';
    if (unitName.includes('Benjamim')) return 'bg-gradient-to-r from-blue-500 to-pink-500 text-white border-blue-400';
    if (unitName.includes('Aser')) return 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-500';
    if (unitName.includes('Judá')) return 'bg-gradient-to-r from-black to-yellow-600 text-white border-yellow-500';
    if (unitName.includes('Gade')) return 'bg-gradient-to-r from-black to-red-800 text-white border-red-600';
    return 'bg-blb-gold text-black';
  };

  const Mascot = ({ unitName, className = '' }: { unitName: string, className?: string }) => {
    const [isSmiling, setIsSmiling] = useState(false);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setIsSmiling(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    const iconProps = {
      size: 80,
      className: `transition-transform duration-500 drop-shadow-2xl ${isSmiling ? 'scale-110' : 'scale-100'} ${className}`
    };

    if (unitName.includes('Judá')) {
      return <GiLion {...iconProps} color="#ca8a04" />;
    } else if (unitName.includes('Benjamim')) {
      return <GiWolfHead {...iconProps} color="#3b82f6" />;
    } else if (unitName.includes('Aser')) {
      return <GiTigerHead {...iconProps} color="#f97316" />;
    } else if (unitName.includes('Gade')) {
      return <GiBearFace {...iconProps} color="#991b1b" />;
    }

    return null;
  };

  const topUnit = ranking.length > 0 ? ranking[0].name : '';

  const handleMascotClick = (unitName: string) => {
    let colors: string[] = [];
    let colorClass = '';
    
    if (unitName.includes('Judá')) {
      colors = ['#ca8a04', '#000000'];
      colorClass = 'text-blb-gold';
    } else if (unitName.includes('Benjamim')) {
      colors = ['#3b82f6', '#ec4899'];
      colorClass = 'text-blue-400';
    } else if (unitName.includes('Aser')) {
      colors = ['#ef4444', '#f97316'];
      colorClass = 'text-orange-500';
    } else if (unitName.includes('Gade')) {
      colors = ['#991b1b', '#000000'];
      colorClass = 'text-red-600';
    }

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.3, x: 0.8 },
      colors: colors,
      zIndex: 100
    });

    setCheerMessage({ text: `Vamos ${unitName}!`, colorClass });

    setTimeout(() => {
      setCheerMessage(null);
    }, 5000);
  };

  return (
    <Layout>
      <div className="mb-8">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold flex items-center gap-2"
        >
          <Trophy className="text-blb-gold" /> Ranking das Unidades
        </motion.h2>
        <p className="text-zinc-400 text-sm mt-1">Acompanhe a corrida rumo ao topo!</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg relative overflow-visible mt-6">
        <div 
          className="absolute -top-12 right-2 md:top-4 md:right-8 opacity-90 cursor-pointer z-20 hover:scale-110 transition-transform"
          onClick={() => handleMascotClick(topUnit)}
        >
          {topUnit && <Mascot unitName={topUnit} />}
        </div>
        
        <AnimatePresence>
          {cheerMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 1 } }}
              className={`absolute -top-20 right-4 md:-top-8 md:right-32 font-bold text-2xl drop-shadow-xl z-30 ${cheerMessage.colorClass}`}
            >
              {cheerMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4 relative z-10">
          <Shield className="text-blb-gold" />
          <h3 className="text-lg font-bold text-white">Guerra das Unidades</h3>
        </div>

        {loading ? (
          <div className="text-center py-10 text-zinc-500 font-bold">Carregando ranking...</div>
        ) : (
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={ranking} 
                layout="vertical"
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBenjamim" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
                    <stop offset="100%" stopColor="#ec4899" /> {/* pink-500 */}
                  </linearGradient>
                  <linearGradient id="colorAser" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" /> {/* red-500 */}
                    <stop offset="100%" stopColor="#f97316" /> {/* orange-500 */}
                  </linearGradient>
                  <linearGradient id="colorJuda" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#27272a" /> {/* zinc-800 */}
                    <stop offset="100%" stopColor="#ca8a04" /> {/* yellow-600 */}
                  </linearGradient>
                  <linearGradient id="colorGade" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#27272a" /> {/* zinc-800 */}
                    <stop offset="100%" stopColor="#991b1b" /> {/* red-800 */}
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 'bold' }} width={120} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a' }} />
                <Bar 
                  dataKey="score" 
                  radius={[0, 4, 4, 0]} 
                  barSize={24}
                  animationDuration={1500}
                >
                  {ranking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getUnitColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Seção de Abas das Unidades */}
      {!loading && ranking.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2">Membros das Unidades</h3>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {ranking.map((unit) => (
              <button
                key={unit.name}
                onClick={() => setSelectedUnit(selectedUnit === unit.name ? null : unit.name)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${getUnitTabStyle(unit.name, selectedUnit === unit.name)}`}
              >
                {unit.name}
              </button>
            ))}
          </div>

          {selectedUnit && (
            <div className="space-y-4 animate-fade-in">
              {(() => {
                const unitData = ranking.find(u => u.name === selectedUnit);
                if (!unitData) return null;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Conselheiros */}
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 relative overflow-hidden flex flex-col h-full min-h-[200px]">
                      <div className="absolute -bottom-4 -right-4 opacity-10 pointer-events-none z-0">
                        <Mascot unitName={selectedUnit} className="!w-40 !h-40 !scale-100" />
                      </div>
                      <h4 className="text-blb-gold font-bold mb-3 uppercase text-sm tracking-wider relative z-10">Conselheiros</h4>
                      <div className="relative z-10">
                        {unitData.counselors?.length > 0 ? (
                          <div className="space-y-2">
                            {unitData.counselors.map((c: any) => (
                              <div key={c.id} className="flex items-center gap-3 bg-zinc-800 p-2 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold border border-zinc-600">
                                  {c.name.charAt(0)}
                                </div>
                                <span className="font-bold text-zinc-200">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-zinc-500 text-sm">Nenhum conselheiro encontrado.</p>
                        )}
                      </div>
                    </div>

                    {/* Desbravadores */}
                    <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                      <h4 className="text-blb-purple font-bold mb-3 uppercase text-sm tracking-wider">Desbravadores</h4>
                      {unitData.members?.length > 0 ? (
                        <div className="space-y-2">
                          {unitData.members.map((m: any) => (
                            <div key={m.id} className="flex items-center justify-between bg-zinc-800 p-2 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold border border-zinc-600">
                                  {m.name.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-bold text-zinc-200 block">{m.name}</span>
                                  <span className="text-xs text-zinc-500">Nível {m.level} • {m.xp} XP</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-500 text-sm">Nenhum desbravador encontrado.</p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </motion.div>
      )}
    </Layout>
  );
}
