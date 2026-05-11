import React, { useState, useEffect } from 'react';
import { fetchTasks } from '../services/api';

const ProgressBar = () => {
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks({ limit: 10000 }); // Get all tasks for progress calculation
      const taskList = data.tasks || data; // Handle both response formats
      setTasks(taskList);
      calculateProgress(taskList);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const calculateProgress = (taskList) => {
    if (!Array.isArray(taskList) || taskList.length === 0) {
      setProgress(0);
      return;
    }
    const completed = taskList.filter(t => t.status === 'completed').length;
    const percentage = Math.round((completed / taskList.length) * 100);
    setProgress(percentage);
  };

  const totalTasks = Array.isArray(tasks) ? tasks.length : 0;
  const completedTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'completed').length : 0;
  const pendingTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'pending').length : 0;

  return (
    <div className="progress-sidebar">
      <div className="progress-header">
        <h3>📊 Progress</h3>
      </div>
      
      <div className="progress-container">
        <div className="progress-circle">
          <svg className="progress-ring" width="120" height="120">
            <circle
              className="progress-ring-background"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="8"
            />
            <circle
              className="progress-ring-fill"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
          <div className="progress-percentage">
            <span className="progress-number">{progress}%</span>
            <span className="progress-label">Complete</span>
          </div>
        </div>
      </div>

      <div className="progress-stats">
        <div className="progress-stat-item">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        
        <div className="progress-stat-item">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value completed">{completedTasks}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        
        <div className="progress-stat-item">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value pending">{pendingTasks}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>

      <div className="progress-bar-linear">
        <div className="progress-bar-label">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

