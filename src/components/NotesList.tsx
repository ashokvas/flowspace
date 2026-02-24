"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Btn, Modal, FormGroup, Input, Textarea, Empty, VoiceButton } from "./ui";

// ── File type helpers ──────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileColor(type: string, name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (type.startsWith("image/")) return "var(--accent2)";
  if (type === "application/pdf") return "var(--high)";
  if (["doc","docx","odt","pages"].includes(ext)) return "#4A9EFF";
  if (["xls","xlsx","ods","numbers","csv"].includes(ext)) return "var(--done)";
  if (["ppt","pptx","odp","key"].includes(ext)) return "var(--med)";
  if (["zip","tar","gz","rar","7z"].includes(ext)) return "var(--text3)";
  const codeExts = ["js","ts","tsx","jsx","py","rb","go","rs","java","c","cpp","cs","php","swift","kt","sh","html","css","json","yml","yaml","sql","md"];
  if (codeExts.includes(ext)) return "var(--low)";
  return "var(--text2)";
}

function FileTypeIcon({ type, name }: { type: string; name: string }) {
  const color = getFileColor(type, name);
  const ext = name.split(".").pop()?.toLowerCase() ?? "";

  if (type.startsWith("image/")) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    );
  }
  if (type === "application/pdf" || ext === "pdf") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    );
  }
  const codeExts = ["js","ts","tsx","jsx","py","rb","go","rs","java","c","cpp","cs","php","swift","kt","sh","html","css","json","yml","yaml","sql","md"];
  if (codeExts.includes(ext)) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

// ── Pending file pill (before note is saved) ───────────────────────────────

function PendingFilePill({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith("image/");
  const [preview, setPreview] = useState<string | null>(null);

  if (isImage && !preview) {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "5px 8px 5px 6px", borderRadius: 8,
      background: "var(--surface2)", border: "1px solid var(--border2)",
      fontSize: 12, maxWidth: 180,
    }}>
      {isImage && preview ? (
        <img src={preview} alt="" style={{ width: 20, height: 20, borderRadius: 3, objectFit: "cover" }} />
      ) : (
        <FileTypeIcon type={file.type} name={file.name} />
      )}
      <span style={{ flex: 1, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {file.name}
      </span>
      <span style={{ color: "var(--text3)", flexShrink: 0 }}>{formatBytes(file.size)}</span>
      <button onClick={onRemove} style={{
        background: "none", border: "none", color: "var(--text3)", cursor: "pointer",
        padding: 0, display: "flex", flexShrink: 0,
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ── Saved attachment pill (after note is saved) ────────────────────────────

function SavedFilePill({ attachment, noteId }: {
  attachment: { storageId: string; name: string; type: string; size: number };
  noteId: Id<"notes">;
}) {
  const fileUrl = useQuery(api.content.getFileUrl, { storageId: attachment.storageId });
  const removeAttachment = useMutation(api.content.removeAttachmentFromNote);
  const [removing, setRemoving] = useState(false);
  const isImage = attachment.type.startsWith("image/");

  if (isImage) {
    return (
      <div style={{ position: "relative", display: "inline-block", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border2)" }}>
        {fileUrl ? (
          <img src={fileUrl} alt={attachment.name} style={{ display: "block", maxWidth: 260, maxHeight: 200, objectFit: "cover", borderRadius: 10 }} />
        ) : (
          <div style={{ width: 120, height: 80, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        {/* Hover overlay with filename + actions */}
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "6px 8px", opacity: 0, transition: "opacity 0.15s",
          borderRadius: 10,
        }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {attachment.name}
          </span>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {fileUrl && (
              <a href={fileUrl} download={attachment.name} target="_blank" rel="noopener noreferrer"
                style={{ color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 3, fontSize: 10 }} title="Download">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </a>
            )}
            <button
              onClick={async () => { setRemoving(true); await removeAttachment({ noteId, storageId: attachment.storageId }); }}
              disabled={removing}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3, fontSize: 10, opacity: removing ? 0.4 : 1 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "5px 8px 5px 6px", borderRadius: 8,
      background: "var(--surface2)", border: "1px solid var(--border2)",
      fontSize: 12, maxWidth: 200,
    }}>
      <FileTypeIcon type={attachment.type} name={attachment.name} />
      <span style={{ flex: 1, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        title={attachment.name}>
        {attachment.name}
      </span>
      <span style={{ color: "var(--text3)", flexShrink: 0 }}>{formatBytes(attachment.size)}</span>
      {fileUrl && (
        <a href={fileUrl} download={attachment.name} target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--text3)", display: "flex", flexShrink: 0 }} title="Download">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </a>
      )}
      <button
        onClick={async () => { setRemoving(true); await removeAttachment({ noteId, storageId: attachment.storageId }); }}
        disabled={removing}
        style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0, opacity: removing ? 0.4 : 1 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ── Drop zone + file input ─────────────────────────────────────────────────

function DropZone({ pendingFiles, onFiles, onRemovePending }: {
  pendingFiles: File[];
  onFiles: (files: File[]) => void;
  onRemovePending: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  const hasPending = pendingFiles.length > 0;

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border2)"}`,
          borderRadius: 10,
          padding: hasPending ? "10px 12px" : "18px 12px",
          background: dragOver ? "var(--accent-glow)" : "var(--surface2)",
          cursor: "pointer",
          transition: "all 0.15s",
          textAlign: "center",
        }}
      >
        {!hasPending && (
          <>
            <div style={{ marginBottom: 6, opacity: 0.5 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="1.5" style={{ display: "inline-block" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text2)", margin: 0, fontWeight: 500 }}>
              Drop files here
            </p>
            <p style={{ fontSize: 11.5, color: "var(--text3)", margin: "3px 0 0" }}>
              or <span style={{ color: "var(--accent2)" }}>browse</span> — images, docs, code, anything
            </p>
          </>
        )}
        {hasPending && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {pendingFiles.map((f, i) => (
                <div key={i} onClick={(e) => e.stopPropagation()}>
                  <PendingFilePill file={f} onRemove={() => onRemovePending(i)} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--text3)", margin: 0 }}>
              Drop more or <span style={{ color: "var(--accent2)" }}>browse</span> to add
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── Public export ──────────────────────────────────────────────────────────

export function NotesList({ projectId, areaId, userId }: {
  projectId: Id<"projects">; areaId?: Id<"areas">; userId: string;
}) {
  if (areaId) return <AreaNotesList projectId={projectId} areaId={areaId} userId={userId} />;
  return <ProjectNotesList projectId={projectId} userId={userId} />;
}

function ProjectNotesList({ projectId, userId }: { projectId: Id<"projects">; userId: string }) {
  const notes = useQuery(api.content.listNotesByProject, { projectId });
  const filtered = (notes ?? []).filter((n) => !n.areaId);
  return <NotesUI notes={filtered} userId={userId} projectId={projectId} areaId={undefined} />;
}

function AreaNotesList({ projectId, areaId, userId }: {
  projectId: Id<"projects">; areaId: Id<"areas">; userId: string;
}) {
  const notes = useQuery(api.content.listNotesByArea, { areaId });
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
  const generateUploadUrl = useMutation(api.content.generateUploadUrl);
  const attachFile = useMutation(api.content.attachFileToNote);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<Id<"notes"> | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const openNew = () => {
    setTitle(""); setContent(""); setEditId(null);
    setPendingFiles([]); setUploadStatus("");
    setShowModal(true);
  };

  const openEdit = (note: any) => {
    setTitle(note.title); setContent(note.content ?? "");
    setEditId(note._id); setPendingFiles([]); setUploadStatus("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    let noteId: Id<"notes">;
    if (editId) {
      await updateNote({ id: editId, title: title.trim(), content: content.trim() || undefined });
      noteId = editId;
    } else {
      noteId = await createNote({ userId, projectId, areaId, title: title.trim(), content: content.trim() || undefined });
    }
    if (pendingFiles.length > 0) {
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        setUploadStatus(`Uploading ${i + 1}/${pendingFiles.length}…`);
        try {
          const uploadUrl = await generateUploadUrl();
          const res = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
          });
          const { storageId } = await res.json();
          await attachFile({ noteId, storageId, name: file.name, type: file.type || "application/octet-stream", size: file.size });
        } catch (err) {
          console.error("Upload failed for", file.name, err);
        }
      }
    }
    setSaving(false); setUploadStatus(""); setShowModal(false);
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
            const attachments = note.attachments ?? [];
            return (
              <div key={note._id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                <div onClick={() => toggleExpand(note._id)} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{note.title}</span>
                  {attachments.length > 0 && (
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                      </svg>
                      {attachments.length}
                    </span>
                  )}
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
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {note.content && (
                      <div style={{ padding: "10px 16px", fontSize: 13, color: "var(--text2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {note.content}
                      </div>
                    )}
                    {attachments.length > 0 && (
                      <div style={{ padding: "10px 16px 14px", borderTop: note.content ? "1px solid var(--border)" : undefined }}>
                        <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                          </svg>
                          FILES
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {attachments.map((att: any) => (
                            <SavedFilePill key={att.storageId} attachment={att} noteId={note._id} />
                          ))}
                        </div>
                      </div>
                    )}
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "Edit Note" : "New Note"}
        footer={<>
          <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? (uploadStatus || "Saving…") : (editId ? "Save Changes" : "Add Note")}
          </Btn>
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
        <FormGroup label="Attachments">
          <DropZone
            pendingFiles={pendingFiles}
            onFiles={(files) => setPendingFiles((prev) => [...prev, ...files])}
            onRemovePending={(index) => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
          />
          {editId && (() => {
            const note = notes.find((n) => n._id === editId);
            const saved = note?.attachments ?? [];
            return saved.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>Already attached:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {saved.map((att: any) => (
                    <SavedFilePill key={att.storageId} attachment={att} noteId={editId} />
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </FormGroup>
      </Modal>
    </div>
  );
}
