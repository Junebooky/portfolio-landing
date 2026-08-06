create extension if not exists pg_cron;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists planner;
create schema if not exists planner_private;

revoke all on schema planner from public, anon;
revoke all on schema planner_private from public, anon, authenticated;
grant usage on schema planner to authenticated, service_role;
grant usage on schema planner_private to authenticated, service_role;

create table planner.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table planner.task_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references planner.members(user_id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  category text not null default 'personal'
    check (category in ('work', 'personal', 'other')),
  note text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, title)
);

create table planner.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid()
    references planner.members(user_id) on delete cascade,
  template_id uuid references planner.task_templates(id) on delete set null,
  task_date date not null default ((now() at time zone 'Asia/Seoul')::date),
  title text not null check (char_length(title) between 1 and 200),
  category text not null default 'personal'
    check (category in ('work', 'personal', 'other')),
  due_time time,
  note text not null default '' check (char_length(note) <= 500),
  is_completed boolean not null default false,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index tasks_one_template_per_day
  on planner.tasks (owner_id, task_date, template_id)
  where template_id is not null;

create index tasks_owner_date_idx
  on planner.tasks (owner_id, task_date, sort_order, created_at);

create table planner.daily_progress (
  owner_id uuid not null references planner.members(user_id) on delete cascade,
  progress_date date not null,
  total_tasks integer not null default 0 check (total_tasks >= 0),
  completed_tasks integer not null default 0 check (completed_tasks >= 0),
  achievement_rate smallint not null default 0
    check (achievement_rate between 0 and 100),
  finalized_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (owner_id, progress_date)
);

create or replace function planner_private.is_planner_member(
  requested_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from planner.members
    where user_id = requested_user_id
  );
$$;

revoke all on function planner_private.is_planner_member(uuid) from public, anon;
grant execute on function planner_private.is_planner_member(uuid)
  to authenticated, service_role;

alter table planner.members enable row level security;
alter table planner.task_templates enable row level security;
alter table planner.tasks enable row level security;
alter table planner.daily_progress enable row level security;

create policy "Planner member can read own membership"
  on planner.members
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Planner member can read own templates"
  on planner.task_templates
  for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  );

create policy "Planner member can read own tasks"
  on planner.tasks
  for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  );

create policy "Planner member can add own tasks"
  on planner.tasks
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  );

create policy "Planner member can update own tasks"
  on planner.tasks
  for update
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  )
  with check (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  );

create policy "Planner member can delete own tasks"
  on planner.tasks
  for delete
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  );

create policy "Planner member can read own progress"
  on planner.daily_progress
  for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  );

grant select on planner.members to authenticated;
grant select on planner.task_templates to authenticated;
grant select, insert, update, delete on planner.tasks to authenticated;
grant select on planner.daily_progress to authenticated;
grant all on all tables in schema planner to service_role;
grant usage, select on all sequences in schema planner to authenticated, service_role;

create or replace function planner_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger task_templates_set_updated_at
before update on planner.task_templates
for each row execute function planner_private.set_updated_at();

create trigger tasks_set_updated_at
before update on planner.tasks
for each row execute function planner_private.set_updated_at();

create or replace function planner_private.set_task_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_completed and new.completed_at is null then
    new.completed_at = now();
  elsif not new.is_completed then
    new.completed_at = null;
  end if;

  return new;
end;
$$;

create trigger tasks_set_completed_at
before insert or update of is_completed on planner.tasks
for each row execute function planner_private.set_task_completed_at();

create or replace function planner_private.recalculate_progress(
  requested_owner_id uuid,
  requested_date date,
  should_finalize boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  task_total integer;
  task_completed integer;
  task_rate smallint;
begin
  select
    count(*)::integer,
    count(*) filter (where is_completed)::integer
  into task_total, task_completed
  from planner.tasks
  where owner_id = requested_owner_id
    and task_date = requested_date;

  task_rate := case
    when task_total = 0 then 0
    else round(task_completed * 100.0 / task_total)::smallint
  end;

  insert into planner.daily_progress (
    owner_id,
    progress_date,
    total_tasks,
    completed_tasks,
    achievement_rate,
    finalized_at,
    updated_at
  )
  values (
    requested_owner_id,
    requested_date,
    task_total,
    task_completed,
    task_rate,
    case when should_finalize then now() else null end,
    now()
  )
  on conflict (owner_id, progress_date) do update
  set total_tasks = excluded.total_tasks,
      completed_tasks = excluded.completed_tasks,
      achievement_rate = excluded.achievement_rate,
      finalized_at = case
        when should_finalize then now()
        else planner.daily_progress.finalized_at
      end,
      updated_at = now();
end;
$$;

revoke all on function planner_private.recalculate_progress(uuid, date, boolean)
  from public, anon;
grant execute on function planner_private.recalculate_progress(uuid, date, boolean)
  to authenticated, service_role;

create or replace function planner_private.sync_progress_after_task_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform planner_private.recalculate_progress(old.owner_id, old.task_date, false);
    return old;
  end if;

  perform planner_private.recalculate_progress(new.owner_id, new.task_date, false);

  if tg_op = 'UPDATE'
    and (old.owner_id, old.task_date) is distinct from (new.owner_id, new.task_date)
  then
    perform planner_private.recalculate_progress(old.owner_id, old.task_date, false);
  end if;

  return new;
end;
$$;

create trigger tasks_sync_daily_progress
after insert or update or delete on planner.tasks
for each row execute function planner_private.sync_progress_after_task_change();

create or replace function planner_private.seed_owner_defaults(requested_owner_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  today_in_seoul date := (now() at time zone 'Asia/Seoul')::date;
begin
  insert into planner.task_templates (
    owner_id,
    title,
    category,
    sort_order
  )
  values
    (
      requested_owner_id,
      '아침에 일어나자마자 휴대폰 안 보기',
      'personal',
      10
    ),
    (
      requested_owner_id,
      '하루 종일 쓸데없는 동영상 안 보기',
      'personal',
      20
    )
  on conflict (owner_id, title) do update
  set is_active = true,
      sort_order = excluded.sort_order,
      updated_at = now();

  insert into planner.tasks (
    owner_id,
    template_id,
    task_date,
    title,
    category,
    note,
    sort_order
  )
  select
    template.owner_id,
    template.id,
    today_in_seoul,
    template.title,
    template.category,
    template.note,
    template.sort_order
  from planner.task_templates as template
  where template.owner_id = requested_owner_id
    and template.is_active
  on conflict (owner_id, task_date, template_id)
    where template_id is not null
  do nothing;

  perform planner_private.recalculate_progress(
    requested_owner_id,
    today_in_seoul,
    false
  );
end;
$$;

revoke all on function planner_private.seed_owner_defaults(uuid) from public, anon;
grant execute on function planner_private.seed_owner_defaults(uuid)
  to authenticated, service_role;

create or replace function planner_private.register_planner_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(new.email) = 'gotoward7@gmail.com' then
    insert into planner.members (user_id, email)
    values (new.id, lower(new.email))
    on conflict (user_id) do update set email = excluded.email;

    perform planner_private.seed_owner_defaults(new.id);
  end if;

  return new;
end;
$$;

create trigger register_planner_owner_after_auth_change
after insert or update of email on auth.users
for each row execute function planner_private.register_planner_owner();

insert into planner.members (user_id, email)
select id, lower(email)
from auth.users
where lower(email) = 'gotoward7@gmail.com'
on conflict (user_id) do update set email = excluded.email;

do $$
declare
  owner_record record;
begin
  for owner_record in select user_id from planner.members loop
    perform planner_private.seed_owner_defaults(owner_record.user_id);
  end loop;
end;
$$;

create or replace function planner.ensure_today()
returns date
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_owner_id uuid := auth.uid();
  today_in_seoul date := (now() at time zone 'Asia/Seoul')::date;
begin
  if current_owner_id is null
    or not planner_private.is_planner_member(current_owner_id)
  then
    raise insufficient_privilege using message = 'Planner owner access required';
  end if;

  perform planner_private.seed_owner_defaults(current_owner_id);
  return today_in_seoul;
end;
$$;

revoke all on function planner.ensure_today() from public, anon;
grant execute on function planner.ensure_today() to authenticated, service_role;

create or replace function planner_private.rollover_day()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_record record;
  today_in_seoul date := (now() at time zone 'Asia/Seoul')::date;
begin
  for owner_record in select user_id from planner.members loop
    perform planner_private.recalculate_progress(
      owner_record.user_id,
      today_in_seoul - 1,
      true
    );

    perform planner_private.seed_owner_defaults(owner_record.user_id);
  end loop;
end;
$$;

revoke all on function planner_private.rollover_day() from public, anon, authenticated;
grant execute on function planner_private.rollover_day() to service_role;

do $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'planner-midnight-rollover';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'planner-midnight-rollover',
    '0 15 * * *',
    'select planner_private.rollover_day()'
  );
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'planner'
      and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table planner.tasks;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'planner'
      and tablename = 'daily_progress'
  ) then
    alter publication supabase_realtime add table planner.daily_progress;
  end if;
end;
$$;

comment on schema planner is
  'Owner-only daily planner data exposed through Supabase Data API with RLS.';
comment on schema planner_private is
  'Unexposed security-definer functions and scheduled planner maintenance.';
