const API_URL = 'https://ep-odd-meadow-acui84xv.neonauth.sa-east-1.aws.neon.tech/neondb/auth';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Falha no login. Verifique suas credenciais.');
  }

  const data = await response.json();
  localStorage.setItem('neon_auth_token', data.token);
  return data; // retorna { user, session, token }
};

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Falha ao criar conta.');
  }

  const data = await response.json();
  localStorage.setItem('neon_auth_token', data.token);
  return data;
};

export const logout = async () => {
  const token = localStorage.getItem('neon_auth_token');
  if (!token) return;

  await fetch(`${API_URL}/sign-out`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).catch(() => {}); // Ignora erros de rede no logout

  localStorage.removeItem('neon_auth_token');
};
