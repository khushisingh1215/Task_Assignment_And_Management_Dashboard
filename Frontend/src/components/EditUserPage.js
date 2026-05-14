import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserById, editUser } from '../services/api';
import '../styles/userManagement.css';

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await fetchUserById(id);
        const user = response.user || response;
        setUserData(user);
        setFormData({ name: user.name || '', email: user.email || '', role: user.role || 'user' });
      } catch (err) {
        setError('Could not load user details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.role) {
        setError('Please fill in all fields.');
        return;
      }

      await editUser(id, formData.name, formData.email, formData.role);
      setSuccess('User updated successfully.');
      setError('');
      setTimeout(() => {
        navigate('/users');
      }, 1200);
    } catch (err) {
      setError('Failed to update user: ' + err.message);
      setSuccess('');
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div className="user-management-container">
      <h2>✏️ Edit User</h2>
      {loading && <p>Loading user data...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!loading && userData && (
        <div className="user-form-card">
          <h3>Edit user details</h3>
          <form onSubmit={handleSubmit}>
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
              <button type="submit" className="btn-primary">Save Changes</button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {!loading && !userData && !error && (
        <p>User not found. Go back to the user list.</p>
      )}
    </div>
  );
};

export default EditUserPage;
