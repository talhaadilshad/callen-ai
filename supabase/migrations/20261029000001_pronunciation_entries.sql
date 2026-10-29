-- Pronunciation entries for the Knowledge Base: "written as" (title) ->
-- "say it as" in Urdu script (content), e.g. BBQ -> باربی کیو. Stored as
-- knowledge_docs of kind 'pronunciation' so RLS, bulk actions and sync
-- work as for other documents.

alter table public.knowledge_docs drop constraint knowledge_docs_kind_check;
alter table public.knowledge_docs add constraint knowledge_docs_kind_check
  check (kind in ('info', 'policy', 'faq', 'pronunciation'));
