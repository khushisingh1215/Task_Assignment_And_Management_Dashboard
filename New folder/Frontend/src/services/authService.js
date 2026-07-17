import { jwtDecode } from 'jwt-decode';

// Production backend URL for Render deployment
const API_URL = 'https://task-assignment-and-management-dashboard.onrender.com/api';
const USER_STORAGE_KEY = 'authUser';

const persistUser = (user) => {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    return null;
  }
};

export const getUserRole = () => {
  const storedUser = getStoredUser();
  if (storedUser?.role) return storedUser.role;

  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded?.role || null;
  } catch (error) {
    console.error('Failed to decode token for role:', error);
    return null;
  }
};

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

  setToken(data.token, data.user);
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

  setToken(data.token, data.user);
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

// Store token and user
export const setToken = (token, user = null) => {
  localStorage.setItem('authToken', token);
  persistUser(user);
};

// Get token
export const getToken = () => {
  return localStorage.getItem('authToken');
};

// Remove token
export const removeToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem(USER_STORAGE_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};
