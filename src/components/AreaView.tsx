"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { View } from "./AppShell";
import { Btn, Modal, FormGroup, Input, Textarea, Select, Empty, ProgressBar, Breadcrumb, Tabs, VoiceButton } from "./ui";
import { NotesList } from "./NotesList";
import { ResourcesList } from "./ResourcesList";

type TaskStatus = "todo" | "inprog" | "done";
type Priority = "high" | "med" | "low";

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = { todo: "inprog", inprog: "done", done: "todo" };

export function AreaView({ areaId, projectId, userId, onNavigate }: {
  areaId: Id<"areas">; projectId: Id<"projects">; userId: string; onNavigate: (v: View) => void;
}) {
  const projects = useQuery(api.projects.list, { userId });
  const project = projects?.find((p) => p._id === projectId);
  const areas = useQuery(api.areas.list, { projectId });
  const area = areas?.find((a) => a._id === areaId);
  const tasks = useQuery(api.tasks.listByArea, { areaId });
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);

  const [tab, setTab] = useState("tasks");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Id<"tasks"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority | "">("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");

  const openNew = () => {
    setTitle(""); setNotes(""); setStatus("todo"); setPriority(""); setDueDate(""); setTags("");
    setEditTask(null); setShowModal(true);
  };

  const openEdit = (task: any) => {
    setTitle(task.title); setNotes(task.notes ?? ""); setStatus(task.status ?? "todo");
    setPriority(task.priority ?? ""); setDueDate(task.dueDate ?? "");
    setTags((task.tags ?? []).join(", "));
    setEditTask(task._id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: title.trim(), notes: notes.trim() || undefined,
      status, priority: (priority as Priority) || undefined,
      dueDate: dueDate || undefined, tags: tagList.length ? tagList : undefined,
    };
    if (editTask) {
      await updateTask({ id: editTask, ...payload });
    } else {
      await createTask({ userId, projectId, areaId, ...payload });
    }
    setSaving(false); setShowModal(false);
  };

  const cycleStatus = async (task: any) => {
    await updateTask({ id: task._id, status: STATUS_CYCLE[task.status as TaskStatus] ?? "todo" });
  };

  const toggleArchive = async (taskId: Id<"tasks">, currentArchived: boolean) => {
    await updateTask({ id: taskId, archived: !currentArchived });
  };

  const activeTasks = (tasks ?? []).filter((t) => !t.archived);
  const archivedTasks = (tasks ?? []).filter((t) => t.archived);
  const displayTasks = showArchived ? archivedTasks : activeTasks;

  const done = activeTasks.filter((t) => t.status === "done").length;
  const total = activeTasks.length;

  if (!area) return null;

  return (
    <div>
      <Breadcrumb items={[
        { label: "Projects", onClick: () => onNavigate({ type: "projects" }) },
        { label: project?.name ?? "Project", onClick: () => onNavigate({ type: "project", projectId }) },
        { label: area.name },
      ]} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{area.name}</h2>
          {area.description && <p style={{ fontSize: 13, color: "var(--text2)" }}>{area.description}</p>}
        </div>
        {total > 0 && (
          <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, background: "rgba(106,247,184,0.12)", color: "var(--done)", border: "1px solid rgba(106,247,184,0.3)", flexShrink: 0 }}>
            {done}/{total} done
          </span>
        )}
      </div>

      {total > 0 && <div style={{ marginBottom: 18 }}><ProgressBar value={done} max={total} /></div>}

      <Tabs
        tabs={[
          { id: "tasks", label: "Tasks", count: total },
          { id: "notes", label: "Notes" },
          { id: "resources", label: "Resources" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "tasks" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="secondary" size="sm" onClick={openNew}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Task
              </Btn>
              {archivedTasks.length > 0 && (
                <Btn variant="ghost" size="sm" onClick={() => setShowArchived(!showArchived)}>
                  {showArchived ? "Show Active" : `Show Archived (${archivedTasks.length})`}
                </Btn>
              )}
            </div>
          </div>

          {displayTasks.length === 0 ? (
            <Empty emoji="✅" title={showArchived ? "No archived tasks" : "No tasks yet"} subtitle={showArchived ? "" : "Add your first task above"} />
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              {/* Table Header */}
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 200px 200px 80px", gap: 12, padding: "12px 16px", background: "var(--surface2)", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <div></div>
                <div>Task</div>
                <div>Due Date</div>
                <div>Priority</div>
                <div>Project</div>
                <div>Area</div>
                <div style={{ textAlign: "center" }}>Archive</div>
              </div>

              {/* Table Rows */}
              {displayTasks.map((task) => {
                const isDone = task.status === "done";
                const due = task.dueDate ? formatDue(task.dueDate) : null;
                return (
                  <div
                    key={task._id}
                    style={{
                      display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 200px 200px 80px", gap: 12,
                      padding: "14px 16px", borderBottom: "1px solid var(--border)",
                      alignItems: "center", opacity: isDone ? 0.6 : 1,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Status checkbox */}
                    <button
                      onClick={() => cycleStatus(task)}
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: isDone ? "none" : "2px solid var(--border2)",
                        background: isDone ? "var(--done)" : "transparent",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {isDone && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </button>

                    {/* Task title */}
                    <div style={{ minWidth: 0 }}>
                      <div
                        onClick={() => openEdit(task)}
                        style={{
                          fontSize: 14, fontWeight: 500, cursor: "pointer",
                          textDecoration: isDone ? "line-through" : "none",
                          color: isDone ? "var(--text3)" : "var(--text)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                      >
                        {task.title}
                      </div>
                      {task.notes && (
                        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {task.notes}
                        </div>
                      )}
                    </div>

                    {/* Due date */}
                    <div style={{ fontSize: 12, color: due?.color ?? "var(--text3)" }}>
                      {due?.label ?? "—"}
                    </div>

                    {/* Priority */}
                    <div>
                      {task.priority ? <PriorityBadge p={task.priority} /> : <span style={{ fontSize: 12, color: "var(--text3)" }}>—</span>}
                    </div>

                    {/* Project */}
                    <div style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {project?.name ?? "—"}
                    </div>

                    {/* Area */}
                    <div style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {area.name}
                    </div>

                    {/* Archive checkbox */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
                      <label style={{ display: "flex", cursor: "pointer", margin: 0, padding: 0 }}>
                        <input
                          type="checkbox"
                          checked={task.archived ?? false}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleArchive(task._id, task.archived ?? false);
                          }}
                          style={{ cursor: "pointer", width: 16, height: 16, margin: 0, padding: 0 }}
                        />
                      </label>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${task.title}"? This cannot be undone.`)) {
                            removeTask({ id: task._id });
                          }
                        }}
                        style={{ 
                          background: "rgba(247,112,106,0.1)", 
                          border: "1px solid rgba(247,112,106,0.3)", 
                          color: "var(--high)", 
                          cursor: "pointer", 
                          padding: "4px 6px", 
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        title="Delete task"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "notes" && <NotesList projectId={projectId} areaId={areaId} userId={userId} />}
      {tab === "resources" && <ResourcesList projectId={projectId} areaId={areaId} userId={userId} />}

      {/* Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTask ? "Edit Task" : "New Task"}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving || !title.trim()}>{editTask ? "Save Changes" : "Add Task"}</Btn>
          </>
        }
      >
        <FormGroup label="Task Title *">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Input value={title} onChange={setTitle} placeholder="What needs to be done?" autoFocus />
            <VoiceButton onTranscript={(t) => setTitle((prev) => prev ? prev + " " + t : t)} />
          </div>
        </FormGroup>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FormGroup label="Priority">
            <Select value={priority} onChange={(v) => setPriority(v as Priority | "")}>
              <option value="">None</option>
              <option value="high">🔴 High</option>
              <option value="med">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </Select>
          </FormGroup>
          <FormGroup label="Status">
            <Select value={status} onChange={(v) => setStatus(v as TaskStatus)}>
              <option value="todo">To Do</option>
              <option value="inprog">In Progress</option>
              <option value="done">Done</option>
            </Select>
          </FormGroup>
        </div>
        <FormGroup label="Due Date">
          <Input type="date" value={dueDate} onChange={setDueDate} />
        </FormGroup>
        <FormGroup label="Tags (comma-separated)">
          <Input value={tags} onChange={setTags} placeholder="client, urgent, waiting…" />
        </FormGroup>
        <FormGroup label="Notes">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <VoiceButton onTranscript={(t) => setNotes((prev) => prev ? prev + " " + t : t)} />
            </div>
            <Textarea value={notes} onChange={setNotes} placeholder="Additional context…" rows={2} />
          </div>
        </FormGroup>
      </Modal>
    </div>
  );
}

function formatDue(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, color: "var(--high)" };
  if (diff === 0) return { label: "Today", color: "var(--med)" };
  if (diff === 1) return { label: "Tomorrow", color: "var(--text2)" };
  return { label: date.toLocaleDateString("en", { month: "short", day: "numeric" }), color: "var(--text3)" };
}

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, [string, string]> = { high: ["rgba(247,112,106,0.15)", "var(--high)"], med: ["rgba(247,193,106,0.15)", "var(--med)"], low: ["rgba(106,247,184,0.15)", "var(--low)"] };
  const [bg, color] = map[p] ?? ["var(--surface2)", "var(--text2)"];
  const labels: Record<string, string> = { high: "🔴 High", med: "🟡 Med", low: "🟢 Low" };
  return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: bg, color, fontWeight: 500, whiteSpace: "nowrap" }}>{labels[p]}</span>;
}
