"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { View } from "./AppShell";
import { Btn, Card, Modal, FormGroup, Input, Textarea, Empty, ProgressBar } from "./ui";

export function ProjectsView({ userId, onNavigate }: { userId: string; onNavigate: (v: View) => void }) {
  const projects = useQuery(api.projects.list, { userId });
  const createProject = useMutation(api.projects.create);
  const removeProject = useMutation(api.projects.remove);
  const allTasks = useQuery(api.tasks.listByUser, { userId });

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await createProject({ userId, name: name.trim(), description: desc.trim() || undefined });
    setName(""); setDesc(""); setShowModal(false); setSaving(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: Id<"projects">) => {
    e.stopPropagation();
    if (!confirm("Delete this project and all its data?")) return;
    await removeProject({ id });
  };

  const tasksByProject = (projectId: Id<"projects">) =>
    allTasks?.filter((t) => t.projectId === projectId) ?? [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>{projects?.length ?? 0} projects</p>
        <Btn onClick={() => setShowModal(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Project
        </Btn>
      </div>

      {projects?.length === 0 ? (
        <Empty emoji="📁" title="No projects yet" subtitle="Create your first project to get started" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {projects?.map((p) => {
            const tasks = tasksByProject(p._id);
            const done = tasks.filter((t) => t.status === "done").length;
            return (
              <Card key={p._id} onClick={() => onNavigate({ type: "project", projectId: p._id })}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-glow)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{p.name}</h3>
                      {p.description && <p style={{ fontSize: 12.5, color: "var(--text2)" }}>{p.description}</p>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, p._id)}
                    style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 4, borderRadius: 6, opacity: 0, transition: "opacity 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <StatBadge label={`${tasks.length} tasks`} />
                </div>
                {tasks.length > 0 && (
                  <>
                    <ProgressBar value={done} max={tasks.length} />
                    <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                      {Math.round((done / tasks.length) * 100)}% complete · {done}/{tasks.length} done
                    </p>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Project"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={saving || !name.trim()}>Create Project</Btn>
          </>
        }
      >
        <FormGroup label="Project Name *">
          <Input value={name} onChange={setName} placeholder="My Project" autoFocus />
        </FormGroup>
        <FormGroup label="Description">
          <Textarea value={desc} onChange={setDesc} placeholder="What is this project about?" rows={2} />
        </FormGroup>
      </Modal>
    </div>
  );
}

function StatBadge({ label }: { label: string }) {
  return (
    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border2)" }}>
      {label}
    </span>
  );
}
