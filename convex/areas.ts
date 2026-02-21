import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("areas")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { userId, projectId, name, description }) => {
    return await ctx.db.insert("areas", {
      userId,
      projectId,
      name,
      description,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("areas"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, description }) => {
    await ctx.db.patch(id, { name, description });
  },
});

export const remove = mutation({
  args: { id: v.id("areas") },
  handler: async (ctx, { id }) => {
    const tasks = await ctx.db.query("tasks").withIndex("by_area", (q) => q.eq("areaId", id)).collect();
    for (const task of tasks) await ctx.db.delete(task._id);
    const notes = await ctx.db.query("notes").withIndex("by_area", (q) => q.eq("areaId", id)).collect();
    for (const note of notes) await ctx.db.delete(note._id);
    const resources = await ctx.db.query("resources").withIndex("by_area", (q) => q.eq("areaId", id)).collect();
    for (const resource of resources) await ctx.db.delete(resource._id);
    await ctx.db.delete(id);
  },
});
