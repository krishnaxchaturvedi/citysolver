/*
# Storage Bucket Policies for Complaint Images

## Overview
Creates a public storage bucket 'complaints' and RLS policies allowing:
- Authenticated users to upload images (for complaint submissions)
- Public read access (so complaint images are viewable)
- Owners to delete their own images

## Policies
- SELECT (read): public (anon + authenticated)
- INSERT (upload): authenticated only
- UPDATE: owner only
- DELETE: owner only
*/

-- Storage policies for 'complaints' bucket
DROP POLICY IF EXISTS "Public read complaint images" ON storage.objects;
CREATE POLICY "Public read complaint images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'complaints');

DROP POLICY IF EXISTS "Authenticated upload complaint images" ON storage.objects;
CREATE POLICY "Authenticated upload complaint images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaints');

DROP POLICY IF EXISTS "Owner update complaint images" ON storage.objects;
CREATE POLICY "Owner update complaint images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'complaints' AND owner = auth.uid())
WITH CHECK (bucket_id = 'complaints' AND owner = auth.uid());

DROP POLICY IF EXISTS "Owner delete complaint images" ON storage.objects;
CREATE POLICY "Owner delete complaint images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'complaints' AND owner = auth.uid());
