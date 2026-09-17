import React, { useState } from 'react';
import {
  Search,
  RotateCcw,
  List,
  Kanban,
  Calendar,
  Filter,
  X,
  ChevronDown,
  Building,
  User,
  SlidersHorizontal
} from 'lucide-react';

/**
 * TaskFilters
 * Enterprise construction filter bar with active filter badges,
 * unified search, multi-criteria selectors, clear filter controls,
 * and view mode switcher.
 */
export default function TaskFilters({
  searchQuery,
  onSearchChange,
  projectFilter,
  onProjectChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  dueDateFilter,
  onDueDateChange,
  onClearFilters,
  hasActiveFilters,
  projects = [],
  assignees = [],
  viewMode,
  onViewModeChange,
  totalResultsCount = 0,
  totalTasksCount = 0
}) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Active filter badges list
  const activePills = [];
  if (projectFilter !== 'All') {
    const projName = projects.find((p) => p.id === projectFilter)?.name || projectFilter;
    activePills.push({
      key: 'project',
      label: `Project: ${projName}`,
      onRemove: () => onProjectChange('All')
    });
  }
  if (statusFilter !== 'All') {
    activePills.push({
      key: 'status',
      label: `Status: ${statusFilter}`,
      onRemove: () => onStatusChange('All')
    });
  }
  if (priorityFilter !== 'All') {
    activePills.push({
      key: 'priority',
      label: `Priority: ${priorityFilter}`,
      onRemove: () => onPriorityChange('All')
    });
  }
  if (assigneeFilter !== 'All') {
    activePills.push({
      key: 'assignee',
      label: `Assignee: ${assigneeFilter}`,
      onRemove: () => onAssigneeChange('All')
    });
  }
  if (dueDateFilter !== 'All') {
    activePills.push({
      key: 'dueDate',
      label: `Due: ${dueDateFilter}`,
      onRemove: () => onDueDateChange('All')
    });
  }
  if (searchQuery.trim()) {
    activePills.push({
      key: 'search',
      label: `Search: "${searchQuery}"`,
      onRemove: () => onSearchChange('')
    });
  }

  return (
    <div className="task-filter-workspace">
      {/* Top Bar: Search, Quick View Switcher & Mobile Toggle */}
      <div className="task-filter-topbar">
        {/* Search Field */}
        <div className="task-search-container">
          <Search size={15} className="task-search-icon" />
          <input
            type="text"
            className="task-search-input"
            placeholder="Search tasks, specifications, assignees..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              type="button"
              className="task-search-clear"
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* View Switcher Controls */}
        <div className="task-view-switcher" role="tablist" aria-label="Task Views">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            className={`task-view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="Switch to List View"
          >
            <List size={14} />
            <span>List</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'kanban'}
            className={`task-view-btn ${viewMode === 'kanban' ? 'is-active' : ''}`}
            onClick={() => onViewModeChange('kanban')}
            title="Switch to Kanban View"
          >
            <Kanban size={14} />
            <span>Kanban</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'timeline'}
            className={`task-view-btn ${viewMode === 'timeline' ? 'is-active' : ''}`}
            onClick={() => onViewModeChange('timeline')}
            title="Switch to Timeline View"
          >
            <Calendar size={14} />
            <span>Timeline</span>
          </button>
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          type="button"
          className={`task-filter-toggle-btn md-hidden ${hasActiveFilters ? 'has-active' : ''}`}
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          aria-expanded={isMobileFiltersOpen}
        >
          <SlidersHorizontal size={14} />
          <span>Filters {hasActiveFilters && `(${activePills.length})`}</span>
          <ChevronDown size={14} style={{ transform: isMobileFiltersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {/* Selectors Row (Collapsible on mobile) */}
      <div className={`task-selectors-row ${isMobileFiltersOpen ? 'is-open' : ''}`}>
        {/* Project Selector */}
        <div className="task-select-wrap">
          <select
            className="task-select"
            value={projectFilter}
            onChange={(e) => onProjectChange(e.target.value)}
            aria-label="Filter by project"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="task-select-wrap">
          <select
            className="task-select"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">In Review</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">⚠️ Overdue Only</option>
          </select>
        </div>

        {/* Priority Selector */}
        <div className="task-select-wrap">
          <select
            className="task-select"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Assignee Selector */}
        <div className="task-select-wrap">
          <select
            className="task-select"
            value={assigneeFilter}
            onChange={(e) => onAssigneeChange(e.target.value)}
            aria-label="Filter by assignee"
          >
            <option value="All">All Assignees</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date Selector */}
        <div className="task-select-wrap">
          <select
            className="task-select"
            value={dueDateFilter}
            onChange={(e) => onDueDateChange(e.target.value)}
            aria-label="Filter by due date"
          >
            <option value="All">All Dates</option>
            <option value="Overdue">Overdue</option>
            <option value="Today">Due Today</option>
            <option value="This Week">Due This Week</option>
          </select>
        </div>

        {/* Reset Action */}
        {hasActiveFilters && (
          <button
            type="button"
            className="task-clear-filters-btn"
            onClick={onClearFilters}
            title="Reset all filters to default"
          >
            <RotateCcw size={13} />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips & Results Count */}
      <div className="task-filter-feedback-row">
        <div className="task-active-chips-area">
          {activePills.length > 0 ? (
            activePills.map((pill) => (
              <span key={pill.key} className="task-active-chip">
                <span>{pill.label}</span>
                <button
                  type="button"
                  className="task-chip-remove"
                  onClick={pill.onRemove}
                  aria-label={`Remove filter ${pill.label}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))
          ) : (
            <span className="task-filter-hint">
              Showing {totalResultsCount} of {totalTasksCount} scheduled items
            </span>
          )}
        </div>

        {activePills.length > 0 && (
          <div className="task-filtered-count">
            Showing <strong>{totalResultsCount}</strong> matches
          </div>
        )}
      </div>
    </div>
  );
}
