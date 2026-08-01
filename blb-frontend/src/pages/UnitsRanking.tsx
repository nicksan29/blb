import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Layout from '../components/layout';
import { api } from '../services/api';

export default function UnitsRanking() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (unitName.includes('Judá')) return '#D4AF37'; // Dourado
    if (unitName.includes('Benjamim')) return '#A8A9AD'; // Prata
    if (unitName.includes('Aser')) return '#CD7F32'; // Bronze/Laranja
    if (unitName.includes('Gade')) return '#6A0D91'; // Roxo
    return '#D4AF37';
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
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
    </Layout>
  );
}
