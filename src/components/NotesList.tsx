"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Btn, Modal, FormGroup, Input, Textarea, Empty, VoiceButton } from "./ui";

// Public export — routes to correct subcomponent to avoid conditional hooks
export function NotesList({ projectId, areaId, userId }: {
  projectId: Id<"projects">; areaId?: Id<"areas">; userId: string;
}) {
  if (areaId) return <AreaNotesList projectId={projectId} areaId={areaId} userId={userId} />;
  return <ProjectNotesList projectId={projectId} userId={userId} />;
}

function ProjectNotesList({ projectId, userId }: { projectId: Id<"projects">; userId: string }) {
  const notes = useQuery(api.content.listNotesByProject, { projectId });
  // Only notes that belong directly to the project (no areaId)
  const filtered = (notes ?? []).filter((n) => !n.areaId);
  return <NotesUI notes={filtered} userId={userId} projectId={projectId} areaId={undefined} />;
}

function AreaNotesList({ projectId, areaId, userId }: {
  projectId: Id<"projects">; areaId: Id<"areas">; userId: string;
}) {
  const notes = useQuery(api.content.listNotesByArea, { areaId });
  // Only notes that belong to this specific area
  const filtered = (notes ?? []).filter((n) => n.areaId === areaId);
  return <NotesUI notes={filtered} userId={userId} projectId={projectId} areaId={areaId} />;
}

function NotesUI({ notes, userId, projectId, areaId }: {
  notes: any[]; userId: string;
  projectId: Id<"projects">; areaId?: Id<"areas">;
}) {
  const createNote = useMutation(api.content.createNote);
  const updateNote = useMutation(api.content.updateNote);
  const removeNote = useMutation(api.content.removeNote);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<Id<"notes"> | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const openNew = () => { setTitle(""); setContent(""); setEditId(null); setShowModal(true); };
  const openEdit = (note: any) => {
    setTitle(note.title); setContent(note.content ?? ""); setEditId(note._id); setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    if (editId) {
      await updateNote({ id: editId, title: title.trim(), content: content.trim() || undefined });
    } else {
      await createNote({ userId, projectId, areaId, title: title.trim(), content: content.trim() || undefined });
    }
    setSaving(false); setShowModal(false);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      {notes.length === 0 ? (
        <Empty emoji="📝" title="No notes yet" subtitle="Capture ideas, decisions, or context" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {notes.map((note) => {
            const isExpanded = expanded.has(note._id);
            return (
              <div key={note._id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                <div onClick={() => toggleExpand(note._id)} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{note.title}</span>
                  <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(note)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 4, borderRadius: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => removeNote({ id: note._id })} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 4, borderRadius: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" style={{ transform: `rotate(${isExpanded ? 90 : 0}deg)`, transition: "transform 0.2s", flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
                {isExpanded && note.content && (
                  <div style={{ padding: "10px 16px 14px", fontSize: 13, color: "var(--text2)", lineHeight: 1.6, borderTop: "1px solid var(--border)", whiteSpace: "pre-wrap" }}>
                    {note.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Btn variant="secondary" size="sm" onClick={openNew}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Note
      </Btn>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? "Edit Note" : "New Note"}
        footer={<>
          <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving || !title.trim()}>{editId ? "Save Changes" : "Add Note"}</Btn>
        </>}
      >
        <FormGroup label="Title">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Input value={title} onChange={setTitle} placeholder="Note title" autoFocus />
            <VoiceButton onTranscript={(t) => setTitle((p) => p ? p + " " + t : t)} />
          </div>
        </FormGroup>
        <FormGroup label="Content">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <VoiceButton onTranscript={(t) => setContent((p) => p ? p + " " + t : t)} />
            </div>
            <Textarea value={content} onChange={setContent} placeholder="Your note…" rows={6} />
          </div>
        </FormGroup>
      </Modal>
    </div>
  );
}
