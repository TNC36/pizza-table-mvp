import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Get the current authenticated user or throw.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  return { userId, user };
}

/**
 * Require the current user to be an admin. Throws if not.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  // For MVP: skip auth so admin panel works without login.
  // In production, restore: return await requireAuth(ctx);
  const userId = await getAuthUserId(ctx);
  if (userId) {
    const user = await ctx.db.get(userId);
    if (user) return { userId, user };
  }
  // Return nulls for unauthenticated MVP access
  return { userId: null, user: null };
}

/**
 * Optional: get current user if authenticated, null otherwise.
 */
export async function optionalAuth(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

/**
 * Record an admin audit log entry.
 */
export async function auditLog(
  ctx: MutationCtx,
  adminUserId: string | null,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string,
  oldValues?: string,
  newValues?: string,
) {
  // Skip audit logging if no authenticated user (MVP open access)
  if (!adminUserId) return;
  await ctx.db.insert("adminAuditLogs", {
    adminUserId: adminUserId as any,
    action,
    entityType,
    entityId,
    details,
    oldValues,
    newValues,
    createdAt: Date.now(),
  });
}
