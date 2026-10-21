ALTER TABLE document_versions
  ADD COLUMN IF NOT EXISTS ocr_used BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS truncated BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_pages INTEGER,
  ADD COLUMN IF NOT EXISTS pages_read INTEGER;

COMMENT ON COLUMN document_versions.ocr_used IS
  'Text came wholly or partly from OCR, which is not repeatable. Coverage must not be claimed for this version.';
COMMENT ON COLUMN document_versions.truncated IS
  'The extractor stopped at its page cap. Pages past pages_read were never read.';
COMMENT ON COLUMN document_versions.total_pages IS
  'Pages in the source document, when the extractor could count them.';
COMMENT ON COLUMN document_versions.pages_read IS
  'Pages actually read. Equal to total_pages unless truncated.';
CREATE INDEX IF NOT EXISTS idx_document_versions_confidence
  ON document_versions (document_id, ocr_used, truncated);
