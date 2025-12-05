import { getDbConnection } from "./db";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  plan: string;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "invited" | "inactive";
  invited_by: string | null;
  joined_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentShare {
  id: string;
  pdf_summary_id: string;
  workspace_id: string;
  shared_by: string;
  permission: "view" | "comment" | "edit";
  created_at: Date;
  updated_at: Date;
}

export interface CollaborationSession {
  id: string;
  pdf_summary_id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  cursor_position: any;
  last_seen: Date;
  created_at: Date;
}

export interface DocumentComment {
  id: string;
  pdf_summary_id: string;
  workspace_id: string | null;
  user_id: string;
  user_email: string;
  user_name: string | null;
  content: string;
  position: any;
  resolved: boolean;
  parent_comment_id: string | null;
  created_at: Date;
  updated_at: Date;
}

// Workspace functions
export async function createWorkspace({
  name,
  description,
  ownerId,
  ownerEmail,
  ownerName,
  plan = "free",
}: {
  name: string;
  description?: string;
  ownerId: string;
  ownerEmail: string;
  ownerName?: string;
  plan?: string;
}) {
  const sql = await getDbConnection();

  // Create workspace
  const [workspace] = await sql`
    INSERT INTO workspaces (name, description, owner_id, plan)
    VALUES (${name}, ${description || null}, ${ownerId}, ${plan})
    RETURNING *
  `;

  // Add owner as workspace member
  await sql`
    INSERT INTO workspace_members (workspace_id, user_id, user_email, user_name, role, status)
    VALUES (${workspace.id}, ${ownerId}, ${ownerEmail}, ${ownerName || null}, 'owner', 'active')
  `;

  // Log activity
  await sql`
    INSERT INTO workspace_activities (workspace_id, user_id, user_email, user_name, action_type, action_description)
    VALUES (${workspace.id}, ${ownerId}, ${ownerEmail}, ${ownerName || null}, 'workspace_created', ${`Workspace "${name}" was created`})
  `;

  return workspace;
}

export async function getWorkspacesByUserId(userId: string) {
  const sql = await getDbConnection();

  const workspaces = await sql`
    SELECT w.*, wm.role, wm.status as member_status
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE wm.user_id = ${userId} AND wm.status = 'active'
    ORDER BY w.created_at DESC
  `;

  return workspaces;
}

export async function getWorkspaceById(workspaceId: string, userId: string) {
  const sql = await getDbConnection();

  const [workspace] = await sql`
    SELECT w.*, wm.role, wm.status as member_status
    FROM workspaces w
    INNER JOIN workspace_members wm ON w.id = wm.workspace_id
    WHERE w.id = ${workspaceId} AND wm.user_id = ${userId} AND wm.status = 'active'
  `;

  return workspace || null;
}

export async function getWorkspaceMembers(workspaceId: string) {
  const sql = await getDbConnection();

  const members = await sql`
    SELECT * FROM workspace_members
    WHERE workspace_id = ${workspaceId} AND status = 'active'
    ORDER BY 
      CASE role
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 3
        WHEN 'viewer' THEN 4
      END,
      joined_at ASC
  `;

  return members;
}

export async function inviteWorkspaceMember({
  workspaceId,
  userEmail,
  userName,
  role,
  invitedBy,
  invitedByName,
}: {
  workspaceId: string;
  userEmail: string;
  userName?: string;
  role: "admin" | "member" | "viewer";
  invitedBy: string;
  invitedByName?: string;
}) {
  const sql = await getDbConnection();

  // Check if user exists
  const [user] = await sql`SELECT * FROM users WHERE email = ${userEmail}`;
  
  if (!user) {
    throw new Error("User not found. They need to sign up first.");
  }

  // Check if already a member
  const [existing] = await sql`
    SELECT * FROM workspace_members
    WHERE workspace_id = ${workspaceId} AND user_id = ${user.id}::text
  `;

  if (existing) {
    throw new Error("User is already a member of this workspace");
  }

  // Add member
  const [member] = await sql`
    INSERT INTO workspace_members (workspace_id, user_id, user_email, user_name, role, status, invited_by)
    VALUES (${workspaceId}, ${user.id}::text, ${userEmail}, ${userName || user.full_name || null}, ${role}, 'active', ${invitedBy})
    RETURNING *
  `;

  // Log activity
  await sql`
    INSERT INTO workspace_activities (workspace_id, user_id, user_email, user_name, action_type, action_description, metadata)
    VALUES (${workspaceId}, ${invitedBy}, ${invitedByName || null}, ${invitedByName || null}, 'member_invited', ${`${userEmail} was invited as ${role}`}, ${JSON.stringify({ invited_user_email: userEmail, role })})
  `;

  return member;
}

export async function shareDocumentWithWorkspace({
  pdfSummaryId,
  workspaceId,
  sharedBy,
  permission = "view",
}: {
  pdfSummaryId: string;
  workspaceId: string;
  sharedBy: string;
  permission?: "view" | "comment" | "edit";
}) {
  const sql = await getDbConnection();

  const [share] = await sql`
    INSERT INTO document_shares (pdf_summary_id, workspace_id, shared_by, permission)
    VALUES (${pdfSummaryId}, ${workspaceId}, ${sharedBy}, ${permission})
    ON CONFLICT (pdf_summary_id, workspace_id) 
    DO UPDATE SET permission = ${permission}, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  // Log activity
  const [summary] = await sql`SELECT title FROM pdf_summaries WHERE id = ${pdfSummaryId}`;
  await sql`
    INSERT INTO workspace_activities (workspace_id, user_id, action_type, action_description, metadata)
    VALUES (${workspaceId}, ${sharedBy}, 'document_shared', ${`Document "${summary?.title || 'Untitled'}" was shared`}, ${JSON.stringify({ pdf_summary_id: pdfSummaryId })})
  `;

  return share;
}

export async function getSharedDocuments(workspaceId: string) {
  const sql = await getDbConnection();

  const documents = await sql`
    SELECT 
      ds.*,
      ps.id as summary_id,
      ps.title,
      ps.file_name,
      ps.original_file_url,
      ps.created_at as document_created_at,
      ps.user_id as document_owner_id
    FROM document_shares ds
    INNER JOIN pdf_summaries ps ON ds.pdf_summary_id = ps.id
    WHERE ds.workspace_id = ${workspaceId}
    ORDER BY ds.created_at DESC
  `;

  return documents;
}

export async function updateCollaborationSession({
  pdfSummaryId,
  userId,
  userEmail,
  userName,
  cursorPosition,
}: {
  pdfSummaryId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  cursorPosition?: any;
}) {
  const sql = await getDbConnection();

  const [session] = await sql`
    INSERT INTO collaboration_sessions (pdf_summary_id, user_id, user_email, user_name, cursor_position, last_seen)
    VALUES (${pdfSummaryId}, ${userId}, ${userEmail}, ${userName || null}, ${cursorPosition ? JSON.stringify(cursorPosition) : null}, CURRENT_TIMESTAMP)
    ON CONFLICT (pdf_summary_id, user_id)
    DO UPDATE SET 
      cursor_position = ${cursorPosition ? JSON.stringify(cursorPosition) : null},
      last_seen = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return session;
}

export async function getActiveCollaborators(pdfSummaryId: string, excludeUserId?: string) {
  const sql = await getDbConnection();

  const collaborators = await sql`
    SELECT * FROM collaboration_sessions
    WHERE pdf_summary_id = ${pdfSummaryId}
      AND last_seen > CURRENT_TIMESTAMP - INTERVAL '30 seconds'
      ${excludeUserId ? sql`AND user_id != ${excludeUserId}` : sql``}
    ORDER BY last_seen DESC
  `;

  return collaborators;
}

export async function removeCollaborationSession(pdfSummaryId: string, userId: string) {
  const sql = await getDbConnection();

  await sql`
    DELETE FROM collaboration_sessions
    WHERE pdf_summary_id = ${pdfSummaryId} AND user_id = ${userId}
  `;
}

export async function addDocumentComment({
  pdfSummaryId,
  workspaceId,
  userId,
  userEmail,
  userName,
  content,
  position,
  parentCommentId,
}: {
  pdfSummaryId: string;
  workspaceId?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  content: string;
  position?: any;
  parentCommentId?: string;
}) {
  const sql = await getDbConnection();

  const [comment] = await sql`
    INSERT INTO document_comments (pdf_summary_id, workspace_id, user_id, user_email, user_name, content, position, parent_comment_id)
    VALUES (${pdfSummaryId}, ${workspaceId || null}, ${userId}, ${userEmail}, ${userName || null}, ${content}, ${position ? JSON.stringify(position) : null}, ${parentCommentId || null})
    RETURNING *
  `;

  // Log activity if in workspace
  if (workspaceId) {
    await sql`
      INSERT INTO workspace_activities (workspace_id, user_id, user_email, user_name, action_type, action_description, metadata)
      VALUES (${workspaceId}, ${userId}, ${userEmail}, ${userName || null}, 'comment_added', ${`Comment added on document`}, ${JSON.stringify({ pdf_summary_id: pdfSummaryId, comment_id: comment.id })})
    `;
  }

  return comment;
}

export async function getDocumentComments(pdfSummaryId: string, workspaceId?: string) {
  const sql = await getDbConnection();

  const comments = await sql`
    SELECT * FROM document_comments
    WHERE pdf_summary_id = ${pdfSummaryId}
      ${workspaceId ? sql`AND (workspace_id = ${workspaceId} OR workspace_id IS NULL)` : sql`AND workspace_id IS NULL`}
      AND resolved = false
    ORDER BY created_at ASC
  `;

  return comments;
}

export async function getWorkspaceActivities(workspaceId: string, limit = 50) {
  const sql = await getDbConnection();

  const activities = await sql`
    SELECT * FROM workspace_activities
    WHERE workspace_id = ${workspaceId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return activities;
}

