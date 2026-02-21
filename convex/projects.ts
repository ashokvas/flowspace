import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name, description }) => {
    return await ctx.db.insert("projects", {
      userId,
      name,
      description,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, description }) => {
    await ctx.db.patch(id, { name, description });
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    // Delete all areas, tasks, notes, resources in this project
    const areas = await ctx.db.query("areas").withIndex("by_project", (q) => q.eq("projectId", id)).collect();
    for (const area of areas) {
      const tasks = await ctx.db.query("tasks").withIndex("by_area", (q) => q.eq("areaId", area._id)).collect();
      for (const task of tasks) await ctx.db.delete(task._id);
      await ctx.db.delete(area._id);
    }
    const notes = await ctx.db.query("notes").withIndex("by_project", (q) => q.eq("projectId", id)).collect();
    for (const note of notes) await ctx.db.delete(note._id);
    const resources = await ctx.db.query("resources").withIndex("by_project", (q) => q.eq("projectId", id)).collect();
    for (const resource of resources) await ctx.db.delete(resource._id);
    await ctx.db.delete(id);
  },
});
