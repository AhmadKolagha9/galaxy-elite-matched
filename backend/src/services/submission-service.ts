import { withTransaction } from "../db/pool.js";
import type { SubmissionInput } from "../domain/submissions.js";
import { createDocumentRowsForUploadSummaries, createSubmission, pendingMessage } from "../repositories/submission-repository.js";

export const submissionService = {
  create: (input: SubmissionInput) =>
    withTransaction(async (client) => {
      const record = await createSubmission(client, input);
      await createDocumentRowsForUploadSummaries(client, record, input);
      return {
        ok: true,
        id: record.id,
        status: record.approvalStatus,
        message: input.type === "newsletter" ? "Newsletter subscription received." : pendingMessage
      };
    })
};
