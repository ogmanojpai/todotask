
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

// Simulated real-time sync system
let listeners: ((tasks: Task[]) => void)[] = [];
let isInitialized = false;

// Initialize broadcast channel for cross-tab communication
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined') {
  broadcastChannel = new BroadcastChannel('todo-tasks');
}

// Sync tasks to simulated cloud storage
export const syncTasks = async (tasks: Task[]) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Store in sessionStorage to simulate cloud sync
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cloudTasks', JSON.stringify({
        tasks,
        lastSync: Date.now(),
        deviceId: getDeviceId()
      }));
    }
    
    return true;
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
};

// Get device ID for conflict resolution
const getDeviceId = () => {
  if (typeof window === 'undefined') return 'server';
  
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Subscribe to real-time task changes
export const subscribeToChanges = (callback: (tasks: Task[]) => void) => {
  listeners.push(callback);
  
  // Listen for cross-tab changes
  if (broadcastChannel) {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TASKS_UPDATED') {
        callback(event.data.tasks);
      }
    };
    
    broadcastChannel.addEventListener('message', handleMessage);
    
    return () => {
      listeners = listeners.filter(l => l !== callback);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleMessage);
      }
    };
  }
  
  // Simulate periodic sync check (in real app, this would be WebSocket/SSE)
  if (!isInitialized) {
    isInitialized = true;
    startSyncPolling();
  }
  
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

// Broadcast changes to other tabs/windows
export const broadcastChange = (tasks: Task[]) => {
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'TASKS_UPDATED',
      tasks,
      timestamp: Date.now(),
      deviceId: getDeviceId()
    });
  }
};

// Simulate periodic sync polling (replace with WebSocket in production)
const startSyncPolling = () => {
  setInterval(async () => {
    try {
      const cloudData = sessionStorage.getItem('cloudTasks');
      if (cloudData) {
        const { tasks, lastSync, deviceId } = JSON.parse(cloudData);
        
        // Only update if this isn't from the current device
        if (deviceId !== getDeviceId()) {
          const localData = localStorage.getItem('todoTasks');
          const localTasks = localData ? JSON.parse(localData) : [];
          
          // Simple conflict resolution: merge by updatedAt timestamp
          const mergedTasks = mergeTasks(localTasks, tasks);
          
          // Notify all listeners
          listeners.forEach(callback => callback(mergedTasks));
        }
      }
    } catch (error) {
      console.error('Sync polling error:', error);
    }
  }, 5000); // Check every 5 seconds
};

// Merge tasks from different sources
const mergeTasks = (localTasks: Task[], cloudTasks: Task[]) => {
  const taskMap = new Map<string, Task>();
  
  // Add all local tasks
  localTasks.forEach(task => {
    taskMap.set(task.id, task);
  });
  
  // Merge with cloud tasks, keeping the most recent version
  cloudTasks.forEach(cloudTask => {
    const localTask = taskMap.get(cloudTask.id);
    if (!localTask || cloudTask.updatedAt > localTask.updatedAt) {
      taskMap.set(cloudTask.id, cloudTask);
    }
  });
  
  return Array.from(taskMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
};

// Push notification simulation
export const scheduleNotification = (task: Task) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const taskTime = new Date(`${task.date}T${task.time}`);
    const now = new Date();
    const timeDiff = taskTime.getTime() - now.getTime();
    
    if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) { // Within 24 hours
      setTimeout(() => {
        new Notification(`Task Reminder: ${task.title}`, {
          body: task.description || 'Don\'t forget about this task!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: task.id,
          requireInteraction: true
        });
      }, timeDiff);
    }
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};
