import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';

// Modular Tasks Components
import TaskSummary from '../components/tasks/TaskSummary';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskTable from '../components/tasks/TaskTable';
import TaskKanban from '../components/tasks/TaskKanban';
import TaskTimeline from '../components/tasks/TaskTimeline';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetails from '../components/tasks/TaskDetails';
import MilestoneSection from '../components/tasks/MilestoneSection';
import MilestoneForm from '../components/tasks/MilestoneForm';

/**
 * Tasks & Milestones Module
 * Operational construction project management workspace:
 * - Workflow: To Do -> In Progress -> Review -> Completed; In Progress / Review -> Blocked
 * - Compact operational summary
 * - Unified multi-criteria filters
 * - Views: High-density List, 5-column Kanban, Timeline / Gantt
 * - Critical Path Milestone Gateways
 * - Modal workflows for Create/Edit Task, Details, and Archive confirmation
 */
export default function Tasks() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Core Data States
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // View State: 'list' | 'kanban' | 'timeline'
  const [viewMode, setViewMode] = useState('list');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || 'All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [dueDateFilter, setDueDateFilter] = useState('All');

  // Modals & Drawers States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null for create, object for edit

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null); // { type: 'task'|'milestone', item: object }

  // Load Initial Workspace Data
  const loadData = async () => {
    try {
      const [tRes, mRes, pRes] = await Promise.all([
        api.getTasks({ includeArchived: false }),
        api.getMilestones(),
        api.getProjects()
      ]);
      if (tRes.success) setTasks(tRes.data);
      if (mRes.success) setMilestones(mRes.data);
      if (pRes.success) setProjects(pRes.data);
    } catch {
      showToast('Failed to load tasks and milestones schedule.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync URL project query param
  useEffect(() => {
    const urlProject = searchParams.get('project');
    if (urlProject && urlProject !== projectFilter) {
      setProjectFilter(urlProject);
    }
  }, [searchParams]);

  // Today's ISO Date String
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Distinct Assignees for Filter Dropdown
  const distinctAssignees = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => {
      if (t.assignee) set.add(t.assignee);
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Operational KPI Statistics
  const kpiStats = useMemo(() => {
    const total = tasks.length;
    const toDo = tasks.filter((t) => t.status === 'To Do' || t.status === 'Not Started').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const review = tasks.filter((t) => t.status === 'Review').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const overdue = tasks.filter(
      (t) => t.isOverdue || (t.dueDate && t.dueDate < todayStr && t.status !== 'Completed')
    ).length;
    const blocked = tasks.filter((t) => t.status === 'Blocked').length;
    return { total, toDo, inProgress, review, completed, overdue, blocked };
  }, [tasks, todayStr]);

  // Filtered Milestones (filtered by project context)
  const filteredMilestones = useMemo(() => {
    if (projectFilter === 'All') return milestones;
    return milestones.filter((m) => m.projectId === projectFilter || m.project === projectFilter);
  }, [milestones, projectFilter]);

  const upcomingMilestonesCount = useMemo(() => {
    return filteredMilestones.filter((m) => m.status === 'Upcoming' || m.status === 'In Progress').length;
  }, [filteredMilestones]);

  // Filtered Tasks List
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchProj = t.project?.toLowerCase().includes(q);
        const matchAssignee = t.assignee?.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchProj && !matchAssignee && !matchDesc) return false;
      }

      // 2. Project Filter
      if (projectFilter !== 'All') {
        if (t.projectId !== projectFilter && t.project !== projectFilter) return false;
      }

      // 3. Status Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Overdue') {
          const isOverdue = t.isOverdue || (t.dueDate && t.dueDate < todayStr && t.status !== 'Completed');
          if (!isOverdue) return false;
        } else if (statusFilter === 'To Do') {
          if (t.status !== 'To Do' && t.status !== 'Not Started') return false;
        } else {
          if (t.status !== statusFilter) return false;
        }
      }

      // 4. Priority Filter
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) {
        return false;
      }

      // 5. Assignee Filter
      if (assigneeFilter !== 'All' && t.assignee !== assigneeFilter) {
        return false;
      }

      // 6. Due Date Filter
      if (dueDateFilter !== 'All') {
        const isOverdue = t.isOverdue || (t.dueDate && t.dueDate < todayStr && t.status !== 'Completed');
        if (dueDateFilter === 'Overdue') {
          if (!isOverdue) return false;
        } else if (dueDateFilter === 'Today') {
          if (t.dueDate !== todayStr) return false;
        } else if (dueDateFilter === 'This Week') {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          const nextWeekStr = nextWeek.toISOString().split('T')[0];
          if (t.dueDate < todayStr || t.dueDate > nextWeekStr) return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, projectFilter, statusFilter, priorityFilter, assigneeFilter, dueDateFilter, todayStr]);

  // Check if any filter is actively applied
  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    projectFilter !== 'All' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    assigneeFilter !== 'All' ||
    dueDateFilter !== 'All'
  );

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchQuery('');
    setProjectFilter('All');
    setStatusFilter('All');
    setPriorityFilter('All');
    setAssigneeFilter('All');
    setDueDateFilter('All');
    setSearchParams({});
  };

  // Quick project change with URL sync
  const handleProjectFilterChange = (val) => {
    setProjectFilter(val);
    if (val === 'All') {
      searchParams.delete('project');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ project: val });
    }
  };

  // Open Create Task Modal (optionally preset with status)
  const handleOpenCreateTask = (initialStatus = 'To Do') => {
    const selectedProj = projects.find((p) => p.id === projectFilter) || projects[0];
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  // Open Edit Task Modal
  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Open Details Modal/Drawer
  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  // Open Create Milestone Modal
  const handleOpenCreateMilestone = () => {
    setEditingMilestone(null);
    setIsMilestoneModalOpen(true);
  };

  // Open Edit Milestone Modal
  const handleOpenEditMilestone = (milestone) => {
    setEditingMilestone(milestone);
    setIsMilestoneModalOpen(true);
  };

  // Open Archive Confirmation
  const handleOpenArchive = (item, type = 'task') => {
    setArchiveTarget({ type, item });
    setIsArchiveModalOpen(true);
  };

  // Submit Task (Create or Edit)
  const handleSubmitTask = async (formData) => {
    try {
      if (editingTask) {
        const res = await api.updateTask(editingTask.id, formData);
        if (res.success) {
          showToast(`Task "${res.data.title}" updated successfully!`, 'success');
          setIsTaskModalOpen(false);
          loadData();
          if (selectedTask?.id === editingTask.id) {
            setSelectedTask(res.data);
          }
        } else {
          showToast(res.message || 'Failed to update task', 'danger');
        }
      } else {
        const res = await api.createTask(formData);
        if (res.success) {
          showToast(`Task "${res.data.title}" created successfully!`, 'success');
          setIsTaskModalOpen(false);
          loadData();
        } else {
          showToast(res.message || 'Failed to create task', 'danger');
        }
      }
    } catch {
      showToast('An unexpected error occurred while saving task.', 'danger');
    }
  };

  // Status transition handler (Quick move from Kanban, Table, or Details)
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.updateTaskStatus(taskId, newStatus);
      if (res.success) {
        showToast(`Task moved to ${newStatus}`, 'info');
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: newStatus,
                  progress: newStatus === 'Completed' ? 100 : t.progress
                }
              : t
          )
        );
        if (selectedTask?.id === taskId) {
          setSelectedTask((prev) => ({
            ...prev,
            status: newStatus,
            progress: newStatus === 'Completed' ? 100 : prev.progress
          }));
        }
      }
    } catch {
      showToast('Failed to update task status.', 'danger');
    }
  };

  // Submit Milestone (Create or Edit)
  const handleSubmitMilestone = async (formData) => {
    try {
      if (editingMilestone) {
        const res = await api.updateMilestone(editingMilestone.id, formData);
        if (res.success) {
          showToast(`Milestone "${res.data.title}" updated!`, 'success');
          setIsMilestoneModalOpen(false);
          loadData();
        } else {
          showToast(res.message || 'Failed to update milestone.', 'danger');
        }
      } else {
        const res = await api.createMilestone(formData);
        if (res.success) {
          showToast(`Milestone "${res.data.title}" created!`, 'success');
          setIsMilestoneModalOpen(false);
          loadData();
        } else {
          showToast(res.message || 'Failed to create milestone.', 'danger');
        }
      }
    } catch {
      showToast('Failed to save milestone.', 'danger');
    }
  };

  // Confirm Archive Action
  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      if (archiveTarget.type === 'task') {
        const res = await api.archiveTask(archiveTarget.item.id);
        if (res.success) {
          showToast(`Task "${archiveTarget.item.title}" archived.`, 'success');
          setIsArchiveModalOpen(false);
          if (isDetailsModalOpen && selectedTask?.id === archiveTarget.item.id) {
            setIsDetailsModalOpen(false);
          }
          loadData();
        }
      } else {
        const res = await api.archiveMilestone(archiveTarget.item.id);
        if (res.success) {
          showToast(`Milestone "${archiveTarget.item.title}" archived.`, 'success');
          setIsArchiveModalOpen(false);
          loadData();
        }
      }
    } catch {
      showToast('Failed to archive item.', 'danger');
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="tasks-loading-state" role="status" aria-live="polite">
        <div className="tasks-loading-spinner" />
        <h3 className="tasks-loading-title">Loading Tasks & Operations Schedules...</h3>
        <p className="tasks-loading-subtitle">Syncing work packages, dependencies, and baseline gateways.</p>
      </div>
    );
  }

  return (
    <div className="tasks-page-container">
      {/* 1. Page Header */}
      <header className="tasks-page-header">
        <div className="tasks-page-header-text">
          <h1 className="tasks-page-title">Tasks & Milestones</h1>
          <p className="tasks-page-subtitle">
            Manage site execution packages, critical path milestones, prerequisite dependencies, and verification progress.
          </p>
        </div>

        <div className="tasks-page-header-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleOpenCreateMilestone}
            title="Create a new critical milestone"
          >
            <Plus size={14} />
            <span>New Milestone</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenCreateTask()}
            title="Create a new work package or task"
          >
            <Plus size={14} />
            <span>New Task</span>
          </button>
        </div>
      </header>

      {/* 2. Operational Summary Strip */}
      <TaskSummary
        stats={kpiStats}
        upcomingMilestonesCount={upcomingMilestonesCount}
        activeFilter={statusFilter}
        onSelectFilter={(filterKey) => {
          setStatusFilter(filterKey);
        }}
      />

      {/* 3. Search & Multi-criteria Filters Bar */}
      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        projectFilter={projectFilter}
        onProjectChange={handleProjectFilterChange}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        dueDateFilter={dueDateFilter}
        onDueDateChange={setDueDateFilter}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        projects={projects}
        assignees={distinctAssignees}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResultsCount={filteredTasks.length}
        totalTasksCount={tasks.length}
      />

      {/* 4. Active View Mode Rendering */}
      <main className="tasks-view-area">
        {viewMode === 'list' && (
          <TaskTable
            tasks={filteredTasks}
            allTasks={tasks}
            todayStr={todayStr}
            onOpenDetails={handleOpenDetails}
            onOpenEdit={handleOpenEditTask}
            onOpenArchive={handleOpenArchive}
            onOpenCreateTask={handleOpenCreateTask}
          />
        )}

        {viewMode === 'kanban' && (
          <TaskKanban
            tasks={filteredTasks}
            allTasks={tasks}
            todayStr={todayStr}
            onOpenDetails={handleOpenDetails}
            onOpenEdit={handleOpenEditTask}
            onOpenArchive={handleOpenArchive}
            onStatusChange={handleStatusChange}
            onOpenCreateTask={handleOpenCreateTask}
          />
        )}

        {viewMode === 'timeline' && (
          <TaskTimeline
            tasks={filteredTasks}
            milestones={filteredMilestones}
            todayStr={todayStr}
            onOpenDetails={handleOpenDetails}
          />
        )}
      </main>

      {/* 5. Critical Path Milestones Section */}
      <MilestoneSection
        milestones={filteredMilestones}
        projects={projects}
        allTasks={tasks}
        todayStr={todayStr}
        onOpenCreateMilestone={handleOpenCreateMilestone}
        onOpenEditMilestone={handleOpenEditMilestone}
        onOpenArchiveMilestone={handleOpenArchive}
      />

      {/* 6. Modals */}
      {/* Create / Edit Task Modal */}
      <TaskForm
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        editingTask={editingTask}
        projects={projects}
        allTasks={tasks}
        onSubmitTask={handleSubmitTask}
      />

      {/* Task Details Drawer / Modal */}
      <TaskDetails
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        task={selectedTask}
        allTasks={tasks}
        todayStr={todayStr}
        onOpenEdit={handleOpenEditTask}
        onOpenArchive={handleOpenArchive}
        onStatusChange={handleStatusChange}
      />

      {/* Create / Edit Milestone Modal */}
      <MilestoneForm
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        editingMilestone={editingMilestone}
        projects={projects}
        allTasks={tasks}
        onSubmitMilestone={handleSubmitMilestone}
      />

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title={archiveTarget?.type === 'task' ? 'Archive Work Deliverable' : 'Archive Project Milestone'}
        maxWidth="460px"
      >
        <div className="task-archive-confirm-body">
          <div className="archive-warning-icon">⚠️</div>
          <h4 className="archive-confirm-heading">
            Archive "{archiveTarget?.item?.title}"?
          </h4>
          <p className="archive-confirm-desc">
            This action will safely remove this item from active site operational schedules.
            All historical milestones, progress certifications, and prerequisite logs remain preserved.
          </p>
        </div>

        <div className="modal-footer flex items-center justify-center gap-3">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setIsArchiveModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleConfirmArchive}
          >
            Confirm Archive
          </button>
        </div>
      </Modal>
    </div>
  );
}
