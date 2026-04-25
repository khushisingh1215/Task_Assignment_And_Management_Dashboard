import React, { useState, useEffect } from 'react';
import { deleteTask } from '../services/api';

const DeleteTaskModal = ({ isOpen, onClose, onTaskDeleted, task, allTasks }) => {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setSelectedTaskId(task.id);
      setSelectedTask(task);
    }
  }, [task]);

  const handleTaskSelect = (e) => {
    const taskId = e.target.value;
    setSelectedTaskId(taskId);
    setConfirmDelete(false);
    
    if (taskId) {
      const selected = allTasks.find(t => t.id === parseInt(taskId));
      setSelectedTask(selected || null);
    } else {
      setSelectedTask(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedTaskId) {
      alert('Please select a task to delete');
      return;
    }

    try {
      await deleteTask(selectedTaskId);
      setSelectedTaskId('');
      setSelectedTask(null);
      setConfirmDelete(false);
      onClose();
      onTaskDeleted();
    } catch (error) {
      alert('Error deleting task');
    }
  };

  if (!isOpen) return null;

  const tasksToShow = allTasks && Array.isArray(allTasks) ? allTasks : [];

  return (
    <div className="modal" onClick={(e) => e.target.className === 'modal' && onClose()}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>🗑️ Delete Task</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="selectTaskToDelete">Select Task to Delete</label>
            <select
              id="selectTaskToDelete"
              value={selectedTaskId}
              onChange={handleTaskSelect}
              className="filter-select"
              required
            >
              <option value="">-- Choose a task --</option>
              {tasksToShow.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {selectedTask && !confirmDelete && (
            <>
              <div className="delete-task-info">
                <h3>Task Details:</h3>
                <p><strong>Title:</strong> {selectedTask.title}</p>
                {selectedTask.description && (
                  <p><strong>Description:</strong> {selectedTask.description}</p>
                )}
                <p><strong>Status:</strong> {selectedTask.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</p>
              </div>
              
              <div className="form-group">
                <div className="field-checkbox">
                  <input
                    type="checkbox"
                    id="confirmDeleteCheckbox"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                  />
                  <label htmlFor="confirmDeleteCheckbox">
                    ⚠️ Yes, I want to permanently delete this task
                  </label>
                </div>
              </div>
            </>
          )}

          {selectedTask && confirmDelete && (
            <div className="delete-warning">
              <p style={{ color: '#ef4444', fontWeight: 'bold' }}>
                ⚠️ This action cannot be undone!
              </p>
            </div>
          )}

          <div className="modal-actions">
            <button 
              type="button"
              className="btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="btn-danger" 
              onClick={handleDelete}
              disabled={!confirmDelete}
            >
              Delete Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteTaskModal;

