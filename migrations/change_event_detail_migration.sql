ALTER TABLE document_change_events
  ADD COLUMN IF NOT EXISTS before_text TEXT,
  ADD COLUMN IF NOT EXISTS after_text TEXT,
  ADD COLUMN IF NOT EXISTS quote TEXT,
  ADD COLUMN IF NOT EXISTS materiality TEXT,
  ADD COLUMN IF NOT EXISTS start_page INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'document_change_events_materiality_check'
  ) THEN
    ALTER TABLE document_change_events
      ADD CONSTRAINT document_change_events_materiality_check
      CHECK (materiality IS NULL OR materiality IN ('material', 'substantive', 'cosmetic'));
  END IF;
END $$;

COMMENT ON COLUMN document_change_events.quote IS
  'Verbatim span from the document proving this change. Validated against the source before insert; an event without one is never written.';
COMMENT ON COLUMN document_change_events.materiality IS
  'material | substantive | cosmetic. Sorts the change list. Never filters it.';
CREATE INDEX IF NOT EXISTS idx_change_events_doc_versions
  ON document_change_events (document_id, to_version DESC, materiality);
