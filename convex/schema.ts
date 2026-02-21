import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  areas: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  tasks: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    areaId: v.id("areas"),
    title: v.string(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("inprog"), v.literal("done")),
    priority: v.optional(v.union(v.literal("high"), v.literal("med"), v.literal("low"))),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    archived: v.optional(v.boolean()), 
   createdAt: v.number(),
  })
    .index("by_area", ["areaId"])
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  notes: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    areaId: v.optional(v.id("areas")),
    title: v.string(),
    content: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_area", ["areaId"])
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  resources: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    areaId: v.optional(v.id("areas")),
    title: v.string(),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_area", ["areaId"])
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),
});
