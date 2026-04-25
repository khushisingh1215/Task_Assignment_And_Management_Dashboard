// NOTE: use relative path so dev-server proxy and same-origin production both work
const API_URL = '/api';

// Register user
export const registerUser = async (name, email, password, confirmPassword) => {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      const raw = await response.text();
      console.error('Failed to parse JSON response (registration)', raw);
      throw new Error('Server returned invalid JSON');
    }
  } else {
    const raw = await response.text();
    if (raw) {
      console.error('Unexpected non-JSON response (registration)', response.status, raw);
      throw new Error(`Server returned non-JSON response (status ${response.status})`);
    }
    data = {};
  }

  if (!response.ok) {
    console.error('Registration error response', data);
    throw new Error(data.error || 'Registration failed');
  }

  return data;
};

// Login user
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      const raw = await response.text();
      console.error('Failed to parse JSON response (login)', raw);
      throw new Error('Server returned invalid JSON');
    }
  } else {
    const raw = await response.text();
    if (raw) {
      console.error('Unexpected non-JSON response (login)', response.status, raw);
      throw new Error(`Server returned non-JSON response (status ${response.status})`);
    }
    data = {};
  }

  if (!response.ok) {
    console.error('Login error response', data);
    throw new Error(data.error || 'Login failed');
  }

  return data;
};

// Gmail-only login/register (no OAuth)
export const gmailLogin = async (email, name = '') => {
  const response = await fetch(`${API_URL}/users/gmail-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      const raw = await response.text();
      console.error('Failed to parse JSON response (gmail login)', raw);
      throw new Error('Server returned invalid JSON');
    }
  } else {
    const raw = await response.text();
    if (raw) {
      console.error('Unexpected non-JSON response (gmail login)', response.status, raw);
      throw new Error(`Server returned non-JSON response (status ${response.status})`);
    }
    data = {};
  }
  if (!response.ok) throw new Error(data.error || 'Gmail login failed');
  return data;
};

// Google OAuth idToken login
export const googleLogin = async (idToken) => {
  const response = await fetch(`${API_URL}/users/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      const raw = await response.text();
      console.error('Failed to parse JSON response (google login)', raw);
      throw new Error('Server returned invalid JSON');
    }
  } else {
    const raw = await response.text();
    if (raw) {
      console.error('Unexpected non-JSON response (google login)', response.status, raw);
      throw new Error(`Server returned non-JSON response (status ${response.status})`);
    }
    data = {};
  }
  if (!response.ok) throw new Error(data.error || 'Google login failed');
  return data;
};

// Get current user
export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      const raw = await response.text();
      console.error('Failed to parse JSON response (getCurrentUser)', raw);
      throw new Error('Server returned invalid JSON');
    }
  } else {
    const raw = await response.text();
    if (raw) {
      console.error('Unexpected non-JSON response (getCurrentUser)', response.status, raw);
      throw new Error(`Server returned non-JSON response (status ${response.status})`);
    }
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch user');
  }

  return data;
};

// Store token
export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Get token
export const getToken = () => {
  return localStorage.getItem('authToken');
};

// Remove token
export const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};
