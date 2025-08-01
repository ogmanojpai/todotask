
'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  date: string;
  time: string;
  createdAt: number;
  updatedAt: number;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      default: return 'bg-green-100 text-green-600 border-green-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'ri-fire-fill';
      case 'medium': return 'ri-alarm-warning-fill';
      default: return 'ri-checkbox-circle-fill';
    }
  };

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onToggle(task.id);
      setIsAnimating(false);
    }, 150);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      setShowActions(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all duration-300 ${
      task.completed ? 'opacity-60 scale-[0.98]' : 'hover:shadow-md'
    } ${isAnimating ? 'scale-95' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={handleToggle}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-all duration-200 ${
              task.completed 
                ? 'bg-blue-500 border-blue-500 scale-110' 
                : 'border-gray-300 hover:border-blue-400 hover:scale-110'
            }`}
          >
            {task.completed && (
              <i className="ri-check-line text-white text-xs"></i>
            )}
          </button>
          
          <div className="flex-1">
            <h3 className={`font-medium text-gray-900 mb-1 transition-all duration-200 ${
              task.completed ? 'line-through opacity-60' : ''
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm text-gray-600 mb-2 transition-all duration-200 ${
                task.completed ? 'line-through opacity-60' : ''
              }`}>
                {task.description}
              </p>
            )}
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                <i className={`${getPriorityIcon(task.priority)} mr-1`}></i>
                {task.priority}
              </span>
              <span className="text-xs text-gray-500 flex items-center">
                <i className="ri-time-line mr-1"></i>
                {task.time}
              </span>
              <span className="text-xs text-gray-400" suppressHydrationWarning={true}>
                {formatTimeAgo(task.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowActions(!showActions)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <i className="ri-more-2-fill"></i>
        </button>
      </div>

      {showActions && (
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 animate-fadeIn">
          <button
            onClick={() => {
              onEdit(task);
              setShowActions(false);
            }}
            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center transition-colors"
          >
            <i className="ri-edit-line mr-1"></i>
            Edit
          </button>
          <button
            onClick={() => {
              navigator.share({
                title: task.title,
                text: task.description || 'Check out this task',
                url: window.location.href
              }).catch(() => {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(`${task.title}\n${task.description || ''}\nDue: ${task.date} at ${task.time}`);
              });
              setShowActions(false);
            }}
            className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center transition-colors"
          >
            <i className="ri-share-line mr-1"></i>
            Share
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center transition-colors"
          >
            <i className="ri-delete-bin-line mr-1"></i>
            Delete
          </button>
        </div>
      )}

      {task.priority === 'high' && !task.completed && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100 animate-pulse">
          <div className="flex items-center text-red-600 text-sm">
            <i className="ri-notification-2-fill mr-2"></i>
            Important reminder: This task needs your attention!
          </div>
        </div>
      )}

      {/* Progress indicator for overdue tasks */}
      {(() => {
        const taskDateTime = new Date(`${task.date}T${task.time}`);
        const now = new Date();
        const isOverdue = taskDateTime < now && !task.completed;
        
        return isOverdue && (
          <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center text-orange-600 text-sm">
              <i className="ri-time-line mr-2"></i>
              This task is overdue
            </div>
          </div>
        );
      })()}
    </div>
  );
}
