import axios from 'axios';

// Cria a instância do Axios apontando para o seu Laravel local
export const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Endereço padrão do Laravel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptador: Antes de qualquer requisição sair, ele injeta o Token se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@blb-token');
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('@blb-token');
    localStorage.removeItem('@blb-user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});