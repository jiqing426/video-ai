-- Create transcriptions table
create table if not exists public.transcriptions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  video_name text not null,
  video_path text not null,
  text text not null,
  user_id uuid references auth.users(id) on delete cascade
);

-- Enable Row Level Security
alter table public.transcriptions enable row level security;

-- Create policies
create policy "Users can view their own transcriptions"
  on public.transcriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transcriptions"
  on public.transcriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transcriptions"
  on public.transcriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transcriptions"
  on public.transcriptions for delete
  using (auth.uid() = user_id); 