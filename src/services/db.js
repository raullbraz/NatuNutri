import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_VkWsRvPLaM75@ep-odd-meadow-acui84xv-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

export const getDb = () => {
  const token = localStorage.getItem('neon_auth_token');
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  return neon(DATABASE_URL);
};

