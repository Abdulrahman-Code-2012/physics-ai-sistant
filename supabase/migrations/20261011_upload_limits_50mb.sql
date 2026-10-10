-- Keep every Physics AI-sistant upload bucket at the product maximum of 50 MB.
update storage.buckets
set file_size_limit = 52428800
where id in ('answer-images', 'answer-uploads', 'mark-schemes', 'materials', 'voice-notes');
