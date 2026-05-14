import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchPendingTasks } from '../services/api';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import { TASKS_PER_PAGE } from '../config';

const PendingTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const tasksPerPage = TASKS_PER_PAGE;

  const loadTasks = async (page = 1) => {
    try {
      setLoading(true);
      const data = await fetchPendingTasks(page, tasksPerPage);
      if (data && typeof data === 'object' && 'tasks' in data) {
        // Paginated response
        setTasks(data.tasks || []);
        setTotalTasks(data.totalTasks || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      } else {
        // Fallback for non-paginated response
        setTasks(Array.isArray(data) ? data : []);
        setTotalTasks(Array.isArray(data) ? data.length : 0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [location]);

  return (
    <>
      <div className="page-header">
        <h2>⏳ Pending Tasks</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          ➕ Add New Task
        </button>
      </div>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No pending tasks</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onUpdate={() => loadTasks(currentPage)} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => {
              const newPage = currentPage - 1;
              setCurrentPage(newPage);
              loadTasks(newPage);
            }}
            disabled={currentPage === 1 || loading}
          >
            ‹ Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalTasks} total pending tasks)
          </span>
          
          <button 
            className="pagination-btn"
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              loadTasks(newPage);
            }}
            disabled={currentPage === totalPages || loading}
          >
            Next ›
          </button>
        </div>
      )}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskAdded={loadTasks}
      />
    </>
  );
};

export default PendingTasks;

