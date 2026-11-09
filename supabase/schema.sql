-- Run in Supabase Dashboard > SQL Editor.
-- Create your own user in Authentication > Users, then disable public sign-ups.
-- Since this starter policy permits authenticated users to manage records,
-- keep public sign-ups disabled and do not create other authenticated users.
create extension if not exists pgcrypto;
create table if not exists public.certificates (
 id uuid primary key default gen_random_uuid(), title text not null, issuer text not null,
 completed_on text, duration text, score text, credits text, description text,
 file_url text, verification_url text, is_published boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.skills (
 id uuid primary key default gen_random_uuid(), name text not null, category text not null,
 description text, sort_order integer not null default 0, is_published boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.achievements (
 id uuid primary key default gen_random_uuid(), title text not null, event_date date,
 description text, file_url text, is_published boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.certificates enable row level security;
alter table public.skills enable row level security;
alter table public.achievements enable row level security;
create policy "Public reads published certificates" on public.certificates for select using (is_published=true);
create policy "Signed-in admin manages certificates" on public.certificates for all to authenticated using (true) with check (true);
create policy "Public reads published skills" on public.skills for select using (is_published=true);
create policy "Signed-in admin manages skills" on public.skills for all to authenticated using (true) with check (true);
create policy "Public reads published achievements" on public.achievements for select using (is_published=true);
create policy "Signed-in admin manages achievements" on public.achievements for all to authenticated using (true) with check (true);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('portfolio-files','portfolio-files',true,10485760,array['application/pdf','image/png','image/jpeg','image/webp'])
on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['application/pdf','image/png','image/jpeg','image/webp'];
create policy "Public can view portfolio uploads" on storage.objects for select using(bucket_id='portfolio-files');
create policy "Authenticated uploads portfolio files" on storage.objects for insert to authenticated with check(bucket_id='portfolio-files');
create policy "Authenticated updates portfolio files" on storage.objects for update to authenticated using(bucket_id='portfolio-files') with check(bucket_id='portfolio-files');
create policy "Authenticated deletes portfolio files" on storage.objects for delete to authenticated using(bucket_id='portfolio-files');
insert into public.skills(name,category,description,sort_order)
select v.name,v.category,v.description,v.sort_order from (values
 ('C','Programming Languages','Programming language',1),
 ('C++','Programming Languages','Object-oriented programming',2),
 ('Python','Programming Languages','Programming and problem solving',3),
 ('JavaScript','Web Technologies','Web development',4),
 ('HTML','Web Technologies','Web structure and development',5),
 ('MySQL','Databases','Database management',6)
) as v(name,category,description,sort_order)
where not exists(select 1 from public.skills);
