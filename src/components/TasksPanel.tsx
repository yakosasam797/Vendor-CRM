import { useEffect, useId, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  FilterSelect,
  IconButton,
  LeadCell,
  Pagination,
  SearchField,
  StatusChip,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  DONE_VENDOR_TASKS,
  OPEN_VENDOR_TASKS,
  TASK_STATUS_TONE,
  type TaskStatus,
  type VendorTask,
} from "../data/tasks";
import { IconCalendar, IconClock, IconClose, IconPlus, IconTaskCheck } from "../icons";
import "./TasksPanel.css";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "Open", label: "Open" },
  { value: "In progress", label: "In progress" },
  { value: "Blocked", label: "Blocked" },
];

const CREATE_STATUS_OPTIONS: TaskStatus[] = ["Open", "In progress", "Blocked", "Done"];
const PRIORITY_OPTIONS = ["P1", "P2", "P3"] as const;
const TASK_ASSIGNEES = [
  { name: "Anjali Menon", role: "Vendor desk", initials: "AM", tone: "pink" as const },
  { name: "Meera Joseph", role: "Operations", initials: "MJ", tone: "default" as const },
  { name: "Vrushabh Jain", role: "Owner", initials: "VJ", tone: "pink" as const },
];

type TaskDraft = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: (typeof PRIORITY_OPTIONS)[number];
  assignee: string;
  dueDate: string;
  dueTime: string;
};

const EMPTY_TASK_DRAFT: TaskDraft = {
  title: "",
  description: "",
  status: "Open",
  priority: "P2",
  assignee: TASK_ASSIGNEES[0].name,
  dueDate: "",
  dueTime: "",
};

function formatTaskDue(dateValue: string, timeValue: string) {
  if (!dateValue) return "—";
  const date = new Date(`${dateValue}T${timeValue || "12:00"}:00`);
  if (Number.isNaN(date.getTime())) return "—";

  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const dateLabel = isToday
    ? "Today"
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
  if (!timeValue) return dateLabel;
  const timeLabel = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: timeValue.endsWith(":00") ? undefined : "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(/\s?(am|pm)$/i, (period) => ` ${period.trim().toUpperCase()}`);
  return `${dateLabel} ${timeLabel}`;
}

function AddTaskModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (task: VendorTask) => void;
}) {
  const titleId = useId();
  const [draft, setDraft] = useState<TaskDraft>(EMPTY_TASK_DRAFT);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  const setField = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key === "title") setShowError(false);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setShowError(true);
      return;
    }
    const assignee = TASK_ASSIGNEES.find((person) => person.name === draft.assignee) ?? TASK_ASSIGNEES[0];
    onCreate({
      id: `tsk-${Date.now()}`,
      title,
      context: draft.description.trim() || `${draft.priority} · General follow-up`,
      description: draft.description.trim(),
      priority: draft.priority,
      assigneeName: assignee.name,
      assigneeRole: assignee.role,
      assigneeInitials: assignee.initials,
      assigneeTone: assignee.tone,
      due: formatTaskDue(draft.dueDate, draft.dueTime),
      status: draft.status,
    });
  };

  return (
    <div
      className="pt-modal-overlay open task-create-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="pt-modal task-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
      >
        <div className="pt-modal__head">
          <div className="pt-modal__head-copy">
            <h2 id={titleId} className="pt-modal__title">Add task</h2>
            <p className="pt-modal__desc">Create a follow-up for this vendor.</p>
          </div>
          <IconButton className="pt-modal__close" label="Close task form" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>

        <div className="pt-modal__body task-create-modal__body">
          <div className="pt-mf">
            <label className="pt-mf__l" htmlFor="task-title">Task name</label>
            <input
              id="task-title"
              className={`pt-mf__i${showError ? " is-invalid" : ""}`}
              value={draft.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="What needs to be done?"
              aria-invalid={showError}
              aria-describedby={showError ? "task-title-error" : undefined}
              autoFocus
            />
            {showError ? <span id="task-title-error" className="task-create-modal__error">Enter a task name.</span> : null}
          </div>

          <div className="pt-mf">
            <label className="pt-mf__l" htmlFor="task-description">Description <span>Optional</span></label>
            <textarea
              id="task-description"
              className="pt-mf__i task-create-modal__textarea"
              value={draft.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="Add useful context or the expected outcome"
              rows={3}
            />
          </div>

          <div className="task-create-modal__grid">
            <div className="pt-mf">
              <label className="pt-mf__l" htmlFor="task-status">Status</label>
              <select id="task-status" className="pt-mf__i" value={draft.status} onChange={(event) => setField("status", event.target.value as TaskStatus)}>
                {CREATE_STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
            <div className="pt-mf">
              <label className="pt-mf__l" htmlFor="task-priority">Priority</label>
              <select id="task-priority" className="pt-mf__i" value={draft.priority} onChange={(event) => setField("priority", event.target.value as TaskDraft["priority"])}>
                {PRIORITY_OPTIONS.map((priority) => <option key={priority}>{priority}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-mf">
            <label className="pt-mf__l" htmlFor="task-assignee">Assignee</label>
            <select id="task-assignee" className="pt-mf__i" value={draft.assignee} onChange={(event) => setField("assignee", event.target.value)}>
              {TASK_ASSIGNEES.map((person) => <option key={person.name}>{person.name}</option>)}
            </select>
          </div>

          <div className="pt-mf">
            <span className="pt-mf__l">Due date and time <span>Optional</span></span>
            <div className="task-create-modal__due">
              <label>
                <IconCalendar size={15} />
                <span className="visually-hidden">Due date</span>
                <input type="date" value={draft.dueDate} onChange={(event) => setField("dueDate", event.target.value)} />
              </label>
              <label>
                <IconClock size={15} />
                <span className="visually-hidden">Due time</span>
                <input type="time" value={draft.dueTime} onChange={(event) => setField("dueTime", event.target.value)} disabled={!draft.dueDate} />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-modal__foot task-create-modal__foot">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" type="submit">Create task</Button>
        </div>
      </form>
    </div>
  );
}

function TaskSheet({
  tasks,
  ariaLabel,
  selected,
  onToggleAll,
  onToggleRow,
  onOpenTask,
  statusInteractive,
}: {
  tasks: VendorTask[];
  ariaLabel: string;
  selected: string[];
  onToggleAll: (state: CheckboxState) => void;
  onToggleRow: (id: string, state: CheckboxState) => void;
  onOpenTask: (task: VendorTask) => void;
  statusInteractive?: boolean;
}) {
  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === tasks.length && tasks.length > 0
        ? "on"
        : "indeterminate";

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks match"
        description="Try another search or status filter."
      />
    );
  }

  return (
    <>
      <DataSheet className="tasks-sheet" aria-label={ariaLabel}>
        <DataSheetHeader>
          <DataSheetCell check>
            <Checkbox
              state={headerState}
              onCheckedChange={onToggleAll}
              label={`Select all ${ariaLabel.toLowerCase()}`}
            />
          </DataSheetCell>
          <DataSheetCell>Task</DataSheetCell>
          <DataSheetCell>Assignee</DataSheetCell>
          <DataSheetCell>Due</DataSheetCell>
          <DataSheetCell>Status</DataSheetCell>
        </DataSheetHeader>
        {tasks.map((task) => (
          <DataSheetRow
            key={task.id}
            className="data-row--interactive"
            role="link"
            tabIndex={0}
            aria-label={`Open ${task.title}`}
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest("button, a, input, select, textarea")) return;
              onOpenTask(task);
            }}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenTask(task);
              }
            }}
          >
            <DataSheetCell check>
              <Checkbox
                state={selected.includes(task.id) ? "on" : "off"}
                onCheckedChange={(state) => onToggleRow(task.id, state)}
                label={`Select ${task.title}`}
              />
            </DataSheetCell>
            <DataSheetCell>
              <LeadCell align="start" icon={<IconTaskCheck size={15} />} title={task.title} subtitle={task.context} />
            </DataSheetCell>
            <DataSheetCell>
              <div className="tasks-sheet__who">
                <Avatar tone={task.assigneeTone} size={28}>
                  {task.assigneeInitials}
                </Avatar>
                <div className="tasks-sheet__who-copy">
                  <span className="tasks-sheet__who-name">{task.assigneeName}</span>
                  <span className="tasks-sheet__who-role">{task.assigneeRole}</span>
                </div>
              </div>
            </DataSheetCell>
            <DataSheetCell>
              <span className="tasks-sheet__due">
                <IconCalendar size={13} />
                {task.due}
              </span>
            </DataSheetCell>
            <DataSheetCell>
              {statusInteractive ? (
                <label className="tasks-sheet__status-pick">
                  <span className="visually-hidden">Status for {task.title}</span>
                  <StatusChip tone={TASK_STATUS_TONE[task.status]}>
                    {task.status}
                  </StatusChip>
                </label>
              ) : (
                <StatusChip tone={TASK_STATUS_TONE[task.status]}>{task.status}</StatusChip>
              )}
            </DataSheetCell>
          </DataSheetRow>
        ))}
      </DataSheet>
      <Pagination
        rangeLabel={`Showing 1–${tasks.length} of ${tasks.length}`}
        page={1}
        pageCount={1}
        onPageChange={() => undefined}
      />
    </>
  );
}

/**
 * Vendor Tasks tab — same Open / Completed sheet language as
 * booking fulfilment (Tasks) in new-direction-03.
 */
export function TasksPanel({
  canAddTask,
  onOpenTaskCountChange,
}: {
  canAddTask: boolean;
  onOpenTaskCountChange?: (count: number) => void;
}) {
  const [openQuery, setOpenQuery] = useState("");
  const [doneQuery, setDoneQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openSelected, setOpenSelected] = useState<string[]>([]);
  const [doneSelected, setDoneSelected] = useState<string[]>([]);
  const [activeTask, setActiveTask] = useState<VendorTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [openTasks, setOpenTasks] = useState<VendorTask[]>(OPEN_VENDOR_TASKS);
  const [doneTasks, setDoneTasks] = useState<VendorTask[]>(DONE_VENDOR_TASKS);

  useEffect(() => {
    onOpenTaskCountChange?.(openTasks.length);
  }, [onOpenTaskCountChange, openTasks.length]);

  useEffect(() => {
    if (!activeTask) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveTask(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTask]);

  const openFiltered = useMemo(() => {
    const q = openQuery.trim().toLowerCase();
    return openTasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== (statusFilter as TaskStatus)) {
        return false;
      }
      if (!q) return true;
      const hay = `${task.title} ${task.context} ${task.assigneeName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [openQuery, openTasks, statusFilter]);

  const doneFiltered = useMemo(() => {
    const q = doneQuery.trim().toLowerCase();
    if (!q) return doneTasks;
    return doneTasks.filter((task) => {
      const hay = `${task.title} ${task.context} ${task.assigneeName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [doneQuery, doneTasks]);

  const createTask = (task: VendorTask) => {
    if (task.status === "Done") setDoneTasks((current) => [task, ...current]);
    else setOpenTasks((current) => [task, ...current]);
    setCreateOpen(false);
    setOpenQuery("");
    setStatusFilter("all");
  };

  const toggleOpenAll = (state: CheckboxState) => {
    setOpenSelected(state === "on" ? openFiltered.map((t) => t.id) : []);
  };
  const toggleDoneAll = (state: CheckboxState) => {
    setDoneSelected(state === "on" ? doneFiltered.map((t) => t.id) : []);
  };
  const toggleOpenRow = (id: string, state: CheckboxState) => {
    setOpenSelected((cur) =>
      state === "on" ? (cur.includes(id) ? cur : [...cur, id]) : cur.filter((x) => x !== id),
    );
  };
  const toggleDoneRow = (id: string, state: CheckboxState) => {
    setDoneSelected((cur) =>
      state === "on" ? (cur.includes(id) ? cur : [...cur, id]) : cur.filter((x) => x !== id),
    );
  };

  return (
    <div className="tasks-panel">
      <section className="tasks-panel__section" aria-labelledby="tasks-open-title">
        <div className="tasks-panel__head">
          <h2 id="tasks-open-title" className="tasks-panel__title">
            Open
          </h2>
        </div>
        <div className="tasks-panel__toolbar">
          <SearchField
            fullWidth
            className="tasks-panel__search"
            value={openQuery}
            onChange={(event) => {
              setOpenQuery(event.target.value);
              setOpenSelected([]);
            }}
            placeholder="Search task or assignee"
            aria-label="Search task or assignee"
          />
          <FilterSelect
            tip="Filter by status"
            label="Status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setOpenSelected([]);
            }}
          />
          {canAddTask ? (
            <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
              <IconPlus />
              Add task
            </Button>
          ) : null}
        </div>
        <TaskSheet
          tasks={openFiltered}
          ariaLabel="Open tasks"
          selected={openSelected}
          onToggleAll={toggleOpenAll}
          onToggleRow={toggleOpenRow}
          onOpenTask={setActiveTask}
          statusInteractive
        />
      </section>

      <section className="tasks-panel__section" aria-labelledby="tasks-done-title">
        <div className="tasks-panel__head">
          <h2 id="tasks-done-title" className="tasks-panel__title">
            Completed
          </h2>
        </div>
        <div className="tasks-panel__toolbar">
          <SearchField
            fullWidth
            className="tasks-panel__search"
            value={doneQuery}
            onChange={(event) => {
              setDoneQuery(event.target.value);
              setDoneSelected([]);
            }}
            placeholder="Search completed task"
            aria-label="Search completed task"
          />
        </div>
        <TaskSheet
          tasks={doneFiltered}
          ariaLabel="Completed tasks"
          selected={doneSelected}
          onToggleAll={toggleDoneAll}
          onToggleRow={toggleDoneRow}
          onOpenTask={setActiveTask}
        />
      </section>

      {createOpen && canAddTask ? (
        <AddTaskModal onClose={() => setCreateOpen(false)} onCreate={createTask} />
      ) : null}

      {activeTask ? (
        <div
          className="rc-modal-backdrop task-detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveTask(null);
          }}
        >
          <div className="rc-modal task-detail" role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
            <div className="task-detail__head">
              <div>
                <h2 id="task-detail-title" className="rc-modal__title">{activeTask.title}</h2>
              </div>
              <IconButton label="Close task" onClick={() => setActiveTask(null)} autoFocus>
                <IconClose />
              </IconButton>
            </div>
            <dl className="task-detail__meta">
              <div><dt>Context</dt><dd>{activeTask.context}</dd></div>
              {activeTask.description ? <div><dt>Description</dt><dd>{activeTask.description}</dd></div> : null}
              {activeTask.priority ? <div><dt>Priority</dt><dd>{activeTask.priority}</dd></div> : null}
              <div><dt>Assignee</dt><dd>{activeTask.assigneeName}</dd></div>
              <div><dt>Team</dt><dd>{activeTask.assigneeRole}</dd></div>
              <div><dt>Due</dt><dd>{activeTask.due}</dd></div>
              <div><dt>Status</dt><dd><StatusChip tone={TASK_STATUS_TONE[activeTask.status]}>{activeTask.status}</StatusChip></dd></div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
