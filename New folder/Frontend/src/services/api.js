// Production backend URL for Render deployment
const API_URL = 'https://task-assignment-and-management-dashboard.onrender.com/api';

// Get authorization header with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Fetch tasks with optional search, pagination & status
 */
export const fetchTasks = async ({
  search = '',
  page = 1,
  limit = 10,
  status = ''
} = {}) => {

  const params = new URLSearchParams();

  if (search) params.append('search', search);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (status) params.append('status', status);

  const response = await fetch(`${API_URL}/tasks?${params.toString()}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    console.error('fetchTasks response not ok', response.status);
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
};

// Pending tasks (still useful for other pages)
export const fetchPendingTasks = async (page = 1, limit = 10) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);

  const response = await fetch(`${API_URL}/tasks/pending?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    console.error('fetchPendingTasks status', response.status);
    throw new Error('Failed to fetch pending tasks');
  }
  const data = await response.json();
  return data.tasks || data; // Handle both paginated and non-paginated responses
};

// Completed tasks
export const fetchCompletedTasks = async (page = 1, limit = 10) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);

  const response = await fetch(`${API_URL}/tasks/completed?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    console.error('fetchCompletedTasks status', response.status);
    throw new Error('Failed to fetch completed tasks');
  }
  const data = await response.json();
  return data.tasks || data; // Handle both paginated and non-paginated responses
};

// Recent tasks
export const fetchRecentTasks = async () => {
  const response = await fetch(`${API_URL}/tasks/recent`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    console.error('fetchRecentTasks status', response.status);
    throw new Error('Failed to fetch recent tasks');
  }
  const data = await response.json();
  return data.tasks || data;
};

// Create task
export const createTask = async (title, description, assigned_user_id = null) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, description, assigned_user_id }),
  });

  if (!response.ok) {
    console.error('createTask error', response.status);
    throw new Error('Failed to create task');
  }
  return response.json();
};

// Update task
export const updateTask = async (id, title, description, status, assigned_user_id = null) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, description, status, assigned_user_id }),
  });

  if (!response.ok) {
    console.error('updateTask error', response.status);
    throw new Error('Failed to update task');
  }
  return response.json();
};

// Delete task
export const deleteTask = async (id) => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    console.error('deleteTask error', response.status);
    throw new Error('Failed to delete task');
  }
  return response.json();
};

// USER MANAGEMENT FUNCTIONS

// Get all users
export const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    console.error('fetchUsers error', response.status);
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

// Get a single user by ID
export const fetchUserById = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    console.error('fetchUserById error', response.status);
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

// Add user
export const addUser = async (name, email, password, role) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!response.ok) {
    console.error('addUser error', response.status);
    throw new Error('Failed to add user');
  }
  return response.json();
};

// Edit user
export const editUser = async (id, name, email, role) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, email, role }),
  });

  if (!response.ok) {
    console.error('editUser error', response.status);
    throw new Error('Failed to edit user');
  }
  return response.json();
};

// Delete user
export const deleteUser = async (id) => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    console.error('deleteUser error', response.status);
    throw new Error('Failed to delete user');
  }
  return response.json();
};
