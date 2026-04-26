-- =========================================
-- ENUM for roles
-- =========================================
create type public.app_role as enum ('instructor', 'student');

-- =========================================
-- PROFILES table
-- =========================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated users"
  on public.profiles for select
  to authenticated using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated with check (auth.uid() = user_id);

-- =========================================
-- USER_ROLES table (separate from profiles to prevent escalation)
-- =========================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function to check roles (prevents recursive RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.get_user_role(_user_id uuid)
returns public.app_role
language sql stable security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = _user_id limit 1
$$;

create policy "Users can view own roles"
  on public.user_roles for select
  to authenticated using (auth.uid() = user_id);

create policy "Instructors can view all roles"
  on public.user_roles for select
  to authenticated using (public.has_role(auth.uid(), 'instructor'));

create policy "Instructors can insert roles"
  on public.user_roles for insert
  to authenticated with check (public.has_role(auth.uid(), 'instructor'));

create policy "Instructors can delete roles"
  on public.user_roles for delete
  to authenticated using (public.has_role(auth.uid(), 'instructor'));

-- =========================================
-- DOCUMENTS table (extended from spec)
-- =========================================
create table public.documents (
  id bigserial primary key,
  class_id text not null,
  title text not null,
  storage_path text not null, -- path in storage bucket (file is stored there, not in bytea)
  original_filename text not null,
  content_type text not null,
  file_size bigint,
  assignment_tag text not null,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  visibility text not null default 'student'
    check (visibility in ('student', 'teacher', 'private')),
  status text not null default 'uploaded'
    check (status in ('uploaded', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now()
);

create index documents_class_id_idx on public.documents (class_id);
create index documents_assignment_idx on public.documents (assignment_tag);
create index documents_class_assignment_idx on public.documents (class_id, assignment_tag);

alter table public.documents enable row level security;

-- All authenticated users can read documents (students see instructor uploads)
create policy "Authenticated users can view documents"
  on public.documents for select
  to authenticated using (true);

-- Only instructors can insert documents
create policy "Instructors can upload documents"
  on public.documents for insert
  to authenticated with check (
    public.has_role(auth.uid(), 'instructor')
    and uploaded_by = auth.uid()
  );

-- Only instructors can update documents
create policy "Instructors can update documents"
  on public.documents for update
  to authenticated using (public.has_role(auth.uid(), 'instructor'));

-- Only instructors can delete documents
create policy "Instructors can delete documents"
  on public.documents for delete
  to authenticated using (public.has_role(auth.uid(), 'instructor'));

-- =========================================
-- STORAGE BUCKET for documents
-- =========================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false);

-- Authenticated users can read files in documents bucket
create policy "Authenticated users can read document files"
  on storage.objects for select
  to authenticated using (bucket_id = 'documents');

-- Only instructors can upload files to documents bucket
create policy "Instructors can upload document files"
  on storage.objects for insert
  to authenticated with check (
    bucket_id = 'documents'
    and public.has_role(auth.uid(), 'instructor')
  );

-- Only instructors can update files in documents bucket
create policy "Instructors can update document files"
  on storage.objects for update
  to authenticated using (
    bucket_id = 'documents'
    and public.has_role(auth.uid(), 'instructor')
  );

-- Only instructors can delete files in documents bucket
create policy "Instructors can delete document files"
  on storage.objects for delete
  to authenticated using (
    bucket_id = 'documents'
    and public.has_role(auth.uid(), 'instructor')
  );

-- =========================================
-- AUTO-CREATE profile + role on signup
-- =========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  assigned_role public.app_role;
  user_email text;
begin
  user_email := lower(new.email);

  -- Create profile
  insert into public.profiles (user_id, email, display_name)
  values (
    new.id,
    user_email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1))
  )
  on conflict (user_id) do nothing;

  -- Assign role based on predefined email list
  if user_email = 'rajesh@arizona.edu' then
    assigned_role := 'instructor';
  elsif user_email in ('tummalapalli@arizona.edu', 'sethrojas@arizona.edu') then
    assigned_role := 'student';
  else
    -- Default to student for any other arizona.edu email
    assigned_role := 'student';
  end if;

  insert into public.user_roles (user_id, role)
  values (new.id, assigned_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================
-- updated_at trigger for profiles
-- =========================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();