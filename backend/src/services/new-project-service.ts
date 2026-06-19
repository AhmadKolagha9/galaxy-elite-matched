import { withTransaction } from "../db/pool.js";
import { toAdminNewProject, toPublicNewProject, type NewProjectListFilters, type NewProjectMutation, type NewProjectStatus } from "../domain/new-projects.js";
import type { AuthPrincipal } from "../domain/submissions.js";
import { badRequest, notFound } from "../http/errors.js";
import { recordAdminAction } from "../repositories/admin-action-repository.js";
import {
  archiveNewProject,
  createNewProject,
  findAdminNewProjectByIdOrThrow,
  findPublicNewProjectByReference,
  getNewProjectStatusCounts,
  listAdminNewProjects,
  listPublicNewProjects,
  updateNewProject,
  updateNewProjectStatus
} from "../repositories/new-project-repository.js";

const assertCreatePublishable = (input: NewProjectMutation) => {
  if (input.status === "published" && !input.images?.length) throw badRequest("At least one image is required before publishing.");
};

const actionNote = (project: { reference: string; projectName: string }) => JSON.stringify({ reference: project.reference, projectName: project.projectName });

export const newProjectService = {
  listPublic: async (filters: NewProjectListFilters) => (await listPublicNewProjects(filters)).map(toPublicNewProject),

  detailPublic: async (reference: string) => {
    const project = await findPublicNewProjectByReference(reference);
    if (!project) throw notFound("New project not found.");
    return toPublicNewProject(project);
  },

  listAdmin: async (filters: NewProjectListFilters) => (await listAdminNewProjects(filters)).map(toAdminNewProject),
  summary: getNewProjectStatusCounts,

  detailAdmin: async (id: string) => withTransaction(async (client) => toAdminNewProject(await findAdminNewProjectByIdOrThrow(client, id))),

  create: async (actor: AuthPrincipal, input: NewProjectMutation, ipAddress?: string) => {
    assertCreatePublishable(input);
    return withTransaction(async (client) => {
      const project = toAdminNewProject(await createNewProject(client, { ...input, userId: actor.isServiceAccount ? null : actor.id }));
      await recordAdminAction(client, {
        actor,
        actionType: "new_project_create",
        objectType: "new_project",
        objectId: project.id,
        newStatus: project.status,
        note: actionNote(project),
        ipAddress
      });
      return project;
    });
  },

  update: async (actor: AuthPrincipal, id: string, input: NewProjectMutation, ipAddress?: string) => {
    return withTransaction(async (client) => {
      const previous = toAdminNewProject(await findAdminNewProjectByIdOrThrow(client, id));
      if (input.startPrice !== undefined && input.endPrice === undefined && previous.endPrice !== null && input.startPrice !== null && previous.endPrice < input.startPrice) {
        throw badRequest("end_price must be greater than or equal to start_price.");
      }
      if (input.endPrice !== undefined && input.startPrice === undefined && previous.startPrice !== null && input.endPrice !== null && input.endPrice < previous.startPrice) {
        throw badRequest("end_price must be greater than or equal to start_price.");
      }
      if (input.status === "published" && !(input.images ?? previous.images).length) throw badRequest("At least one image is required before publishing.");
      const project = toAdminNewProject(await updateNewProject(client, id, input));
      await recordAdminAction(client, {
        actor,
        actionType: "new_project_update",
        objectType: "new_project",
        objectId: project.id,
        previousStatus: previous.status,
        newStatus: project.status,
        note: JSON.stringify({ before: actionNote(previous), after: actionNote(project) }),
        ipAddress
      });
      return project;
    });
  },

  setStatus: async (actor: AuthPrincipal, id: string, status: NewProjectStatus, ipAddress?: string) => {
    return withTransaction(async (client) => {
      const previous = toAdminNewProject(await findAdminNewProjectByIdOrThrow(client, id));
      if (status === "published" && !previous.images.length) throw badRequest("At least one image is required before publishing.");
      const project = toAdminNewProject(await updateNewProjectStatus(client, id, status));
      await recordAdminAction(client, {
        actor,
        actionType: status === "archived" ? "new_project_archive" : "new_project_status_update",
        objectType: "new_project",
        objectId: project.id,
        previousStatus: previous.status,
        newStatus: project.status,
        note: actionNote(project),
        ipAddress
      });
      return project;
    });
  },

  archive: async (actor: AuthPrincipal, id: string, ipAddress?: string) => {
    return withTransaction(async (client) => {
      const previous = toAdminNewProject(await findAdminNewProjectByIdOrThrow(client, id));
      const project = toAdminNewProject(await archiveNewProject(client, id));
      await recordAdminAction(client, {
        actor,
        actionType: "new_project_archive",
        objectType: "new_project",
        objectId: project.id,
        previousStatus: previous.status,
        newStatus: project.status,
        note: actionNote(project),
        ipAddress
      });
      return project;
    });
  }
};
