import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Notes ──────────────────────────────────────────────────────────────────

export const listNotesByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const listNotesByArea = query({
  args: { areaId: v.id("areas") },
  handler: async (ctx, { areaId }) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_area", (q) => q.eq("areaId", areaId))
      .order("desc")
      .collect();
  },
});

export const createNote = mutation({
  args: {
    userId: v.string(),
    projectId: v.id("projects"),
    areaId: v.optional(v.id("areas")),
    title: v.string(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", { ...args, createdAt: Date.now() });
  },
});

export const updateNote = mutation({
  args: {
    id: v.id("notes"),
    title: v.string(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, { id, title, content }) => {
    await ctx.db.patch(id, { title, content });
  },
});

export const removeNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ── Resources ──────────────────────────────────────────────────────────────

export const listResourcesByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("resources")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const listResourcesByArea = query({
  args: { areaId: v.id("areas") },
  handler: async (ctx, { areaId }) => {
    return await ctx.db
      .query("resources")
      .withIndex("by_area", (q) => q.eq("areaId", areaId))
      .order("desc")
      .collect();
  },
});

export const createResource = mutation({
  args: {
    userId: v.string(),
    projectId: v.id("projects"),
    areaId: v.optional(v.id("areas")),
    title: v.string(),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("resources", { ...args, createdAt: Date.now() });
  },
});

export const updateResource = mutation({
  args: {
    id: v.id("resources"),
    title: v.string(),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, title, url, description }) => {
    await ctx.db.patch(id, { title, url, description });
  },
});

export const removeResource = mutation({
  args: { id: v.id("resources") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});


// ── Note File Attachments ──────────────────────────────────────────────────

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const attachFileToNote = mutation({
  args: {
    noteId: v.id("notes"),
    storageId: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note) throw new Error("Note not found");
    await ctx.db.patch(args.noteId, {
      attachments: [
        ...(note.attachments ?? []),
        { storageId: args.storageId, name: args.name, type: args.type, size: args.size, uploadedAt: Date.now() },
      ],
    });
  },
});

export const removeAttachmentFromNote = mutation({
  args: { noteId: v.id("notes"), storageId: v.string() },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note) throw new Error("Note not found");
    await ctx.storage.delete(args.storageId as any);
    await ctx.db.patch(args.noteId, {
      attachments: (note.attachments ?? []).filter((a) => a.storageId !== args.storageId),
    });
  },
});

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId as any);
  },
});
