import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

export const getDb = () => {
  const token = localStorage.getItem('neon_auth_token');
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  if (!DATABASE_URL) {
    throw new Error('Configuração ausente: VITE_DATABASE_URL não está definida nas variáveis de ambiente.');
  }

  return neon(DATABASE_URL);
};

