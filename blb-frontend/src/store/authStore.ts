import { create } from 'zustand';
import { api } from '../services/api';

// Definindo os tipos para o TypeScript te ajudar no VSCode
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'dbv' | 'counselor';
  unit?: string | null;
  avatar_path: string | null;
  level: number;
  xp: number;
  betelcoins: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void; // Para atualizar XP/Moedas dinamicamente
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('@blb-user') || 'null'),
  token: localStorage.getItem('@blb-token') || null,
  isAuthenticated: !!localStorage.getItem('@blb-token'),

  login: (token, user) => {
    localStorage.setItem('@blb-token', token);
    localStorage.setItem('@blb-user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/logout'); // Tenta deslogar no backend
    } catch (error) {
      console.error('Erro ao deslogar na API', error);
    } finally {
      localStorage.removeItem('@blb-token');
      localStorage.removeItem('@blb-user');
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  updateUser: (updatedData) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedData };
      localStorage.setItem('@blb-user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },
}));