import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contents: defineTable({
    title: v.optional(v.string()),
    author: v.string(),
    prompt: v.string(),
    content: v.string(),
  }).index("by_author", ["author"]),
});
