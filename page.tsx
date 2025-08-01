'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TaskCard from '@/components/TaskCard';
import AddTaskModal from '@/components/AddTaskModal';
import DateSelector from '@/components/DateSelector';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  date: string;
  time: string;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('time', { ascending: true });
    if (!error) setTasks(data || []);
  };

  // Real-time sync
  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, []);

  const handleAddTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    await supabase.from('tasks').insert({
      ...task,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsModalOpen(false);
  };

  const handleUpdateTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingTask) return;
    await supabase
      .from('tasks')
      .update({
        ...task,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingTask.id);
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await supabase.from('tasks').update({
      completed: !task.completed,
      updated_at: new Date().toISOString()
    }).eq('id', id);
  };

  const filteredTasks = tasks
    .filter(task => task.date === selectedDate)
    .filter(task => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || a.time.localeCompare(b.time);
    });

  const todayStats = {
    total: tasks.filter(t => t.date === selectedDate).length,
    done: tasks.filter(t => t.date === selectedDate && t.completed).length,
    high: tasks.filter(t => t.date === selectedDate && t.priority === 'high' && !t.completed).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-sm text-gray-600">
              {new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600">
            <i className="ri-add-line text-xl"></i>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-20">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl text-center shadow-sm border">
            <p className="text-2xl font-bold">{todayStats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="bg-white p-4 rounded-2xl text-center shadow-sm border">
            <p className="text-2xl font-bold">{todayStats.done}</p>
            <p className="text-xs text-gray-600">Done</p>
          </div>
          <div className="bg-white p-4 rounded-2xl text-center shadow-sm border">
            <p className="text-2xl font-bold">{todayStats.high}</p>
            <p className="text-xs text-gray-600">Priority</p>
          </div>
        </div>

        <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        <div className="flex bg-white rounded-2xl p-1 shadow-sm border mb-4">
          {['all', 'pending', 'completed'].map(k => (
            <button
              key={k}
              onClick={() => setFilter(k as any)}
              className={`flex-1 px-2 py-1 rounded-full text-sm transition-colors ${
                filter === k ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }}
                onDelete={handleDeleteTask}
                onToggle={handleToggleTask}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                Add Task
              </button>
            </div>
          )}
        </div>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={editingTask ? handleUpdateTask : handleAddTask}
        editTask={editingTask}
        selectedDate={selectedDate}
      />
    </div>
  );
}
