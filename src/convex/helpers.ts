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
  const { userId, user } = await requireAuth(ctx);
  if (user.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
  return { userId, user };
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
  adminUserId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string,
  oldValues?: string,
  newValues?: string,
) {
  await ctx.db.insert("adminAuditLogs", {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
