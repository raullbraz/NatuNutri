import { neon } from '@neondatabase/serverless';

export const getDb = () => {
  const token = localStorage.getItem('neon_auth_token');
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const poolerHost = import.meta.env.VITE_NEON_POOLER_HOST || 'ep-odd-meadow-acui84xv-pooler.sa-east-1.aws.neon.tech';
  const database = import.meta.env.VITE_NEON_DATABASE || 'neondb';
  const dbUrl = `postgresql://authenticated:${token}@${poolerHost}/${database}?sslmode=require`;
  
  return neon(dbUrl);
};

