import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Target, ShoppingBag, LogOut, User as UserIcon, Users, Bell, CheckCircle, Trophy, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  
  // Estado para abrir/fechar as notificações
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    fetchNotifications();
    // Poderíamos fazer polling aqui com setInterval se necessário
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Erro ao buscar notificações', err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isCounselor = user?.role === 'counselor';
  
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { name: 'Início', path: '/dashboard', icon: <Home size={24} /> },
        { name: 'Unidades', path: '/unidades', icon: <Trophy size={24} /> },
        { name: 'Missão', path: '/admin/nova-missao', icon: <Target size={24} /> },
        { name: 'Loja', path: '/admin/loja', icon: <ShoppingBag size={24} /> },
        { name: 'Validar', path: '/admin/validar', icon: <CheckCircle size={24} /> },
      ];
    }
    
    if (isCounselor) {
      const unitName = user?.unit?.replace('Alcatéia ', '')?.replace('Leões de ', '')?.replace('Valentes de ', '')?.replace('Chamas de ', '') || 'Sua Unidade';
      return [
        { name: 'Início', path: '/dashboard', icon: <Home size={24} /> },
        { name: 'Unidades', path: '/unidades', icon: <Trophy size={24} /> },
        { name: 'Missões', path: '/missoes', icon: <Target size={24} /> },
        { name: unitName, path: '/conselheiro/unidade', icon: <Shield size={24} /> },
      ];
    }
    
    // DBV
    return [
        { name: 'Início', path: '/dashboard', icon: <Home size={24} /> },
        { name: 'Unidades', path: '/unidades', icon: <Trophy size={24} /> },
        { name: 'Missões', path: '/missoes', icon: <Target size={24} /> },
        { name: 'Loja', path: '/loja', icon: <ShoppingBag size={24} /> },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-blb-black text-white font-sans pb-20 md:pb-0 md:pl-64">
      
      {/* Topbar */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blb-gold rounded flex items-center justify-center font-bold text-blb-black shadow-lg">B</div>
          <span className="font-bold tracking-widest text-blb-gold hidden sm:block">CLUBE BLB</span>
        </div>
        
        <div className="flex items-center gap-5 relative">
          
          {/* Botão do Sininho (Notificações) */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative transition-colors ${showNotifications ? 'text-blb-gold' : 'text-zinc-400 hover:text-blb-gold'}`}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white border-2 border-zinc-900">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Modal Dropdown de Notificações */}
          {showNotifications && (
            <div className="absolute top-10 right-0 sm:right-16 w-[90vw] max-w-sm sm:w-80 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto">
              <h4 className="font-bold text-white mb-2 text-sm border-b border-zinc-700 pb-2 flex justify-between">
                Notificações
                <span className="text-zinc-400 font-normal text-xs">{unreadCount} não lidas</span>
              </h4>
              <div className="text-xs text-zinc-300 space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center p-4 text-zinc-500 italic">Nenhuma notificação.</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${n.is_read ? 'bg-zinc-900/50 text-zinc-500' : 'bg-zinc-900 border border-zinc-700 hover:border-blb-gold/50'}`}
                    >
                      <p className="break-words">{n.message}</p>
                      <span className="text-[10px] opacity-50 mt-1 block">
                        {new Date(n.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Admin: Aba Contas */}
          {isAdmin && (
            <button onClick={() => navigate('/admin/usuarios')} className="text-zinc-400 hover:text-blb-gold transition-colors hidden sm:block">
              <Users size={24} />
            </button>
          )}

          <button onClick={() => navigate('/perfil')} className="text-zinc-400 hover:text-blb-purple transition-colors">
            <UserIcon size={24} />
          </button>
          
          <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 transition-colors">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 fixed h-screen top-0 left-0 pt-20">
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                location.pathname === item.path
                  ? 'bg-blb-gold text-blb-black'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        {children}
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 flex justify-around p-3 z-50">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'text-blb-gold'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold mt-1">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}