import type { Queryable } from "../db/pool.js";
import type { AuthPrincipal } from "../domain/submissions.js";

const normalizeActionType = (actionType: string) => {
  const map: Record<string, string> = {
    approve: "approve_submission",
    reject: "reject_submission",
    "request-documents": "request_documents",
    "compliance-hold": "compliance_hold",
    archive: "archive_submission",
    "under-verification": "mark_under_verification",
    "mark-verified": "mark_verified",
    decision: "decision_update",
    taxonomy_create: "modify_taxonomy",
    taxonomy_update: "modify_taxonomy",
    taxonomy_archive: "modify_taxonomy",
    taxonomy_import_create: "modify_taxonomy",
    new_project_create: "new_project_create",
    new_project_update: "new_project_update",
    new_project_status_update: "new_project_status_update",
    new_project_archive: "new_project_archive"
  };
  return map[actionType] ?? actionType.replace(/-/g, "_");
};

export const recordAdminAction = async (
  client: Queryable,
  input: {
    actor: AuthPrincipal;
    actionType: string;
    objectType: string;
    objectId: string;
    previousStatus?: string;
    newStatus?: string;
    note?: string;
    ipAddress?: string;
  }
) => {
  const actionType = normalizeActionType(input.actionType);
  const note = input.note?.trim() || "No note provided.";

  await client.query(
    `insert into admin_actions (admin_user_id, admin_email, action_type, object_type, object_id, previous_status, new_status, note, ip_address)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.actor.isServiceAccount ? null : input.actor.id,
      input.actor.email ?? null,
      actionType,
      input.objectType,
      input.objectId,
      input.previousStatus ?? null,
      input.newStatus ?? null,
      note,
      input.ipAddress ?? null
    ]
  );
};

