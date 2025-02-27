import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("contents")
      .withIndex("by_author", (q) => q.eq("author", identity.subject))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    prompt: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const board = await ctx.db.insert("contents", {
      title: args.title,
      author: identity.subject,
      prompt: args.prompt,
      content: args.content,
    });

    return board;
  },
});

export const getById = query({
  args: { contentId: v.id("contents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const content = await ctx.db.get(args.contentId);
    if (content && content.author !== identity.subject) {
      throw new Error("Not authenticated");
    }
    return content;
  },
});

export const updateContent = mutation({
  args: {
    content: v.optional(v.string()),
    id: v.id("contents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const content = await ctx.db.get(args.id);
    if (!content || content.author !== identity.subject) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.patch(args.id, {
      content: args.content || content.content,
    });
  },
});

export const updateTitle = mutation({
  args: {
    title: v.optional(v.string()),
    id: v.id("contents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const content = await ctx.db.get(args.id);
    if (!content || content.author !== identity.subject) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.patch(args.id, {
      title: args.title || content.title,
    });
  },
});

export const deleteContent = mutation({
  args: {
    id: v.id("contents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const content = await ctx.db.get(args.id);
    if (!content || content.author !== identity.subject) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.delete(args.id);
  },
});
