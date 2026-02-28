import React, { useState } from 'react';
import { TeamsIntegrationPanel } from './TeamsIntegrationPanel';
import '../styles/dashboard.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  project: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  team: string;
  tasks: number;
}

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'projects' | 'teams'>('overview');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Website Redesign',
      description: 'Update homepage and product pages',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Sarah Chen',
      dueDate: '2026-03-10',
      project: 'Marketing Campaign'
    },
    {
      id: '2',
      title: 'API Integration',
      description: 'Connect payment gateway',
      status: 'todo',
      priority: 'high',
      assignee: 'Mike Johnson',
      dueDate: '2026-03-05',
      project: 'Backend Development'
    },
    {
      id: '3',
      title: 'Design Review',
      description: 'Review UI mockups with team',
      status: 'done',
      priority: 'medium',
      assignee: 'John Developer',
      dueDate: '2026-02-25',
      project: 'Marketing Campaign'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Marketing Campaign',
      description: 'Q1 Marketing Initiative',
      progress: 65,
      team: 'Marketing',
      tasks: 12
    },
    {
      id: '2',
      name: 'Backend Development',
      description: 'API v2.0 Development',
      progress: 45,
      team: 'Engineering',
      tasks: 18
    },
    {
      id: '3',
      name: 'Mobile App',
      description: 'iOS/Android Release',
      progress: 30,
      team: 'Product',
      tasks: 24
    }
  ]);

  const [newTask, setNewTask] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<string>('');

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#D13438';
      case 'medium': return '#FFB900';
      case 'low': return '#107C10';
      default: return '#0078D4';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'done': return '#107C10';
      case 'in-progress': return '#0078D4';
      case 'todo': return '#605E5C';
      default: return '#605E5C';
    }
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        description: 'New task',
        status: 'todo',
        priority: 'medium',
        assignee: 'John Developer',
        dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
        project: selectedProjectForTask || 'General'
      };
      setTasks([...tasks, task]);
      if (selectedProjectForTask) {
        setProjects(projects.map(p => p.name === selectedProjectForTask ? {...p, tasks: p.tasks + 1} : p));
        setSelectedProjectForTask('');
      }
      setNewTask('');
      setShowTaskForm(false);
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    setTasks(tasks.map(t => t.id === taskId ? {...t, status: newStatus} : t));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Productivity Dashboard</h2>
          <p>Manage your projects, tasks, and team collaboration</p>
        </div>
        <button className="create-btn" onClick={() => setShowTaskForm(!showTaskForm)}>
          + New Task
        </button>
      </div>

      {showTaskForm && (
        <div className="task-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <select
              value={selectedProjectForTask}
              onChange={(e) => setSelectedProjectForTask(e.target.value)}
            >
              <option value="">No project (General)</option>
              {projects.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            <button onClick={handleAddTask} className="form-submit">Create</button>
            <button onClick={() => setShowTaskForm(false)} className="form-cancel">Cancel</button>
          </div>
        </div>
      )}

      {/* Project creation form (UI-only, no backend) */}
      {activeTab === 'projects' && (
        <div style={{margin: '12px 0'}}>
          <button className="create-btn small" onClick={() => setShowProjectForm(!showProjectForm)}>
            + New Project
          </button>
          {showProjectForm && (
            <div className="task-form" style={{marginTop: 8}}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Short description..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
                <button
                  onClick={() => {
                    if (!newProjectName.trim()) return;
                    const proj = {
                      id: Date.now().toString(),
                      name: newProjectName,
                      description: newProjectDesc || 'No description',
                      progress: 0,
                      team: 'Unassigned',
                      tasks: 0
                    } as Project;
                    setProjects([proj, ...projects]);
                    setNewProjectName('');
                    setNewProjectDesc('');
                    setShowProjectForm(false);
                  }}
                  className="form-submit">
                  Create Project
                </button>
                <button onClick={() => setShowProjectForm(false)} className="form-cancel">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button 
          className={`tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams Integration
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            {/* Stats */}
            <div className="card stats-card">
              <div className="stat-item">
                <div className="stat-value">{tasks.filter(t => t.status === 'todo').length}</div>
                <div className="stat-label">To Do</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{tasks.filter(t => t.status === 'in-progress').length}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{tasks.filter(t => t.status === 'done').length}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{projects.length}</div>
                <div className="stat-label">Projects</div>
              </div>
            </div>

            {/* My Tasks */}
            <div className="card tasks-card">
              <h3>My Active Tasks</h3>
              <div className="task-list">
                {tasks.filter(t => t.status !== 'done').slice(0, 4).map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-left">
                      <div className="priority-dot" style={{backgroundColor: getPriorityColor(task.priority)}}></div>
                      <div>
                        <p className="task-title">{task.title}</p>
                        <p className="task-meta">{task.project} • {task.assignee}</p>
                      </div>
                    </div>
                    <select 
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                      className="status-select"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Progress */}
            <div className="card projects-card">
              <h3>Project Progress</h3>
              <div className="projects-list">
                {projects.map(proj => (
                  <div key={proj.id} className="project-item">
                    <div className="project-info">
                      <p className="project-name">{proj.name}</p>
                      <p className="project-meta">Team: {proj.team} • {proj.tasks} tasks</p>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${proj.progress}%`}}></div>
                    </div>
                    <p className="progress-text">{proj.progress}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teams Integration - Quick Actions */}
            <div className="card teams-integration-card">
              <h3>🔗 Teams Integration</h3>
              <div className="integration-actions">
                <button className="integration-btn">
                  <span className="icon">📱</span>
                  <span>Schedule Teams Meeting</span>
                </button>
                <button className="integration-btn">
                  <span className="icon">💬</span>
                  <span>Send to Teams Channel</span>
                </button>
                <button className="integration-btn">
                  <span className="icon">👥</span>
                  <span>Start Chat with User</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-view">
            <div className="card">
              <h3>All Tasks</h3>
              <div className="task-columns">
                <div className="column">
                  <h4 style={{color: '#605E5C'}}>To Do</h4>
                  {tasks.filter(t => t.status === 'todo').map(task => (
                    <div key={task.id} className="task-card">
                      <p className="task-title">{task.title}</p>
                      <p className="task-desc">{task.description}</p>
                      <div className="task-footer">
                        <span className="task-assignee">{task.assignee}</span>
                        <span style={{color: getPriorityColor(task.priority), fontWeight: 600}}>{task.priority}</span>
                      </div>
                      <button onClick={() => updateTaskStatus(task.id, 'in-progress')} className="move-btn">Start</button>
                    </div>
                  ))}
                </div>
                <div className="column">
                  <h4 style={{color: '#0078D4'}}>In Progress</h4>
                  {tasks.filter(t => t.status === 'in-progress').map(task => (
                    <div key={task.id} className="task-card">
                      <p className="task-title">{task.title}</p>
                      <p className="task-desc">{task.description}</p>
                      <div className="task-footer">
                        <span className="task-assignee">{task.assignee}</span>
                        <span style={{color: getPriorityColor(task.priority), fontWeight: 600}}>{task.priority}</span>
                      </div>
                      <button onClick={() => updateTaskStatus(task.id, 'done')} className="move-btn">Complete</button>
                    </div>
                  ))}
                </div>
                <div className="column">
                  <h4 style={{color: '#107C10'}}>Done</h4>
                  {tasks.filter(t => t.status === 'done').map(task => (
                    <div key={task.id} className="task-card completed">
                      <p className="task-title">{task.title}</p>
                      <p className="task-desc">{task.description}</p>
                      <div className="task-footer">
                        <span className="task-assignee">{task.assignee}</span>
                        <span style={{color: getPriorityColor(task.priority), fontWeight: 600}}>{task.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-view">
            <div className="card">
              <h3>Projects</h3>
              <div className="projects-grid">
                {projects.map(proj => (
                  <div key={proj.id} className="project-card">
                    <h4>{proj.name}</h4>
                    <p className="project-desc">{proj.description}</p>
                    <div className="project-stats">
                      <span>Team: {proj.team}</span>
                      <span>{proj.tasks} Tasks</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${proj.progress}%`}}></div>
                    </div>
                    <div className="progress-label">{proj.progress}% Complete</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="teams-view">
            <TeamsIntegrationPanel />
          </div>
        )}
      </div>
    </div>
  );
};
