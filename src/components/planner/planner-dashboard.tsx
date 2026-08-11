"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  AlarmClockOff,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ListTodo,
  LoaderCircle,
  Pencil,
  Plus,
  RadioTower,
  Save,
  Sprout,
  Trash2,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CategoryPicker } from "@/components/planner/category-picker";
import { WaitingItemsPanel } from "@/components/planner/waiting-items-panel";
import styles from "@/components/planner/planner-dashboard.module.css";
import {
  formatKoreanDate,
  formatPlannerDate,
  getMillisecondsUntilNextSeoulDay,
  getSeoulDateString,
} from "@/lib/planner/date";
import type {
  DailyProgress,
  PlannerTask,
  TaskCategory,
  WaitingItem,
} from "@/lib/planner/types";

type ConnectionMode = "connected" | "preview";

type PlannerDashboardProps = {
  connectionMode: ConnectionMode;
  initialProgress: DailyProgress[];
  initialTasks: PlannerTask[];
  initialWaitingItems: WaitingItem[];
  ownerId: string;
  today: string;
};

export function PlannerDashboard({
  connectionMode,
  initialProgress,
  initialTasks,
  initialWaitingItems,
  ownerId,
  today,
}: PlannerDashboardProps) {
  const [tasks, setTasks] = useState(() => sortTasks(initialTasks));
  const [waitingItems, setWaitingItems] = useState(initialWaitingItems);
  const [activeList, setActiveList] = useState<"today" | "waiting">("today");
  const [progressByDate, setProgressByDate] = useState<
    Record<string, DailyProgress>
  >(() => indexProgress(initialProgress));
  const [monthCursor, setMonthCursor] = useState(today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(today);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("personal");
  const [dueTime, setDueTime] = useState("");
  const [note, setNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueTime, setEditDueTime] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDateTasks, setSelectedDateTasks] = useState<PlannerTask[]>([]);
  const [isLoadingSelectedDate, setIsLoadingSelectedDate] = useState(false);
  const [error, setError] = useState("");
  const selectedDateRequestId = useRef(0);

  const isConnected = connectionMode === "connected";

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.is_completed).length,
    [tasks],
  );
  const achievementRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const displayedTasks = selectedDate === today
    ? tasks
    : selectedDateTasks;
  const displayedCompletedTasks = displayedTasks.filter(
    (task) => task.is_completed,
  ).length;
  const isTodaySelected = selectedDate === today;
  const pendingDeleteTask = displayedTasks.find(
    (task) => task.id === pendingDeleteId,
  );
  const dueWaitingItems = waitingItems.filter(
    (item) => item.next_check_date && item.next_check_date <= today,
  ).length;

  const displayedProgressByDate = useMemo(
    () => ({
      ...progressByDate,
      [today]: {
        owner_id: ownerId,
        progress_date: today,
        total_tasks: tasks.length,
        completed_tasks: completedTasks,
        achievement_rate: achievementRate,
        finalized_at: progressByDate[today]?.finalized_at ?? null,
        updated_at: new Date().toISOString(),
      },
    }),
    [achievementRate, completedTasks, ownerId, progressByDate, tasks.length, today],
  );

  const reloadToday = useCallback(async () => {
    if (!isConnected) return;

    const response = await fetch(`/api/planner?month=${monthCursor}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      setError("오늘의 할 일을 새로 불러오지 못했습니다.");
      return;
    }

    const snapshot = (await response.json()) as {
      progress: DailyProgress[];
      tasks: PlannerTask[];
      waitingItems: WaitingItem[];
    };
    setTasks(sortTasks(snapshot.tasks));
    setWaitingItems(snapshot.waitingItems);
    setProgressByDate((current) => ({
      ...current,
      ...indexProgress(snapshot.progress),
    }));
  }, [isConnected, monthCursor]);

  const loadMonth = useCallback(
    async (monthKey: string) => {
      if (!isConnected) return;

      const response = await fetch(`/api/planner?month=${monthKey}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        setError("월간 달성 기록을 불러오지 못했습니다.");
        return;
      }

      const snapshot = (await response.json()) as {
        progress: DailyProgress[];
      };
      setProgressByDate((current) => {
        const next = { ...current };
        Object.keys(next).forEach((date) => {
          if (date.startsWith(monthKey)) delete next[date];
        });
        snapshot.progress.forEach((progress) => {
          next[progress.progress_date] = progress;
        });
        return next;
      });
    },
    [isConnected],
  );

  useEffect(() => {
    if (!isConnected) return;

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void reloadToday();
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [isConnected, reloadToday]);

  useEffect(() => {
    const checkDate = () => {
      if (getSeoulDateString() !== today) window.location.reload();
    };
    const timer = window.setTimeout(
      checkDate,
      getMillisecondsUntilNextSeoulDay() + 500,
    );
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkDate();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [today]);

  useEffect(() => {
    if (!pendingDeleteId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) setPendingDeleteId(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, pendingDeleteId]);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isAdding || isLoadingSelectedDate) return;

    setError("");
    setIsAdding(true);

    const previousTasks = displayedTasks;
    const now = new Date().toISOString();
    const newTask: PlannerTask = {
      id: crypto.randomUUID(),
      owner_id: ownerId,
      template_id: null,
      task_date: selectedDate,
      title: trimmedTitle,
      category,
      due_time: dueTime || null,
      note: note.trim(),
      related_url: "",
      is_completed: false,
      completed_at: null,
      sort_order: Math.max(0, ...displayedTasks.map((task) => task.sort_order)) + 10,
      created_at: now,
      updated_at: now,
    };

    updateDisplayedTasks((current) => sortTasks([...current, newTask]));
    setTitle("");
    setDueTime("");
    setNote("");

    if (isConnected) {
      const response = await fetch("/api/planner", {
        body: JSON.stringify({
          category: newTask.category,
          dueTime: newTask.due_time,
          id: newTask.id,
          note: newTask.note,
          relatedUrl: newTask.related_url,
          sortOrder: newTask.sort_order,
          taskDate: newTask.task_date,
          title: newTask.title,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        updateDisplayedTasks(() => previousTasks);
        setError("할 일을 추가하지 못했습니다.");
      } else {
        void loadMonth(newTask.task_date.slice(0, 7));
      }
    }

    setIsAdding(false);
  }

  async function toggleTask(taskId: string) {
    const previousTasks = displayedTasks;
    const currentTask = displayedTasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    const nextCompleted = !currentTask.is_completed;
    const completedAt = nextCompleted ? new Date().toISOString() : null;
    updateDisplayedTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, is_completed: nextCompleted, completed_at: completedAt }
          : task,
      ),
    );

    if (!isConnected) return;

    const response = await fetch("/api/planner", {
      body: JSON.stringify({ id: taskId, isCompleted: nextCompleted }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (!response.ok) {
      updateDisplayedTasks(() => previousTasks);
      setError("완료 상태를 저장하지 못했습니다.");
    } else {
      void loadMonth(currentTask.task_date.slice(0, 7));
    }
  }

  async function updateCategory(taskId: string, nextCategory: TaskCategory) {
    const previousTasks = displayedTasks;
    const currentTask = displayedTasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    updateDisplayedTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, category: nextCategory } : task,
      ),
    );

    if (!isConnected) return;

    const response = await fetch("/api/planner", {
      body: JSON.stringify({ category: nextCategory, id: taskId }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });

    if (!response.ok) {
      updateDisplayedTasks(() => previousTasks);
      setError("카테고리를 저장하지 못했습니다.");
    }
  }

  function startEditing(task: PlannerTask) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDueTime(task.due_time?.slice(0, 5) ?? "");
    setEditNote(task.note);
    setError("");
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDueTime("");
    setEditNote("");
  }

  async function saveTaskEdit(taskId: string) {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle || isSavingEdit) return;

    const previousTasks = displayedTasks;
    const currentTask = displayedTasks.find((task) => task.id === taskId);
    if (!currentTask) return;
    const nextNote = editNote.trim();
    const nextDueTime = editDueTime || null;
    setIsSavingEdit(true);
    setError("");
    updateDisplayedTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              due_time: nextDueTime,
              note: nextNote,
              title: trimmedTitle,
            }
          : task,
      ),
    );

    if (isConnected) {
      const response = await fetch("/api/planner", {
        body: JSON.stringify({
          dueTime: nextDueTime,
          id: taskId,
          note: nextNote,
          title: trimmedTitle,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) {
        updateDisplayedTasks(() => previousTasks);
        setError("할 일 수정을 저장하지 못했습니다.");
        setIsSavingEdit(false);
        return;
      }
    }

    setIsSavingEdit(false);
    cancelEditing();
  }

  function handleEditKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>,
    taskId: string,
  ) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

    event.preventDefault();
    void saveTaskEdit(taskId);
  }

  async function deleteTask(taskId: string) {
    const previousTasks = displayedTasks;
    const currentTask = displayedTasks.find((task) => task.id === taskId);
    if (!currentTask) return;

    setIsDeleting(true);
    updateDisplayedTasks((current) => current.filter((task) => task.id !== taskId));

    if (!isConnected) {
      setIsDeleting(false);
      setPendingDeleteId(null);
      return;
    }

    const response = await fetch(`/api/planner?id=${encodeURIComponent(taskId)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      updateDisplayedTasks(() => previousTasks);
      setError("할 일을 삭제하지 못했습니다.");
    } else {
      void loadMonth(currentTask.task_date.slice(0, 7));
    }

    setIsDeleting(false);
    setPendingDeleteId(null);
  }

  async function selectCalendarDate(date: string) {
    const requestId = selectedDateRequestId.current + 1;
    selectedDateRequestId.current = requestId;
    setSelectedDate(date);
    setActiveList("today");
    cancelEditing();

    if (date === today) {
      setSelectedDateTasks([]);
      setIsLoadingSelectedDate(false);
      return;
    }

    if (!isConnected) {
      setSelectedDateTasks([]);
      return;
    }

    setIsLoadingSelectedDate(true);
    setSelectedDateTasks([]);
    const response = await fetch(
      `/api/planner?month=${date.slice(0, 7)}&date=${date}`,
      { cache: "no-store" },
    );

    if (requestId !== selectedDateRequestId.current) return;

    if (!response.ok) {
      setSelectedDateTasks([]);
      setError("선택한 날짜의 할 일을 불러오지 못했습니다.");
      setIsLoadingSelectedDate(false);
      return;
    }

    const snapshot = (await response.json()) as { tasks: PlannerTask[] };
    setSelectedDateTasks(sortTasks(snapshot.tasks));
    setIsLoadingSelectedDate(false);
  }

  function updateDisplayedTasks(
    update: (current: PlannerTask[]) => PlannerTask[],
  ) {
    if (isTodaySelected) {
      setTasks(update);
      return;
    }

    setSelectedDateTasks(update);
  }

  function changeMonth(offset: number) {
    const nextMonth = shiftMonth(monthCursor, offset);
    setMonthCursor(nextMonth);
    void selectCalendarDate(`${nextMonth}-01`);
    void loadMonth(nextMonth);
  }

  function handleWaitingItemConverted(task: PlannerTask) {
    setTasks((current) => sortTasks([...current, task]));
    setSelectedDate(today);
    setSelectedDateTasks([]);
    setActiveList("today");
    void loadMonth(today.slice(0, 7));
  }

  const selectedProgress = displayedProgressByDate[selectedDate];
  const selectedTotalTasks = selectedProgress?.total_tasks ?? 0;
  const selectedCompletedTasks = selectedProgress?.completed_tasks ?? 0;
  const selectedAchievementRate = selectedProgress?.achievement_rate ?? 0;
  const achievementLabel = isTodaySelected
    ? "오늘의 달성률"
    : `${formatKoreanDate(selectedDate)} 달성률`;

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
        <div className="mx-auto flex h-18 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              title="포트폴리오로 돌아가기"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-blue-300/50 dark:hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">포트폴리오로 돌아가기</span>
            </Link>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold">JuneBooky Planner</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {formatKoreanDate(today)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex items-center gap-4 text-sm font-black uppercase tracking-normal text-blue-600 dark:text-blue-300">
          DAILY FOCUS
          <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-300" />
          <span className="h-px w-24 bg-blue-200 dark:bg-blue-300/30" />
        </div>

        <div className="mb-7 mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div key={`planner-heading-${activeList}`} className={styles.headingTransition}>
            <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
              {activeList === "today"
                ? `${formatPlannerDate(selectedDate)} 할 일 목록`
                : "대기·모니터링"}
            </h1>
            <span className="mt-4 block h-1 w-12 rounded-full bg-blue-600 dark:bg-blue-300" />
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {activeList === "waiting"
                ? "외부 조건을 기다리는 항목을 달성률과 분리해 관리합니다."
                : isTodaySelected
                  ? "오늘 해야 할 일을 기록하고 완료 상태를 관리합니다."
                  : `${formatKoreanDate(selectedDate)} 할 일을 기록하고 관리합니다.`}
            </p>
          </div>
          <div
            key={`planner-stats-${activeList}`}
            className={`${styles.headingTransition} flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400`}
          >
            {activeList === "today" ? (
              <>
                <span>{displayedCompletedTasks} 완료</span>
                <span className="h-4 w-px bg-slate-300 dark:bg-white/15" />
                <span>{displayedTasks.length} 전체</span>
              </>
            ) : (
              <>
                {dueWaitingItems ? (
                  <>
                    <span className="text-amber-700 dark:text-amber-300">
                      {dueWaitingItems} 확인 예정
                    </span>
                    <span className="h-4 w-px bg-slate-300 dark:bg-white/15" />
                  </>
                ) : null}
                <span>{waitingItems.length} 전체</span>
              </>
            )}
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200" role="alert">
            {error}
          </div>
        ) : null}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900">
            <div className="border-b border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-slate-900">
              <div
                className="relative grid w-full grid-cols-2 sm:w-[360px]"
                role="tablist"
                aria-label="Planner 목록"
              >
                <span
                  className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-md bg-blue-600 shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    activeList === "waiting" ? "translate-x-full" : "translate-x-0"
                  }`}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  role="tab"
                  id="planner-tab-today"
                  aria-controls="planner-panel-today"
                  aria-selected={activeList === "today"}
                  onClick={() => setActiveList("today")}
                  className={`relative z-10 inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-extrabold transition-colors duration-300 sm:gap-2 sm:px-3 sm:text-sm ${
                    activeList === "today"
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <ListTodo className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">오늘 할 일</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] transition-colors duration-300 ${activeList === "today" ? "bg-white/15" : "bg-slate-100 dark:bg-white/8"}`}>
                    {displayedTasks.length}
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  id="planner-tab-waiting"
                  aria-controls="planner-panel-waiting"
                  aria-selected={activeList === "waiting"}
                  onClick={() => setActiveList("waiting")}
                  className={`relative z-10 inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-extrabold transition-colors duration-300 sm:gap-2 sm:px-3 sm:text-sm ${
                    activeList === "waiting"
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <RadioTower className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">대기·모니터링</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] transition-colors duration-300 ${activeList === "waiting" ? "bg-white/15" : "bg-slate-100 dark:bg-white/8"}`}>
                    {waitingItems.length}
                  </span>
                </button>
              </div>
            </div>

            {activeList === "today" ? (
              <div
                key={`planner-panel-today-${selectedDate}`}
                id="planner-panel-today"
                role="tabpanel"
                aria-labelledby="planner-tab-today"
                className={styles.listTransition}
              >
                <div className={styles.listTransitionContent}>
            <form
              onSubmit={addTask}
              className="grid gap-3 border-b border-slate-200 bg-slate-50/80 p-4 md:grid-cols-[minmax(220px,1fr)_120px_116px_minmax(160px,0.7fr)_44px] dark:border-white/10 dark:bg-white/[0.03]"
            >
              <label className="sr-only" htmlFor="new-task-title">
                새 할 일
              </label>
              <input
                id="new-task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                placeholder="새 할 일을 입력하세요"
                className="h-11 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950 dark:placeholder:text-slate-500"
              />
              <CategoryPicker
                ariaLabel="새 할 일 카테고리"
                value={category}
                onChange={setCategory}
                size="field"
              />
              <label className="sr-only" htmlFor="new-task-time">
                완료 예정 시간
              </label>
              <input
                id="new-task-time"
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950"
              />
              <label className="sr-only" htmlFor="new-task-note">
                비고
              </label>
              <input
                id="new-task-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                placeholder="비고"
                className="h-11 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                title="할 일 추가"
                disabled={!title.trim() || isAdding || isLoadingSelectedDate}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45 md:w-11"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">할 일 추가</span>
              </button>
            </form>

            <div className="hidden grid-cols-[44px_minmax(150px,1fr)_88px_148px_minmax(160px,0.8fr)_76px] border-b border-slate-200 bg-white px-4 py-3 text-center text-xs font-extrabold text-slate-500 md:grid dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
              <span>완료</span>
              <span>할 일</span>
              <span>카테고리</span>
              <span>기한</span>
              <span>비고</span>
              <span>관리</span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {displayedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`grid gap-3 px-4 py-4 transition md:grid-cols-[44px_minmax(150px,1fr)_88px_148px_minmax(160px,0.8fr)_76px] md:items-center md:gap-0 ${
                    task.is_completed
                      ? "bg-slate-50/80 text-slate-400 dark:bg-white/[0.025] dark:text-slate-500"
                      : "bg-white hover:bg-blue-50/35 dark:bg-slate-900 dark:hover:bg-blue-400/[0.035]"
                  }`}
                >
                  <div className="order-last flex items-center justify-between md:order-none md:justify-center">
                    <span className="text-xs font-bold text-slate-400 md:hidden">완료</span>
                    <button
                      type="button"
                      onClick={() => void toggleTask(task.id)}
                      aria-label={`${task.title} ${task.is_completed ? "완료 취소" : "완료"}`}
                      aria-pressed={task.is_completed}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${
                        task.is_completed
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white text-transparent hover:border-blue-500 dark:border-white/25 dark:bg-slate-950"
                      }`}
                    >
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="min-w-0 md:px-3">
                    {editingTaskId === task.id ? (
                      <input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        onKeyDown={(event) => handleEditKeyDown(event, task.id)}
                        maxLength={200}
                        aria-label={`${task.title} 제목 수정`}
                        className="h-9 w-full rounded-md border border-blue-300 bg-white px-2 text-sm font-bold text-slate-900 outline-none ring-2 ring-blue-500/10 focus:border-blue-500 dark:border-blue-300/30 dark:bg-slate-950 dark:text-white"
                      />
                    ) : (
                      <p
                        className={`break-keep text-sm font-bold leading-6 ${
                          task.is_completed ? "line-through" : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {task.title}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:justify-center md:px-2">
                    <span className="text-xs font-bold text-slate-400 md:hidden">카테고리</span>
                    <CategoryPicker
                      value={task.category}
                      onChange={(nextCategory) =>
                        void updateCategory(task.id, nextCategory)
                      }
                      ariaLabel={`${task.title} 카테고리`}
                    />
                  </div>

                  <div
                    className={`min-w-0 text-sm font-semibold md:block md:px-2 md:text-center ${
                      editingTaskId === task.id
                        ? "flex flex-col items-stretch gap-2"
                        : "flex items-center justify-between"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-400 md:hidden">기한</span>
                    {editingTaskId === task.id ? (
                      <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_40px] items-center gap-1.5 md:flex md:flex-wrap md:justify-center">
                        <span className="shrink-0 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          {formatKoreanDate(task.task_date)}
                        </span>
                        <input
                          type="time"
                          value={editDueTime}
                          onChange={(event) => setEditDueTime(event.target.value)}
                          onKeyDown={(event) => handleEditKeyDown(event, task.id)}
                          aria-label={`${task.title} 예정 시간 수정`}
                          className="h-9 w-full min-w-0 rounded-md border border-blue-300 bg-white px-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 md:min-w-[86px] md:flex-1 dark:border-blue-300/30 dark:bg-slate-950 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setEditDueTime("")}
                          disabled={!editDueTime}
                          title="예정 시간 제거"
                          aria-label={`${task.title} 예정 시간 제거`}
                          className="group inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white"
                        >
                          <AlarmClockOff
                            className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    ) : (
                      <span className={task.is_completed ? "line-through" : "text-slate-600 dark:text-slate-300"}>
                        {formatKoreanDate(task.task_date)}
                        {task.due_time ? ` · ${task.due_time.slice(0, 5)}` : ""}
                      </span>
                    )}
                  </div>

                  <div
                    className={`min-w-0 md:block md:px-2 md:text-left ${
                      editingTaskId === task.id
                        ? "flex flex-col items-stretch gap-2"
                        : "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-400 md:hidden">비고</span>
                    {editingTaskId === task.id ? (
                      <input
                        value={editNote}
                        onChange={(event) => setEditNote(event.target.value)}
                        onKeyDown={(event) => handleEditKeyDown(event, task.id)}
                        maxLength={500}
                        placeholder="비고"
                        aria-label={`${task.title} 비고 수정`}
                        className="h-9 w-full rounded-md border border-blue-300 bg-white px-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-blue-300/30 dark:bg-slate-950 dark:text-white"
                      />
                    ) : (
                      <div className="flex min-w-0 items-start justify-end gap-1.5 md:justify-start">
                        <span className={`block min-w-0 max-w-full break-words text-right text-sm font-medium leading-5 [overflow-wrap:anywhere] md:text-left ${task.is_completed ? "line-through" : "text-slate-500 dark:text-slate-400"}`}>
                          {task.note || "-"}
                        </span>
                        {task.related_url ? (
                          <a
                            href={task.related_url}
                            target="_blank"
                            rel="noreferrer"
                            title="관련 링크 열기"
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-400/10"
                          >
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="sr-only">{task.title} 관련 링크 열기</span>
                          </a>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="order-first flex min-w-0 items-center justify-between gap-1 md:order-none md:justify-center">
                    <span className="text-xs font-bold text-slate-400 md:hidden">관리</span>
                    <div className="flex justify-end gap-1">
                      {editingTaskId === task.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveTaskEdit(task.id)}
                            disabled={!editTitle.trim() || isSavingEdit}
                            title="수정 저장"
                            className="group inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/8 dark:hover:text-slate-200"
                          >
                            <Save className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                            <span className="sr-only">{task.title} 수정 저장</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={isSavingEdit}
                            title="수정 취소"
                            className="group inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/8 dark:hover:text-slate-200"
                          >
                            <X className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                            <span className="sr-only">{task.title} 수정 취소</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditing(task)}
                            title="할 일 수정"
                            className="group inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/8 dark:hover:text-slate-200"
                          >
                            <Pencil className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                            <span className="sr-only">{task.title} 수정</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(task.id)}
                            title="할 일 삭제"
                            className="group inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/8 dark:hover:text-slate-200"
                          >
                            <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                            <span className="sr-only">{task.title} 삭제</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoadingSelectedDate && !isTodaySelected ? (
                <div
                  className="flex min-h-28 items-center justify-center gap-2 px-5 py-8 text-sm font-bold text-slate-500 dark:text-slate-400"
                  role="status"
                  aria-live="polite"
                >
                  <LoaderCircle
                    className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-300"
                    aria-hidden="true"
                  />
                  <span>할 일 목록을 불러오는 중</span>
                </div>
              ) : displayedTasks.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <Check className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                  <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                    {isTodaySelected
                      ? "오늘 등록된 할 일이 없습니다."
                      : "선택한 날짜에 등록된 할 일이 없습니다."}
                  </p>
                </div>
              ) : null}
            </div>
                </div>
              </div>
            ) : (
              <div
                key="planner-panel-waiting"
                id="planner-panel-waiting"
                role="tabpanel"
                aria-labelledby="planner-tab-waiting"
                className={styles.listTransition}
              >
                <div className={styles.listTransitionContent}>
                  <WaitingItemsPanel
                    connectionMode={connectionMode}
                    items={waitingItems}
                    onConverted={handleWaitingItemConverted}
                    onError={setError}
                    ownerId={ownerId}
                    setItems={setWaitingItems}
                    today={today}
                  />
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">
                    {achievementLabel}
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-slate-950 dark:text-white">
                    {selectedAchievementRate}%
                  </p>
                </div>
                <div className="text-right text-sm font-bold text-slate-500 dark:text-slate-400">
                  <p>{selectedCompletedTasks} / {selectedTotalTasks}</p>
                  <p className="mt-1 text-xs">완료한 할 일</p>
                </div>
              </div>
              <div
                className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8"
                role="progressbar"
                aria-label={achievementLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={selectedAchievementRate}
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out"
                  style={{ width: `${selectedAchievementRate}%` }}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-5 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  title="이전 달"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:text-slate-400 dark:hover:border-emerald-300/40 dark:hover:text-emerald-300"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">이전 달</span>
                </button>
                <div className="text-center">
                  <p className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-300">
                    월간 잔디 달력
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold">
                    {formatMonthTitle(monthCursor)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  title="다음 달"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:text-slate-400 dark:hover:border-emerald-300/40 dark:hover:text-emerald-300"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">다음 달</span>
                </button>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-slate-400">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <span key={day} className="py-1">{day}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {getCalendarCells(monthCursor).map((cell) => {
                  const progress = displayedProgressByDate[cell.date];
                  const rate = progress?.achievement_rate ?? 0;
                  const hasProgress = Boolean(progress);
                  const isToday = cell.date === today;
                  const isSelected = cell.date === selectedDate;

                  return (
                    <button
                      key={cell.date}
                      type="button"
                      onClick={() => void selectCalendarDate(cell.date)}
                      aria-label={`${formatKoreanDate(cell.date)} 달성률 ${rate}%`}
                      aria-pressed={isSelected}
                      title={`${formatKoreanDate(cell.date)} · ${rate}%`}
                      className={`group relative flex aspect-square min-w-0 flex-col items-center justify-center rounded-md border text-center transition hover:-translate-y-0.5 hover:shadow-md ${getGrassCellClass(rate, cell.isCurrentMonth, hasProgress)} ${
                        isToday ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900" : ""
                      } ${isSelected ? "border-slate-900 dark:border-white" : ""}`}
                    >
                      <span className="absolute left-1.5 top-1 text-[10px] font-extrabold leading-none">
                        {cell.day}
                      </span>
                      <Sprout
                        className={`mt-2 h-4 w-4 transition duration-200 group-hover:-rotate-6 group-hover:scale-110 ${
                          hasProgress ? "opacity-100" : "opacity-30"
                        }`}
                        aria-hidden="true"
                      />
                      {hasProgress ? (
                        <span className="mt-0.5 text-[9px] font-extrabold leading-none">
                          {rate}%
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-xs font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
                <span>{formatKoreanDate(selectedDate)}</span>
                <span>
                  {selectedProgress
                    ? `${selectedProgress.completed_tasks}/${selectedProgress.total_tasks} 완료 · ${selectedProgress.achievement_rate}%`
                    : "기록 없음"}
                </span>
              </div>

            </section>
          </aside>
        </div>
      </div>

      {pendingDeleteTask ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-5 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) {
              setPendingDeleteId(null);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-task-title"
            aria-describedby="delete-task-description"
            className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-slate-300">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 id="delete-task-title" className="mt-5 text-xl font-extrabold">
              할 일을 삭제할까요?
            </h2>
            <p id="delete-task-description" className="mt-3 break-keep text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {pendingDeleteTask.title}
              </span>
              을 삭제하면 다시 복구할 수 없습니다.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                disabled={isDeleting}
                autoFocus
                className="h-11 rounded-lg border border-slate-200 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/6"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void deleteTask(pendingDeleteTask.id)}
                disabled={isDeleting}
                className="h-11 rounded-lg bg-slate-900 text-sm font-extrabold text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {isDeleting ? "삭제 중" : "삭제"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function indexProgress(progressRows: DailyProgress[]) {
  return Object.fromEntries(
    progressRows.map((progress) => [progress.progress_date, progress]),
  );
}

function sortTasks(tasks: PlannerTask[]) {
  return [...tasks].sort(
    (left, right) =>
      left.sort_order - right.sort_order ||
      left.created_at.localeCompare(right.created_at),
  );
}

function shiftMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthTitle(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}년 ${month}월`;
}

function getCalendarCells(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const gridStart = Date.UTC(year, month - 1, 1 - firstDay.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart + index * 24 * 60 * 60 * 1000);
    const cellYear = date.getUTCFullYear();
    const cellMonth = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    return {
      date: `${cellYear}-${String(cellMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day,
      isCurrentMonth: cellYear === year && cellMonth === month,
    };
  });
}

function getGrassCellClass(
  rate: number,
  isCurrentMonth: boolean,
  hasProgress: boolean,
) {
  if (!isCurrentMonth) {
    return "border-transparent bg-slate-50 text-slate-300 dark:bg-white/[0.025] dark:text-slate-700";
  }
  if (!hasProgress || rate === 0) {
    return "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 dark:border-white/10 dark:bg-white/[0.025] dark:text-slate-400";
  }
  if (rate < 25) {
    return "border-emerald-100 bg-emerald-100 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-100";
  }
  if (rate < 50) {
    return "border-emerald-300 bg-emerald-300 text-emerald-950 dark:border-emerald-400/35 dark:bg-emerald-500/35 dark:text-white";
  }
  if (rate < 75) {
    return "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400/55 dark:bg-emerald-600 dark:text-white";
  }
  if (rate < 100) {
    return "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-400/65 dark:bg-emerald-700 dark:text-white";
  }
  return "border-emerald-700 bg-emerald-700 text-white shadow-[0_8px_20px_rgba(4,120,87,0.24)] dark:border-emerald-400/75 dark:bg-emerald-500 dark:text-white";
}
