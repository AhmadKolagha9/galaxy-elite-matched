export type DbSubmissionRow = {
  id: string;
  approval_status: string;
  public_status: string;
  verification_status: string;
  created_at: string;
  updated_at?: string;
  form_data: Record<string, unknown>;
  uploaded_documents?: unknown;
  [key: string]: unknown;
};
