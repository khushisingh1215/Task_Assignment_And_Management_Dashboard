import React, { useEffect, useState } from "react";
import { fetchTasks } from "../services/api";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import DeleteTaskModal from "./DeleteTaskModal";
import { TASKS_PER_PAGE } from '../config';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // For accurate stats
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const tasksPerPage = TASKS_PER_PAGE;

  const loadFilteredTasks = async (page = 1) => {
    try {
      setLoading(true);
      const filteredTasks = await fetchTasks({
        limit: tasksPerPage,
        page: page,
        search: search,
        status: statusFilter
      });
      setTasks(filteredTasks.tasks || []);
      setTotalTasks(filteredTasks.totalTasks || 0);
      setTotalPages(filteredTasks.totalPages || 1);
      setCurrentPage(filteredTasks.currentPage || 1);
    } catch (err) {
      console.error("Filtered tasks load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // fetch a large batch for statistics (not paginated in UI)
  const loadAllTasksForStats = async () => {
    try {
      // using an explicit high limit rather than TASKS_PER_PAGE so stats cover
      // all records; adjust if your dataset grows beyond this number.
      const allTasksData = await fetchTasks({ limit: 10000 });
      setAllTasks(allTasksData.tasks || allTasksData);
    } catch (err) {
      console.error("All tasks load error:", err);
    }
  };

  const handleTaskUpdate = async () => {
    await Promise.all([
      loadFilteredTasks(currentPage),
      loadAllTasksForStats()
    ]);
  };

  useEffect(() => {
    loadAllTasksForStats(); // Load stats once on mount
  }, []);

  useEffect(() => {
    loadFilteredTasks(); // Load filtered tasks when filters change
  }, [search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    loadFilteredTasks(1);
  }, [search, statusFilter]);

  // Client-side date filtering (date only, ignoring time)
  const filterTasksByDate = (tasksArray) => {
    if (!dateFilter) return tasksArray;
    
    const filterDate = new Date(dateFilter);
    const filterDateStr = filterDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return tasksArray.filter(task => {
      if (!task.created_at) return false;
      const taskDate = new Date(task.created_at);
      const taskDateStr = taskDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      return taskDateStr === filterDateStr;
    });
  };

  // Apply date filter to tasks
  const filteredTasks = filterTasksByDate(Array.isArray(tasks) ? tasks : []);

  const pending = Array.isArray(allTasks) ? allTasks.filter(t => t.status === "pending").length : 0;
  const completed = Array.isArray(allTasks) ? allTasks.filter(t => t.status === "completed").length : 0;

  const handleEditClick = () => {
    if (selectedTask) {
      setIsEditModalOpen(true);
    } else {
      alert("Please select a task from the list to edit.");
    }
  };

  const handleDeleteClick = () => {
    if (selectedTask) {
      setIsDeleteModalOpen(true);
    } else {
      alert("Please select a task from the list to delete.");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <h2>📊 Dashboard</h2>
        <div className="header-buttons">
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            ➕ Add Task
          </button>
          <button className="btn-edit" onClick={handleEditClick}>
            ✏️ Edit Task
          </button>
          <button className="btn-delete" onClick={handleDeleteClick}>
            🗑️ Delete Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">📋 Total <span>{allTasks.length}</span></div>
        <div className="stat-card">⏳ Pending <span>{pending}</span></div>
        <div className="stat-card">✅ Completed <span>{completed}</span></div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-filter">Date:</label>
            <input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            />
          </div>

          <div className="filter-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setDateFilter("");
              }}
              disabled={!search && !statusFilter && !dateFilter}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading && <div className="loading-indicator">Loading tasks...</div>}
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tasks */}
      <h3 className="section-title">📌 Tasks</h3>
      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <p className="empty-state">No tasks found</p>
        ) : (
          filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdate={handleTaskUpdate}
              isSelected={selectedTask?.id === task.id}
              onSelect={() => setSelectedTask(task)}
            />
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
              loadFilteredTasks(newPage);
            }}
            disabled={currentPage === 1 || loading}
          >
            ‹ Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalTasks} total tasks)
          </span>
          
          <button 
            className="pagination-btn"
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              loadFilteredTasks(newPage);
            }}
            disabled={currentPage === totalPages || loading}
          >
            Next ›
          </button>
        </div>
      )}

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTaskAdded={handleTaskUpdate}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onTaskUpdated={handleTaskUpdate}
        task={selectedTask}
        allTasks={allTasks}
      />

      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onTaskDeleted={handleTaskUpdate}
        task={selectedTask}
        allTasks={allTasks}
      />
    </>
  );
};

export default Dashboard;
