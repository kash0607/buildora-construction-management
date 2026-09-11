import React from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

/**
 * TaskKanban
 * 5-column operational Kanban board:
 * [To Do] -> [In Progress] -> [Review] -> [Blocked] -> [Completed]
 * Features a horizontally scrollable container with fixed-width columns
 * so cards maintain readable hierarchy on both desktop and mobile screens.
 */
export default function TaskKanban({
  tasks = [],
  allTasks = [],
  todayStr,
  onOpenDetails,
  onOpenEdit,
  onOpenArchive,
  onStatusChange,
  onOpenCreateTask
}) {
  const KANBAN_COLUMNS = [
    {
      id: 'To Do',
      label: 'To Do',
      colorClass: 'col-todo',
      description: 'Scheduled site activities'
    },
    {
      id: 'In Progress',
      label: 'In Progress',
      colorClass: 'col-inprogress',
      description: 'Active on site execution'
    },
    {
      id: 'Review',
      label: 'Review',
      colorClass: 'col-review',
      description: 'QA & structural inspection'
    },
    {
      id: 'Blocked',
      label: 'Blocked',
      colorClass: 'col-blocked',
      description: 'Halted on dependencies'
    },
    {
      id: 'Completed',
      label: 'Completed',
      colorClass: 'col-completed',
      description: 'Certified & finished works'
    }
  ];

  const columnNames = KANBAN_COLUMNS.map((c) => c.id);

  return (
    <div className="task-kanban-workspace">
      <div className="task-kanban-track">
        {KANBAN_COLUMNS.map((column) => {
          const colTasks = tasks.filter((t) => {
            if (column.id === 'To Do') {
              return t.status === 'To Do' || t.status === 'Not Started';
            }
            return t.status === column.id;
          });

          return (
            <div key={column.id} className={`task-kanban-column ${column.colorClass}`}>
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="kanban-header-left">
                  <span className="kanban-col-indicator" />
                  <span className="kanban-column-title">{column.label}</span>
                  <span className="kanban-col-count">{colTasks.length}</span>
                </div>

                {onOpenCreateTask && (
                  <button
                    type="button"
                    className="kanban-col-add-btn"
                    onClick={() => onOpenCreateTask(column.id)}
                    title={`Add task to ${column.label}`}
                    aria-label={`Add task to ${column.label}`}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              {/* Column Sub-Header / Description */}
              <div className="kanban-col-subinfo">
                <span>{column.description}</span>
              </div>

              {/* Cards List Container */}
              <div className="kanban-cards-scroll">
                {colTasks.length === 0 ? (
                  <div className="kanban-empty-dropzone">
                    <p className="kanban-empty-text">No tasks in {column.label}</p>
                    {onOpenCreateTask && column.id === 'To Do' && (
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        style={{ marginTop: '0.5rem' }}
                        onClick={() => onOpenCreateTask(column.id)}
                      >
                        + Add Task
                      </button>
                    )}
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      allTasks={allTasks}
                      todayStr={todayStr}
                      onOpenDetails={onOpenDetails}
                      onOpenEdit={onOpenEdit}
                      onOpenArchive={onOpenArchive}
                      onStatusChange={onStatusChange}
                      statusColumns={columnNames}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
