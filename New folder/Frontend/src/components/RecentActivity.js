import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchRecentTasks } from '../services/api';
import TaskCard from './TaskCard';

const RecentActivity = () => {
  const [tasks, setTasks] = useState([]);
  const location = useLocation();

  const loadTasks = async () => {
    try {
      const data = await fetchRecentTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [location]);

  return (
    <>
      <div className="page-header">
        <h2>🕐 Recent Activity</h2>
      </div>

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No recent activity</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} onUpdate={loadTasks} />
          ))
        )}
      </div>
    </>
  );
};

export default RecentActivity;

