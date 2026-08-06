import type { PlannerTask, TaskCategory } from "@/lib/planner/types";

export const PLANNER_OWNER_EMAIL = "gotoward7@gmail.com";
export const SEOUL_TIME_ZONE = "Asia/Seoul";

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: "업무",
  personal: "개인",
  other: "기타",
};

export function createPreviewTasks(taskDate: string): PlannerTask[] {
  const createdAt = new Date().toISOString();

  return [
    {
      id: "preview-no-phone",
      owner_id: "local-preview",
      template_id: "preview-template-no-phone",
      task_date: taskDate,
      title: "아침에 일어나자마자 휴대폰 안 보기",
      category: "personal",
      due_time: null,
      note: "",
      is_completed: false,
      completed_at: null,
      sort_order: 10,
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: "preview-no-video",
      owner_id: "local-preview",
      template_id: "preview-template-no-video",
      task_date: taskDate,
      title: "하루 종일 쓸데없는 동영상 안 보기",
      category: "personal",
      due_time: null,
      note: "",
      is_completed: false,
      completed_at: null,
      sort_order: 20,
      created_at: createdAt,
      updated_at: createdAt,
    },
  ];
}
