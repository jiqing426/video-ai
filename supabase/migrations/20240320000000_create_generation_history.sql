-- Create generation_history table
create table if not exists public.generation_history (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  video_url text not null,
  video_name text not null,
  video_size integer not null,
  video_duration integer not null,
  video_format text not null,
  video_resolution text not null,
  status text not null check (status in ('completed', 'processing', 'failed')),
  description text,
  mode text check (mode in ('url-only', 'url-prompt', 'code-aware')),
  thumbnail_url text,
  views integer default 0
);

-- Enable Row Level Security
alter table public.generation_history enable row level security;

-- Create policies
create policy "Users can view their own generation history"
  on public.generation_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generation history"
  on public.generation_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generation history"
  on public.generation_history for update
  using (auth.uid() = user_id);

create policy "Users can delete their own generation history"
  on public.generation_history for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists generation_history_user_id_idx on public.generation_history(user_id);
create index if not exists generation_history_created_at_idx on public.generation_history(created_at);
create index if not exists generation_history_status_idx on public.generation_history(status); 