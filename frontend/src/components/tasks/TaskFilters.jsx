import React from 'react';
import {
  Search,
  X,
  RotateCcw,
  Filter
} from 'lucide-react';

/**
 * TaskFilters
 * Clean horizontal single-row filter toolbar for tasks and milestones.
 * Includes Search input and selectors for Project, Status, Priority, Assignee, Due Date.
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
  assignees = []
}) {
  return (
    <div className="task-filter-toolbar" role="region" aria-label="Task Filters and Search">
      {/* 1. Search Bar */}
      <div className="filter-search-box">
        <Search size={15} className="filter-search-icon" aria-hidden="true" />
        <input
          type="text"
          className="filter-search-input"
          placeholder="Search tasks, milestones..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tasks and milestones"
        />
        {searchQuery && (
          <button
            type="button"
            className="filter-search-clear"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* 2. Horizontal Filter Selectors */}
      <div className="filter-controls-group">
        {/* Project Selector */}
        <select
          className="filter-select"
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

        {/* Status Selector */}
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="All">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
          <option value="Blocked">Blocked</option>
        </select>

        {/* Priority Selector */}
        <select
          className="filter-select"
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

        {/* Assignee Selector */}
        <select
          className="filter-select"
          value={assigneeFilter}
          onChange={(e) => onAssigneeChange(e.target.value)}
          aria-label="Filter by assignee"
        >
          <option value="All">All Assignees</option>
          {assignees.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Due Date Selector */}
        <select
          className="filter-select"
          value={dueDateFilter}
          onChange={(e) => onDueDateChange(e.target.value)}
          aria-label="Filter by due date"
        >
          <option value="All">All Due Dates</option>
          <option value="Today">Due Today</option>
          <option value="This Week">Due This Week</option>
          <option value="Overdue">Overdue</option>
        </select>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="filter-clear-action"
            onClick={onClearFilters}
            title="Reset all filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
