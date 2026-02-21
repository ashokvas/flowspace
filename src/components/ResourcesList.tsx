"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Btn, Modal, FormGroup, Input, Empty } from "./ui";

// Public export — routes to correct subcomponent to avoid conditional hooks
export function ResourcesList({ projectId, areaId, userId }: {
  projectId: Id<"projects">; areaId?: Id<"areas">; userId: string;
}) {
  if (areaId) return <AreaResourcesList projectId={projectId} areaId={areaId} userId={userId} />;
  return <ProjectResourcesList projectId={projectId} userId={userId} />;
}

function ProjectResourcesList({ projectId, userId }: { projectId: Id<"projects">; userId: string }) {
  const resources = useQuery(api.content.listResourcesByProject, { projectId });
  // Only resources that belong directly to the project (no areaId)
  const filtered = (resources ?? []).filter((r) => !r.areaId);
  return <ResourcesUI resources={filtered} userId={userId} projectId={projectId} areaId={undefined} />;
}

function AreaResourcesList({ projectId, areaId, userId }: {
  projectId: Id<"projects">; areaId: Id<"areas">; userId: string;
}) {
  const resources = useQuery(api.content.listResourcesByArea, { areaId });
  // Only resources that belong to this specific area
  const filtered = (resources ?? []).filter((r) => r.areaId === areaId);
  return <ResourcesUI resources={filtered} userId={userId} projectId={projectId} areaId={areaId} />;
}

function ResourcesUI({ resources, userId, projectId, areaId }: {
  resources: any[]; userId: string;
  projectId: Id<"projects">; areaId?: Id<"areas">;
}) {
  const createResource = useMutation(api.content.createResource);
  const updateResource = useMutation(api.content.updateResource);
  const removeResource = useMutation(api.content.removeResource);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<Id<"resources"> | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const openNew = () => { setTitle(""); setUrl(""); setDesc(""); setEditId(null); setShowModal(true); };
  const openEdit = (r: any) => {
    setTitle(r.title); setUrl(r.url ?? ""); setDesc(r.description ?? ""); setEditId(r._id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    if (editId) {
      await updateResource({ id: editId, title: title.trim(), url: url.trim() || undefined, description: desc.trim() || undefined });
    } else {
      await createResource({ userId, projectId, areaId, title: title.trim(), url: url.trim() || undefined, description: desc.trim() || undefined });
    }
    setSaving(false); setShowModal(false);
  };

  return (
    <div>
      {resources.length === 0 ? (
        <Empty emoji="🔗" title="No resources yet" subtitle="Add links, docs, or references" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {resources.map((r) => (
            <div key={r._id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(106,175,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--inprog)" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 500, color: "var(--accent2)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.title}
                  </a>
                ) : (
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.title}</div>
                )}
                {r.url && <div style={{ fontSize: 11, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.url}</div>}
                {r.description && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{r.description}</div>}
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 4, borderRadius: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => removeResource({ id: r._id })} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 4, borderRadius: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Btn variant="secondary" size="sm" onClick={openNew}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Resource
      </Btn>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit Resource" : "New Resource"}
        footer={<>
          <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving || !title.trim()}>{editId ? "Save Changes" : "Add Resource"}</Btn>
        </>}
      >
        <FormGroup label="Title *">
          <Input value={title} onChange={setTitle} placeholder="Resource name" autoFocus />
        </FormGroup>
        <FormGroup label="URL">
          <Input type="url" value={url} onChange={setUrl} placeholder="https://…" />
        </FormGroup>
        <FormGroup label="Description">
          <Input value={desc} onChange={setDesc} placeholder="Short description" />
        </FormGroup>
      </Modal>
    </div>
  );
}
