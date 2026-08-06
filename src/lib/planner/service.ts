import "server-only";
import { PLANNER_OWNER_EMAIL } from "@/lib/planner/constants";
import { getMonthRange } from "@/lib/planner/date";
import type {
  DailyProgress,
  PlannerTask,
  TaskCategory,
} from "@/lib/planner/types";
import { createAdminClient } from "@/lib/supabase/admin";

type NewTaskInput = {
  category: TaskCategory;
  dueTime: string | null;
  id: string;
  note: string;
  sortOrder: number;
  taskDate: string;
  title: string;
};

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
  const [tasksResult, progressResult] = await Promise.all([
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
  ]);

  const error = tasksResult.error ?? progressResult.error;
  if (error) throw new Error(error.message);

  return {
    ownerId,
    progress: (progressResult.data ?? []) as DailyProgress[],
    tasks: (tasksResult.data ?? []) as PlannerTask[],
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
      sort_order: input.sortOrder,
      task_date: input.taskDate,
      title: input.title,
    })
    .select("*")
    .single();

  if (result.error) throw new Error(result.error.message);
  return result.data as PlannerTask;
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
