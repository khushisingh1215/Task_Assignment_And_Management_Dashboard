import React, { useState, useEffect } from 'react';
import { createTask, fetchUsers } from '../services/api';

const AddTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetchUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(title, description, assignedUserId ? parseInt(assignedUserId) : null);
      setTitle('');
      setDescription('');
      setAssignedUserId('');
      onClose();
      onTaskAdded();
    } catch (error) {
      alert('Error adding task');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={(e) => e.target.className === 'modal' && onClose()}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taskTitle">Title</label>
            <input
              type="text"
              id="taskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="taskDescription">Description</label>
            <textarea
              id="taskDescription"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="assignedUser">Assign To User (Optional)</label>
            <select
              id="assignedUser"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              disabled={loadingUsers}
            >
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">Add Task</button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;

