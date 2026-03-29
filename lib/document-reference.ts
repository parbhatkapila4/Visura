export interface DocumentReference {
  document_version_id: string;
  page: number | null;
  snippet: string;
  pdf_summary_id?: string | null;
  chunk_id?: string | null;
  start_offset?: number | null;
  end_offset?: number | null;
}

export const DOCUMENT_VIEWER_GO_TO_EVENT = "document-viewer-go-to";
