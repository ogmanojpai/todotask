
'use client';

import { useState, useEffect } from 'react';
import { scheduleNotification, requestNotificationPermission } from '@/lib/taskSync';

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

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editTask?: Task | null;
  selectedDate: string;
}

export default function AddTaskModal({ isOpen, onClose, onSave, editTask, selectedDate }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [time, setTime] = useState('');
  const [enableNotification, setEnableNotification] = useState(false);
  const [category, setCategory] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description);
      setPriority(editTask.priority);
      setTime(editTask.time);
      setEnableNotification(false);
      setCategory('');
      setEstimatedDuration('');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setTime('');
      setEnableNotification(false);
      setCategory('');
      setEstimatedDuration('');
    }
  }, [editTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: editTask?.completed || false,
      date: editTask?.date || selectedDate,
      time: time || '09:00'
    };

    // Request notification permission if needed
    if (enableNotification && priority === 'high') {
      await requestNotificationPermission();
    }

    onSave(taskData);

    // Schedule notification for high priority tasks
    if (enableNotification && priority === 'high' && !editTask?.completed) {
      const newTask = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      scheduleNotification(newTask);
    }

    onClose();
  };

  const handleQuickFill = (type: 'work' | 'personal' | 'health') => {
    const templates = {
      work: {
        title: 'Complete project milestone',
        description: 'Review and finalize the current project phase deliverables',
        priority: 'high' as const,
        time: '09:00',
        category: 'Work'
      },
      personal: {
        title: 'Personal time',
        description: 'Spend quality time on personal activities and hobbies',
        priority: 'medium' as const,
        time: '18:00',
        category: 'Personal'
      },
      health: {
        title: 'Exercise session',
        description: '30 minutes of physical activity or workout routine',
        priority: 'medium' as const,
        time: '07:00',
        category: 'Health'
      }
    };

    const template = templates[type];
    setTitle(template.title);
    setDescription(template.description);
    setPriority(template.priority);
    setTime(template.time);
    setCategory(template.category);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {editTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <i className="ri-close-line text-gray-500"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Quick Templates */}
          {!editTask && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Templates
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('work')}
                  className="flex-1 p-2 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100 transition-colors"
                >
                  <i className="ri-briefcase-line mr-1"></i>
                  Work
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('personal')}
                  className="flex-1 p-2 bg-green-50 text-green-700 rounded-lg text-xs hover:bg-green-100 transition-colors"
                >
                  <i className="ri-user-line mr-1"></i>
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('health')}
                  className="flex-1 p-2 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 transition-colors"
                >
                  <i className="ri-heart-pulse-line mr-1"></i>
                  Health
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task description"
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Work, Personal"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Select</option>
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hour">1 hour</option>
                <option value="2hours">2 hours</option>
                <option value="halfday">Half day</option>
                <option value="fullday">Full day</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-colors flex items-center justify-center ${
                    priority === level
                      ? level === 'high'
                        ? 'bg-red-500 text-white border-red-500'
                        : level === 'medium'
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-green-500 text-white border-green-500'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <i className={`mr-1 ${
                    level === 'high' ? 'ri-fire-fill' :
                    level === 'medium' ? 'ri-alarm-warning-fill' :
                    'ri-checkbox-circle-fill'
                  }`}></i>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Notification Settings */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Smart Notifications
              </label>
              <div 
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  enableNotification ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => setEnableNotification(!enableNotification)}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    enableNotification ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`}
                ></div>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Get reminded when high-priority tasks are due
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors !rounded-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors !rounded-button"
            >
              {editTask ? 'Update' : 'Add'} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
