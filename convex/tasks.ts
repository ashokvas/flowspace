import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByArea = query({
  args: { areaId: v.id("areas") },
  handler: async (ctx, { areaId }) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_area", (q) => q.eq("areaId", areaId))
      .order("asc")
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    projectId: v.id("projects"),
    areaId: v.id("areas"),
    title: v.string(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("inprog"), v.literal("done")),
    priority: v.optional(v.union(v.literal("high"), v.literal("med"), v.literal("low"))),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.union(v.literal("todo"), v.literal("inprog"), v.literal("done"))),
    priority: v.optional(v.union(v.literal("high"), v.literal("med"), v.literal("low"))),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
