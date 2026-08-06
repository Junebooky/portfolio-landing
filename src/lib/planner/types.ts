export type TaskCategory = "work" | "personal" | "other";

export interface PlannerTask {
  id: string;
  owner_id: string;
  template_id: string | null;
  task_date: string;
  title: string;
  category: TaskCategory;
  due_time: string | null;
  note: string;
  related_url: string;
  is_completed: boolean;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WaitingItem {
  id: string;
  owner_id: string;
  title: string;
  next_check_date: string | null;
  note: string;
  related_url: string;
  created_at: string;
  updated_at: string;
}

export interface DailyProgress {
  owner_id: string;
  progress_date: string;
  total_tasks: number;
  completed_tasks: number;
  achievement_rate: number;
  finalized_at: string | null;
  updated_at: string;
}
