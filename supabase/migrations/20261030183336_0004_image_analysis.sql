/*
# Image Analysis Table for AI Vision Complaint Processing

## Overview
Creates a new `image_analysis` table that stores AI-generated analysis results
for complaint photographs. Each row represents one analyzed image attached to
a complaint, capturing classification, OCR text, evidence quality, and metadata.

## 1. New Table: image_analysis
- `id` — uuid primary key
- `complaint_id` — foreign key to complaints(id), cascades on delete
- `image_url` — public storage URL of the analyzed image
- `detected_category` — AI-predicted civic issue category
- `confidence_score` — 0-100 confidence of the classification
- `alternative_categories` — JSONB array of {category, confidence} alternatives
- `extracted_text` — OCR-extracted text from the image
- `ocr_confidence` — 0-100 confidence of OCR extraction
- `evidence_score` — 0-100 overall evidence quality score
- `analysis_result` — JSONB blob with full analysis (clarity, brightness, blur, warnings, evidence explanation)
- `model_provider` — which LLM provider produced the analysis (openai/gemini/fallback)
- `created_at` — timestamp

## 2. Security (RLS)
- Citizens can read/insert/update analysis for their own complaints
- Officers can read analysis for complaints assigned to them
- Admins can read all analysis records
- Only complaint owners and admins can insert/delete analysis rows
- Grants: SELECT/INSERT/UPDATE/DELETE to authenticated; service_role for edge functions

## 3. Indexes
- complaint_id for fast lookups by complaint
- detected_category for category-based reporting
*/

CREATE TABLE IF NOT EXISTS image_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id text NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  detected_category text,
  confidence_score integer,
  alternative_categories jsonb DEFAULT '[]'::jsonb,
  extracted_text text,
  ocr_confidence integer,
  evidence_score integer,
  analysis_result jsonb DEFAULT '{}'::jsonb,
  model_provider text DEFAULT 'fallback',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE image_analysis ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON image_analysis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON image_analysis TO service_role;

-- Citizens can read analysis for their own complaints
DROP POLICY IF EXISTS "select_own_image_analysis" ON image_analysis;
CREATE POLICY "select_own_image_analysis" ON image_analysis FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_id AND (
        c.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        OR c.officer_id IN (SELECT o.id FROM officers o WHERE o.user_id = auth.uid())
      )
    )
  );

-- Citizens can insert analysis for their own complaints
DROP POLICY IF EXISTS "insert_own_image_analysis" ON image_analysis;
CREATE POLICY "insert_own_image_analysis" ON image_analysis FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_id AND (
        c.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  );

-- Citizens can update analysis for their own complaints
DROP POLICY IF EXISTS "update_own_image_analysis" ON image_analysis;
CREATE POLICY "update_own_image_analysis" ON image_analysis FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_id AND (
        c.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_id AND (
        c.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  );

-- Citizens/admins can delete analysis for their own complaints
DROP POLICY IF EXISTS "delete_own_image_analysis" ON image_analysis;
CREATE POLICY "delete_own_image_analysis" ON image_analysis FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_id AND (
        c.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_image_analysis_complaint_id ON image_analysis(complaint_id);
CREATE INDEX IF NOT EXISTS idx_image_analysis_category ON image_analysis(detected_category);
CREATE INDEX IF NOT EXISTS idx_image_analysis_created_at ON image_analysis(created_at DESC);
