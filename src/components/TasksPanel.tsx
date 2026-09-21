import { useMemo, useState } from "react";
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
  Tooltip,
  type CheckboxState,
} from "@paryatech/design-system";
import {
  DONE_VENDOR_TASKS,
  OPEN_VENDOR_TASKS,
  TASK_STATUS_TONE,
  type TaskStatus,
  type VendorTask,
} from "../data/tasks";
import { IconCalendar, IconMore, IconOpenOut, IconPlus, IconTaskCheck } from "../icons";
import "./TasksPanel.css";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "Open", label: "Open" },
  { value: "In progress", label: "In progress" },
  { value: "Blocked", label: "Blocked" },
];

function TaskSheet({
  tasks,
  ariaLabel,
  selected,
  onToggleAll,
  onToggleRow,
  statusInteractive,
}: {
  tasks: VendorTask[];
  ariaLabel: string;
  selected: string[];
  onToggleAll: (state: CheckboxState) => void;
  onToggleRow: (id: string, state: CheckboxState) => void;
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
          <DataSheetCell>Action</DataSheetCell>
        </DataSheetHeader>
        {tasks.map((task) => (
          <DataSheetRow key={task.id}>
            <DataSheetCell check>
              <Checkbox
                state={selected.includes(task.id) ? "on" : "off"}
                onCheckedChange={(state) => onToggleRow(task.id, state)}
                label={`Select ${task.title}`}
              />
            </DataSheetCell>
            <DataSheetCell>
              <LeadCell
                align="start"
                icon={<IconTaskCheck size={15} />}
                title={task.title}
                subtitle={task.context}
              />
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
            <DataSheetCell>
              <div className="tasks-sheet__acts">
                <Button variant="brand" size="sm">
                  <IconOpenOut />
                  Open
                </Button>
                <Tooltip tip="More">
                  <IconButton label="More">
                    <IconMore />
                  </IconButton>
                </Tooltip>
              </div>
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
export function TasksPanel() {
  const [openQuery, setOpenQuery] = useState("");
  const [doneQuery, setDoneQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openSelected, setOpenSelected] = useState<string[]>([]);
  const [doneSelected, setDoneSelected] = useState<string[]>([]);

  const openFiltered = useMemo(() => {
    const q = openQuery.trim().toLowerCase();
    return OPEN_VENDOR_TASKS.filter((task) => {
      if (statusFilter !== "all" && task.status !== (statusFilter as TaskStatus)) {
        return false;
      }
      if (!q) return true;
      const hay = `${task.title} ${task.context} ${task.assigneeName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [openQuery, statusFilter]);

  const doneFiltered = useMemo(() => {
    const q = doneQuery.trim().toLowerCase();
    if (!q) return DONE_VENDOR_TASKS;
    return DONE_VENDOR_TASKS.filter((task) => {
      const hay = `${task.title} ${task.context} ${task.assigneeName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [doneQuery]);

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
          <Button variant="primary" size="sm">
            <IconPlus />
            Add task
          </Button>
        </div>
        <TaskSheet
          tasks={openFiltered}
          ariaLabel="Open tasks"
          selected={openSelected}
          onToggleAll={toggleOpenAll}
          onToggleRow={toggleOpenRow}
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
        />
      </section>
    </div>
  );
}
