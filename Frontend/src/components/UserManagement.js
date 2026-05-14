import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, addUser, deleteUser } from '../services/api';
import '../styles/userManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const navigate = useNavigate();

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchUsers();
      setUsers(response.users || []);
      setError('');
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Name, email, and password are required');
        return;
      }

      await addUser(formData.name, formData.email, formData.password, formData.role);
      setSuccess('User added successfully!');
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setShowAddForm(false);
      await loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add user: ' + err.message);
    }
  };

  const handleEditStart = (user) => {
    navigate(`/users/edit/${user.id}`);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      setSuccess('User deleted successfully!');
      setDeleteTarget(null);
      await loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete user: ' + err.message);
    }
  };

  const handleDeleteRequest = (user) => {
    setDeleteTarget({ id: user.id, name: user.name });
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({ name: '', email: '', password: '', role: 'user' });
    setError('');
  };

  return (
    <div className="user-management-container">
      <h2>👥 User Management</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="user-form-card">
          <h3>Add New User</h3>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter user name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter user email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role:</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add User
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Button */}
      {!showAddForm && (
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          ➕ Add New User
        </button>
      )}

      {/* Users Table */}
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditStart(user)}
                      title="Edit user"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteRequest(user)}
                      title="Delete user"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>?</p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-delete" onClick={handleDeleteUser}>Delete</button>
              <button className="btn-secondary" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
