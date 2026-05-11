import React, { useEffect, useState } from 'react';
import { updateTask, fetchUsers } from '../services/api';

const TaskCard = ({ task, onUpdate, isSelected, onSelect }) => {
  const [assignedUserName, setAssignedUserName] = useState('');
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(task.assigned_user_id || '');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Find the assigned user's name
    if (task.assigned_user_id && users.length > 0) {
      const user = users.find(u => u.id === task.assigned_user_id);
      if (user) {
        setAssignedUserName(user.name);
      }
    }
  }, [task.assigned_user_id, users]);

  const loadUsers = async () => {
    try {
      const response = await fetchUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMarkComplete = async () => {
    try {
      await updateTask(task.id, task.title, task.description, 'completed', task.assigned_user_id);
      onUpdate();
    } catch (error) {
      alert('Error updating task');
    }
  };

  const handleMarkPending = async () => {
    try {
      await updateTask(task.id, task.title, task.description, 'pending', task.assigned_user_id);
      onUpdate();
    } catch (error) {
      alert('Error updating task');
    }
  };

  const handleAssignUser = async () => {
    try {
      await updateTask(task.id, task.title, task.description, task.status, selectedUserId || null);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      alert('Error updating task assignment');
    }
  };

  return (
    <div 
      className={`task-card ${task.status === 'completed' ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect && onSelect()}
      style={{ cursor: 'pointer' }}
    >
      <div className="task-header">
        <div>
          <div className="task-title">
            {task.status === 'completed' && <span style={{ marginRight: '8px' }}>✓</span>}
            {task.title}
          </div>
          <div className="task-subtitle">
            {task.description ? task.description : 'No additional task details provided.'}
          </div>
        </div>

        <div className={`task-badge ${task.status}`}>{task.status === 'completed' ? 'Completed' : 'Pending'}</div>
      </div>

      {/* Assigned User Display */}
      <div className="task-assigned-user">
        {isEditing ? (
          <div className="edit-assignment">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button 
              className="btn btn-sm btn-success"
              onClick={(e) => {
                e.stopPropagation();
                handleAssignUser();
              }}
            >
              Save
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div 
            className="user-info"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            👤 {assignedUserName ? `Assigned to: ${assignedUserName}` : 'Unassigned'}
            <span className="edit-hint"> (click to change)</span>
          </div>
        )}
      </div>

      <div className="task-meta">
        <span>📅 Created: {formatDate(task.created_at)}</span>
        {task.completed_at && <span>✅ Completed: {formatDate(task.completed_at)}</span>}
        <span>
          {task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
        </span>
      </div>
      <div className="task-actions">
        {task.status === 'pending' ? (
          <button className="btn btn-complete" onClick={handleMarkComplete}>
            ✓ Mark Complete
          </button>
        ) : (
          <button className="btn btn-pending" onClick={handleMarkPending}>
            ↻ Mark Pending
          </button>
        )}
      </div>
    </div>  );
};

export default TaskCard;