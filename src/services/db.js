import { neon } from '@neondatabase/serverless';

export const getDb = () => {
  const token = localStorage.getItem('neon_auth_token');
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const dbUrl = `postgresql://authenticated:${token}@ep-odd-meadow-acui84xv-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require`;
  
  return neon(dbUrl);
};
