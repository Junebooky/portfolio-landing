import "server-only";
import { PLANNER_OWNER_EMAIL } from "@/lib/planner/constants";
import { getMonthRange, getSeoulDateString } from "@/lib/planner/date";
import type {
  DailyProgress,
  PlannerTask,
  TaskCategory,
  WaitingItem,
} from "@/lib/planner/types";
import { createAdminClient } from "@/lib/supabase/admin";

type NewTaskInput = {
  category: TaskCategory;
  dueTime: string | null;
  id: string;
  note: string;
  relatedUrl: string;
  sortOrder: number;
  taskDate: string;
  title: string;
};

type NewWaitingItemInput = {
  id: string;
  nextCheckDate: string | null;
  note: string;
  relatedUrl: string;
  title: string;
};

type WaitingItemUpdate = Omit<NewWaitingItemInput, "id">;

type TaskUpdate = {
  category?: TaskCategory;
  completedAt?: string | null;
  dueTime?: string | null;
  isCompleted?: boolean;
  note?: string;
  title?: string;
};

export async function getPlannerSnapshot(taskDate: string, monthKey: string) {
  const admin = createAdminClient();
  const ownerId = await getPlannerOwnerId(admin);
  const { end, start } = getMonthRange(`${monthKey}-01`);
  const planner = admin.schema("planner");
  const [tasksResult, progressResult, waitingResult] = await Promise.all([
    planner
      .from("tasks")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("task_date", taskDate)
      .order("sort_order")
      .order("created_at"),
    planner
      .from("daily_progress")
      .select("*")
      .eq("owner_id", ownerId)
      .gte("progress_date", start)
      .lte("progress_date", end)
      .order("progress_date"),
    planner
      .from("waiting_items")
      .select("*")
      .eq("owner_id", ownerId)
      .order("next_check_date", { ascending: true, nullsFirst: false })
      .order("created_at"),
  ]);

  const error = tasksResult.error ?? progressResult.error ?? waitingResult.error;
  if (error) throw new Error(error.message);

  const tasks = (tasksResult.data ?? []) as PlannerTask[];
  const visibleTasks = taskDate === getSeoulDateString()
    ? tasks
    : tasks.filter((task) => task.template_id === null || task.is_completed);

  return {
    ownerId,
    progress: (progressResult.data ?? []) as DailyProgress[],
    tasks: visibleTasks,
    waitingItems: (waitingResult.data ?? []) as WaitingItem[],
  };
}

export async function createPlannerTask(input: NewTaskInput) {
  const admin = createAdminClient();
  const ownerId = await getPlannerOwnerId(admin);
  const result = await admin
    .schema("planner")
    .from("tasks")
    .insert({
      category: input.category,
      due_time: input.dueTime,
      id: input.id,
      note: input.note,
      owner_id: ownerId,
      related_url: input.relatedUrl,
      sort_order: input.sortOrder,
      task_date: input.taskDate,
      title: input.title,
    })
    .select("*")
    .single();

  if (result.error) throw new Error(result.error.message);
  return result.data as PlannerTask;
}

export async function createWaitingItem(input: NewWaitingItemInput) {
  const admin = createAdminClient();
  const ownerId = await getPlannerOwnerId(admin);
  const result = await admin
    .schema("planner")
    .from("waiting_items")
    .insert({
      id: input.id,
      next_check_date: input.nextCheckDate,
      note: input.note,
      owner_id: ownerId,
      related_url: input.relatedUrl,
      title: input.title,
    })
    .select("*")
    .single();

  if (result.error) throw new Error(result.error.message);
  return result.data as WaitingItem;
}

export async function updateWaitingItem(
  waitingItemId: string,
  update: WaitingItemUpdate,
) {
  const admin = createAdminClient();
  const ownerId = await getPlannerOwnerId(admin);
  const result = await admin
    .schema("planner")
    .from("waiting_items")
    .update({
      next_check_date: update.nextCheckDate,
      note: update.note,
      related_url: update.relatedUrl,
      title: update.title,
    })
    .eq("id", waitingItemId)
    .eq("owner_id", ownerId)
    .select("*")
    .single();

  if (result.error) throw new Error(result.error.message);
  return result.data as WaitingItem;
}

export async function deleteWaitingItem(waitingItemId: string) {
  const admin = createAdminClient();
  const ownerId = await getPlannerOwnerId(admin);
  const result = await admin
    .schema("planner")
    .from("waiting_items")
    .delete()
    .eq("id", waitingItemId)
    .eq("owner_id", ownerId)
    .select("id")
    .single();

  if (result.error) throw new Error(result.error.message);
}

export async function convertWaitingItem(input: {
  category: TaskCategory;
  dueTime: string | null;
  taskId: string;
  waitingItemId: string;
}) {
  const admin = createAdminClient();
  const ownerId = await getPlannerOwnerId(admin);
  const result = await admin.schema("planner").rpc("convert_waiting_item", {
    requested_category: input.category,
    requested_due_time: input.dueTime,
    requested_owner_id: ownerId,
    requested_task_date: getSeoulDateString(),
    requested_task_id: input.taskId,
    requested_waiting_id: input.waitingItemId,
  });

  if (result.error) throw new Error(result.error.message);
  const task = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!task) throw new Error("전환된 할 일을 찾을 수 없습니다.");
  return task as PlannerTask;
}

export async function updatePlannerTask(taskId: string, update: TaskUpdate) {
  const admin = createAdminClient();
  const ownerId = await getPlannerOwnerId(admin);
  const values: Record<string, string | boolean | null> = {};

  if (update.category !== undefined) values.category = update.category;
  if (update.dueTime !== undefined) values.due_time = update.dueTime;
  if (update.note !== undefined) values.note = update.note;
  if (update.title !== undefined) values.title = update.title;
  if (update.isCompleted !== undefined) {
    values.is_completed = update.isCompleted;
    values.completed_at = update.completedAt ?? null;
  }

  const result = await admin
    .schema("planner")
    .from("tasks")
    .update(values)
    .eq("id", taskId)
    .eq("owner_id", ownerId)
    .select("id")
    .single();

  if (result.error) throw new Error(result.error.message);
}

export async function deletePlannerTask(taskId: string) {
  const admin = createAdminClient();
  const ownerId = await getPlannerOwnerId(admin);
  const result = await admin
    .schema("planner")
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("owner_id", ownerId)
    .select("id")
    .single();

  if (result.error) throw new Error(result.error.message);
}

async function getPlannerOwnerId(admin: ReturnType<typeof createAdminClient>) {
  const result = await admin
    .schema("planner")
    .from("members")
    .select("user_id")
    .eq("email", PLANNER_OWNER_EMAIL)
    .single();

  if (result.error || !result.data) {
    throw new Error(result.error?.message ?? "Planner 소유자를 찾을 수 없습니다.");
  }

  return result.data.user_id as string;
}
