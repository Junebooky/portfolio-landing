alter table planner.tasks
  add column if not exists related_url text not null default '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_related_url_length'
      and conrelid = 'planner.tasks'::regclass
  ) then
    alter table planner.tasks
      add constraint tasks_related_url_length
      check (char_length(related_url) <= 2048);
  end if;
end;
$$;

create table planner.waiting_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null
    references planner.members(user_id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  next_check_date date,
  note text not null default '' check (char_length(note) <= 500),
  related_url text not null default '' check (char_length(related_url) <= 2048),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index waiting_items_owner_check_date_idx
  on planner.waiting_items (owner_id, next_check_date nulls last, created_at);

alter table planner.waiting_items enable row level security;

create policy "Planner member can read own waiting items"
  on planner.waiting_items
  for select
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  );

create policy "Planner member can add own waiting items"
  on planner.waiting_items
  for insert
  to authenticated
  with check (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  );

create policy "Planner member can update own waiting items"
  on planner.waiting_items
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

create policy "Planner member can delete own waiting items"
  on planner.waiting_items
  for delete
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and (select planner_private.is_planner_member())
  );

grant select, insert, update, delete on planner.waiting_items to authenticated;
grant all on planner.waiting_items to service_role;

create trigger waiting_items_set_updated_at
before update on planner.waiting_items
for each row execute function planner_private.set_updated_at();

create or replace function planner.convert_waiting_item(
  requested_waiting_id uuid,
  requested_task_id uuid,
  requested_owner_id uuid,
  requested_task_date date,
  requested_category text,
  requested_due_time time default null
)
returns planner.tasks
language plpgsql
security definer
set search_path = ''
as $$
declare
  waiting_record planner.waiting_items;
  converted_task planner.tasks;
  next_sort_order integer;
begin
  if requested_category not in ('work', 'personal', 'other') then
    raise check_violation using message = 'Invalid task category';
  end if;

  select *
  into waiting_record
  from planner.waiting_items
  where id = requested_waiting_id
    and owner_id = requested_owner_id
  for update;

  if not found then
    raise no_data_found using message = 'Waiting item not found';
  end if;

  select coalesce(max(sort_order), 0) + 10
  into next_sort_order
  from planner.tasks
  where owner_id = requested_owner_id
    and task_date = requested_task_date;

  insert into planner.tasks (
    id,
    owner_id,
    task_date,
    title,
    category,
    due_time,
    note,
    related_url,
    sort_order
  )
  values (
    requested_task_id,
    requested_owner_id,
    requested_task_date,
    waiting_record.title,
    requested_category,
    requested_due_time,
    waiting_record.note,
    waiting_record.related_url,
    next_sort_order
  )
  returning * into converted_task;

  delete from planner.waiting_items
  where id = waiting_record.id;

  return converted_task;
end;
$$;

revoke all on function planner.convert_waiting_item(
  uuid,
  uuid,
  uuid,
  date,
  text,
  time
) from public, anon, authenticated;
grant execute on function planner.convert_waiting_item(
  uuid,
  uuid,
  uuid,
  date,
  text,
  time
) to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'planner'
      and tablename = 'waiting_items'
  ) then
    alter publication supabase_realtime add table planner.waiting_items;
  end if;
end;
$$;

comment on table planner.waiting_items is
  'Items that require monitoring but are excluded from daily achievement calculations.';
