"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { View } from "./AppShell";
import { Btn, Empty } from "./ui";

type Filters = {
  priority: string; status: string; due: string;
  projectId: string; tag: string; groupBy: string;
};

export function AllTasksView({ userId, onNavigate }: { userId: string; onNavigate: (v: View) => void }) {
  const tasks = useQuery(api.tasks.listByUser, { userId });
  const projects = useQuery(api.projects.list, { userId });
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  
  const [filters, setFilters] = useState<Filters>({ priority: "all", status: "all", due: "all", projectId: "all", tag: "all", groupBy: "status" });
  const [showArchived, setShowArchived] = useState(false);

  const setFilter = (k: keyof Filters, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  const allTags = [...new Set((tasks ?? []).flatMap((t) => t.tags ?? []))];

  const formatDue = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr + "T00:00:00");
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const diff = Math.round((date.getTime() - now.getTime()) / 86400000);
    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, type: "overdue", color: "var(--high)" };
    if (diff === 0) return { label: "Today", type: "today", color: "var(--med)" };
    if (diff === 1) return { label: "Tomorrow", type: "upcoming", color: "var(--text2)" };
    return { label: date.toLocaleDateString("en", { month: "short", day: "numeric" }), type: "upcoming", color: "var(--text3)" };
  };

  const cycleStatus = async (task: any) => {
    const cycle = { todo: "inprog", inprog: "done", done: "todo" };
    await updateTask({ id: task._id, status: (cycle[task.status as keyof typeof cycle] ?? "todo") as "todo" | "inprog" | "done" });
  };

  const toggleArchive = async (taskId: Id<"tasks">, currentArchived: boolean) => {
    await updateTask({ id: taskId, archived: !currentArchived });
  };

  const activeTasks = (tasks ?? []).filter((t) => !t.archived);
  const archivedTasks = (tasks ?? []).filter((t) => t.archived);
  const baseList = showArchived ? archivedTasks : activeTasks;

  let filtered = baseList.filter((t) => {
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.status !== "all" && t.status !== filters.status) return false;
    if (filters.projectId !== "all" && t.projectId !== filters.projectId) return false;
    if (filters.tag !== "all" && !(t.tags ?? []).includes(filters.tag)) return false;
    if (filters.due !== "all") {
      const d = formatDue(t.dueDate);
      if (filters.due === "overdue" && d?.type !== "overdue") return false;
      if (filters.due === "today" && d?.type !== "today") return false;
      if (filters.due === "upcoming" && d?.type !== "upcoming") return false;
      if (filters.due === "nodate" && t.dueDate) return false;
    }
    return true;
  });

  const getProjectName = (projectId: Id<"projects">) => projects?.find((p) => p._id === projectId)?.name ?? "Unknown";

  const Chip = ({ k, v, label, color }: { k: keyof Filters; v: string; label: string; color?: string }) => (
    <button
      onClick={() => setFilter(k, v)}
      style={{
        padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid",
        borderColor: filters[k] === v ? "var(--accent)" : "var(--border2)",
        background: filters[k] === v ? "var(--accent-glow)" : "var(--surface2)",
        color: filters[k] === v ? "var(--accent2)" : (color ?? "var(--text2)"),
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  const Divider = () => <div style={{ width: 1, height: 18, background: "var(--border)" }} />;

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "12px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, marginBottom: 18 }}>
        <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>Priority:</span>
        <Chip k="priority" v="all" label="All" />
        <Chip k="priority" v="high" label="High" color="var(--high)" />
        <Chip k="priority" v="med" label="Medium" color="var(--med)" />
        <Chip k="priority" v="low" label="Low" color="var(--low)" />
        <Divider />
        <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>Status:</span>
        <Chip k="status" v="all" label="All" />
        <Chip k="status" v="todo" label="To Do" />
        <Chip k="status" v="inprog" label="In Progress" />
        <Chip k="status" v="done" label="Done" />
        <Divider />
        <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>Due:</span>
        <Chip k="due" v="all" label="All" />
        <Chip k="due" v="overdue" label="Overdue" color="var(--high)" />
        <Chip k="due" v="today" label="Today" color="var(--med)" />
        <Chip k="due" v="upcoming" label="Upcoming" />
        <Chip k="due" v="nodate" label="No Date" />
        {(projects?.length ?? 0) > 1 && (
          <>
            <Divider />
            <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>Project:</span>
            <Chip k="projectId" v="all" label="All" />
            {projects?.map((p) => <Chip key={p._id} k="projectId" v={p._id} label={p.name} />)}
          </>
        )}
        {allTags.length > 0 && (
          <>
            <Divider />
            <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>Tag:</span>
            <Chip k="tag" v="all" label="All" />
            {allTags.map((t) => <Chip key={t} k="tag" v={t} label={`#${t}`} />)}
          </>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "var(--text2)" }}>
          {filtered.length} task{filtered.length !== 1 ? "s" : ""}
        </div>
        {archivedTasks.length > 0 && (
          <Btn variant="ghost" size="sm" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? "Show Active" : `Show Archived (${archivedTasks.length})`}
          </Btn>
        )}
      </div>

      {filtered.length === 0 ? (
        <Empty emoji="🎉" title={showArchived ? "No archived tasks" : "No tasks match your filters"} />
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>

          {/* Desktop Table Header — hidden on mobile via inline style + JS width check */}
          <style>{`
            .task-table-header { display: grid; }
            .task-row-desktop { display: grid; }
            .task-row-mobile { display: none; }
            @media (max-width: 640px) {
              .task-table-header { display: none !important; }
              .task-row-desktop { display: none !important; }
              .task-row-mobile { display: flex !important; }
            }
          `}</style>

          {/* Desktop Header */}
          <div
            className="task-table-header"
            style={{
              gridTemplateColumns: "40px 1fr 120px 100px 180px 80px",
              gap: 12, padding: "12px 16px",
              background: "var(--surface2)", borderBottom: "1px solid var(--border)",
              fontSize: 11, fontWeight: 600, color: "var(--text3)",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}
          >
            <div></div>
            <div>Task</div>
            <div>Due Date</div>
            <div>Priority</div>
            <div>Project</div>
            <div style={{ textAlign: "center" }}>Archive</div>
          </div>

          {filtered.map((task) => {
            const isDone = task.status === "done";
            const due = formatDue(task.dueDate);
            const projName = (task as any).projectName ?? getProjectName(task.projectId) ?? "—";

            return (
              <div key={task._id} style={{ borderBottom: "1px solid var(--border)" }}>

                {/* ── DESKTOP ROW ── */}
                <div
                  className="task-row-desktop"
                  style={{
                    gridTemplateColumns: "40px 1fr 120px 100px 180px 80px",
                    gap: 12, padding: "14px 16px",
                    alignItems: "center", opacity: isDone ? 0.6 : 1,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <StatusBtn isDone={isDone} onClick={() => cycleStatus(task)} />
                  <TaskTitle title={task.title} notes={task.notes} isDone={isDone} />
                  <div style={{ fontSize: 12, color: due?.color ?? "var(--text3)" }}>{due?.label ?? "—"}</div>
                  <div>{task.priority ? <PriBadge p={task.priority} /> : <span style={{ fontSize: 12, color: "var(--text3)" }}>—</span>}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{projName}</div>
                  <ArchiveDelete
                    archived={task.archived ?? false}
                    onArchive={() => toggleArchive(task._id, task.archived ?? false)}
                    onDelete={() => { if (confirm(`Delete "${task.title}"?`)) removeTask({ id: task._id }); }}
                  />
                </div>

                {/* ── MOBILE CARD ── */}
                <div
                  className="task-row-mobile"
                  style={{
                    flexDirection: "column", gap: 0,
                    padding: "14px 16px", opacity: isDone ? 0.6 : 1,
                  }}
                >
                  {/* Row 1: checkbox + title */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ paddingTop: 2, flexShrink: 0 }}>
                      <StatusBtn isDone={isDone} onClick={() => cycleStatus(task)} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 500,
                        textDecoration: isDone ? "line-through" : "none",
                        color: isDone ? "var(--text3)" : "var(--text)",
                        wordBreak: "break-word",
                      }}>
                        {task.title}
                      </div>
                      {task.notes && (
                        <div style={{
                          fontSize: 12, color: "var(--text3)", marginTop: 4,
                          wordBreak: "break-word", lineHeight: 1.4,
                        }}>
                          {task.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: meta chips */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, marginLeft: 32, alignItems: "center" }}>
                    {due && (
                      <span style={{ fontSize: 11, color: due.color, fontWeight: 500 }}>{due.label}</span>
                    )}
                    {task.priority && <PriBadge p={task.priority} />}
                    {projName && projName !== "—" && (
                      <span style={{ fontSize: 11, color: "var(--text3)", background: "var(--surface2)", padding: "2px 8px", borderRadius: 99 }}>
                        {projName}
                      </span>
                    )}
                    {(task as any).areaName && (task as any).areaName !== "—" && (
                      <span style={{ fontSize: 11, color: "var(--text3)", background: "var(--surface2)", padding: "2px 8px", borderRadius: 99 }}>
                        {(task as any).areaName}
                      </span>
                    )}
                    {/* Archive + Delete inline */}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                      <ArchiveDelete
                        archived={task.archived ?? false}
                        onArchive={() => toggleArchive(task._id, task.archived ?? false)}
                        onDelete={() => { if (confirm(`Delete "${task.title}"?`)) removeTask({ id: task._id }); }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBtn({ isDone, onClick }: { isDone: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 20, height: 20, borderRadius: "50%",
        border: isDone ? "none" : "2px solid var(--border2)",
        background: isDone ? "var(--done)" : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", flexShrink: 0,
      }}
    >
      {isDone && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
    </button>
  );
}

function TaskTitle({ title, notes, isDone }: { title: string; notes?: string; isDone: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 14, fontWeight: 500,
        textDecoration: isDone ? "line-through" : "none",
        color: isDone ? "var(--text3)" : "var(--text)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {title}
      </div>
      {notes && (
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {notes}
        </div>
      )}
    </div>
  );
}

function ArchiveDelete({ archived, onArchive, onDelete }: { archived: boolean; onArchive: () => void; onDelete: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
      <label style={{ display: "flex", cursor: "pointer", margin: 0, padding: 0 }}>
        <input
          type="checkbox"
          checked={archived}
          onChange={(e) => { e.stopPropagation(); onArchive(); }}
          style={{ cursor: "pointer", width: 16, height: 16, margin: 0, padding: 0 }}
        />
      </label>
      <button
        onClick={onDelete}
        style={{
          background: "rgba(247,112,106,0.1)", border: "1px solid rgba(247,112,106,0.3)",
          color: "var(--high)", cursor: "pointer", padding: "4px 6px", borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        title="Delete task"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}

function PriBadge({ p }: { p: string }) {
  const m: Record<string, [string, string, string]> = {
    high: ["rgba(247,112,106,0.15)", "var(--high)", "🔴 High"],
    med: ["rgba(247,193,106,0.15)", "var(--med)", "🟡 Med"],
    low: ["rgba(106,247,184,0.15)", "var(--low)", "🟢 Low"],
  };
  const [bg, color, label] = m[p] ?? ["var(--surface2)", "var(--text2)", p];
  return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: bg, color, fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>;
}
