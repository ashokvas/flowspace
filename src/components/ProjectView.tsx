"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { View } from "./AppShell";
import { Btn, IconBtn, Card, Modal, FormGroup, Input, Textarea, Empty, ProgressBar, Breadcrumb, Tabs } from "./ui";
import { NotesList } from "./NotesList";
import { ResourcesList } from "./ResourcesList";

export function ProjectView({ projectId, userId, onNavigate }: {
  projectId: Id<"projects">; userId: string; onNavigate: (v: View) => void;
}) {
  const project = useQuery(api.projects.list, { userId })?.find((p) => p._id === projectId);
  const areas = useQuery(api.areas.list, { projectId });
  const removeArea = useMutation(api.areas.remove);
  const createArea = useMutation(api.areas.create);
  const tasks = useQuery(api.tasks.listByUser, { userId });

  const [tab, setTab] = useState("areas");
  const [showModal, setShowModal] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [areaDesc, setAreaDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreateArea = async () => {
    if (!areaName.trim()) return;
    setSaving(true);
    await createArea({ userId, projectId, name: areaName.trim(), description: areaDesc.trim() || undefined });
    setAreaName(""); setAreaDesc(""); setShowModal(false); setSaving(false);
  };

  const handleDeleteArea = async (e: React.MouseEvent, id: Id<"areas">) => {
    e.stopPropagation();
    if (!confirm("Delete this area and all its tasks, notes, and resources?")) return;
    await removeArea({ id });
  };

  const areaTaskStats = (areaId: Id<"areas">) => {
    const t = tasks?.filter((t) => t.areaId === areaId) ?? [];
    return { total: t.length, done: t.filter((t) => t.status === "done").length };
  };

  if (!project) return null;

  const totalTasks = tasks?.filter((t) => t.projectId === projectId) ?? [];
  const doneTasks = totalTasks.filter((t) => t.status === "done");

  return (
    <div>
      <Breadcrumb items={[
        { label: "Projects", onClick: () => onNavigate({ type: "projects" }) },
        { label: project.name },
      ]} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{project.name}</h2>
          {project.description && <p style={{ fontSize: 13, color: "var(--text2)" }}>{project.description}</p>}
        </div>
        {totalTasks.length > 0 && (
          <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, background: "var(--accent-glow)", color: "var(--accent2)", border: "1px solid var(--accent)", flexShrink: 0 }}>
            {doneTasks.length}/{totalTasks.length} done
          </span>
        )}
      </div>

      {totalTasks.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <ProgressBar value={doneTasks.length} max={totalTasks.length} />
        </div>
      )}

      <Tabs
        tabs={[
          { id: "areas", label: "Areas", count: areas?.length ?? 0 },
          { id: "notes", label: "Notes" },
          { id: "resources", label: "Resources" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "areas" && (
        <div>
          {areas?.length === 0 ? (
            <Empty emoji="🗂️" title="No areas yet" subtitle="Areas group related work within a project" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {areas?.map((area) => {
                const { total, done } = areaTaskStats(area._id);
                return (
                  <div
                    key={area._id}
                    onClick={() => onNavigate({ type: "area", projectId, areaId: area._id })}
                    style={{
                      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
                      padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
                  >
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 600, fontSize: 14 }}>{area.name}</h4>
                      {area.description && <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{area.description}</p>}
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        <MiniTag>{total} tasks</MiniTag>
                      </div>
                      {total > 0 && <ProgressBar value={done} max={total} />}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                      {total > 0 && <span style={{ fontSize: 11, color: "var(--text3)" }}>{done}/{total}</span>}
                      <button
                        onClick={(e) => handleDeleteArea(e, area._id)}
                        style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 4, borderRadius: 6 }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                      </button>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <Btn variant="secondary" size="sm" onClick={() => setShowModal(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Area
            </Btn>
          </div>
        </div>
      )}

      {tab === "notes" && (
        <NotesList projectId={projectId} userId={userId} />
      )}

      {tab === "resources" && (
        <ResourcesList projectId={projectId} userId={userId} />
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Area"
        footer={
          <>
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleCreateArea} disabled={saving || !areaName.trim()}>Create Area</Btn>
          </>
        }
      >
        <FormGroup label="Area Name *">
          <Input value={areaName} onChange={setAreaName} placeholder="Design, Development, Marketing…" autoFocus />
        </FormGroup>
        <FormGroup label="Description">
          <Input value={areaDesc} onChange={setAreaDesc} placeholder="Short description" />
        </FormGroup>
      </Modal>
    </div>
  );
}

function MiniTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border2)" }}>
      {children}
    </span>
  );
}
