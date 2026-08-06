"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import {
  ArrowRight,
  CalendarClock,
  ExternalLink,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { CategoryPicker } from "@/components/planner/category-picker";
import { formatKoreanDate } from "@/lib/planner/date";
import type {
  PlannerTask,
  TaskCategory,
  WaitingItem,
} from "@/lib/planner/types";

type WaitingItemsPanelProps = {
  connectionMode: "connected" | "preview";
  items: WaitingItem[];
  onConverted: (task: PlannerTask) => void;
  onError: (message: string) => void;
  ownerId: string;
  setItems: Dispatch<SetStateAction<WaitingItem[]>>;
  today: string;
};

export function WaitingItemsPanel({
  connectionMode,
  items,
  onConverted,
  onError,
  ownerId,
  setItems,
  today,
}: WaitingItemsPanelProps) {
  const [title, setTitle] = useState("");
  const [nextCheckDate, setNextCheckDate] = useState("");
  const [note, setNote] = useState("");
  const [relatedUrl, setRelatedUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNextCheckDate, setEditNextCheckDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editRelatedUrl, setEditRelatedUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [convertingItem, setConvertingItem] = useState<WaitingItem | null>(null);
  const [convertCategory, setConvertCategory] =
    useState<TaskCategory>("personal");
  const [convertDueTime, setConvertDueTime] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const isConnected = connectionMode === "connected";
  const pendingDeleteItem = items.find((item) => item.id === pendingDeleteId);

  useEffect(() => {
    if (!pendingDeleteId && !convertingItem) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!isDeleting) setPendingDeleteId(null);
      if (!isConverting) setConvertingItem(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [convertingItem, isConverting, isDeleting, pendingDeleteId]);

  async function addWaitingItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedUrl = relatedUrl.trim();
    if (!trimmedTitle || isAdding) return;
    if (!isOptionalHttpUrl(trimmedUrl)) {
      onError("관련 링크는 http:// 또는 https:// 주소로 입력해 주세요.");
      return;
    }

    setIsAdding(true);
    onError("");
    const previousItems = items;
    const now = new Date().toISOString();
    const waitingItem: WaitingItem = {
      created_at: now,
      id: crypto.randomUUID(),
      next_check_date: nextCheckDate || null,
      note: note.trim(),
      owner_id: ownerId,
      related_url: trimmedUrl,
      title: trimmedTitle,
      updated_at: now,
    };

    setItems((current) => sortWaitingItems([...current, waitingItem]));
    setTitle("");
    setNextCheckDate("");
    setNote("");
    setRelatedUrl("");

    if (isConnected) {
      const response = await fetch("/api/planner/waiting", {
        body: JSON.stringify({
          id: waitingItem.id,
          nextCheckDate: waitingItem.next_check_date,
          note: waitingItem.note,
          relatedUrl: waitingItem.related_url,
          title: waitingItem.title,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        setItems(previousItems);
        onError("대기 항목을 추가하지 못했습니다.");
      }
    }

    setIsAdding(false);
  }

  function startEditing(item: WaitingItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditNextCheckDate(item.next_check_date ?? "");
    setEditNote(item.note);
    setEditRelatedUrl(item.related_url);
    onError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditNextCheckDate("");
    setEditNote("");
    setEditRelatedUrl("");
  }

  async function saveWaitingItem(itemId: string) {
    const trimmedTitle = editTitle.trim();
    const trimmedUrl = editRelatedUrl.trim();
    if (!trimmedTitle || isSaving) return;
    if (!isOptionalHttpUrl(trimmedUrl)) {
      onError("관련 링크는 http:// 또는 https:// 주소로 입력해 주세요.");
      return;
    }

    const previousItems = items;
    const currentItem = items.find((item) => item.id === itemId);
    if (!currentItem) return;
    const updatedItem: WaitingItem = {
      ...currentItem,
      next_check_date: editNextCheckDate || null,
      note: editNote.trim(),
      related_url: trimmedUrl,
      title: trimmedTitle,
      updated_at: new Date().toISOString(),
    };

    setIsSaving(true);
    onError("");
    setItems((current) =>
      sortWaitingItems(
        current.map((item) => (item.id === itemId ? updatedItem : item)),
      ),
    );

    if (isConnected) {
      const response = await fetch("/api/planner/waiting", {
        body: JSON.stringify({
          id: itemId,
          nextCheckDate: updatedItem.next_check_date,
          note: updatedItem.note,
          relatedUrl: updatedItem.related_url,
          title: updatedItem.title,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });

      if (!response.ok) {
        setItems(previousItems);
        onError("대기 항목 수정을 저장하지 못했습니다.");
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
    cancelEditing();
  }

  async function deleteWaitingItem(itemId: string) {
    const previousItems = items;
    setIsDeleting(true);
    setItems((current) => current.filter((item) => item.id !== itemId));

    if (isConnected) {
      const response = await fetch(
        `/api/planner/waiting?id=${encodeURIComponent(itemId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        setItems(previousItems);
        onError("대기 항목을 삭제하지 못했습니다.");
      }
    }

    setIsDeleting(false);
    setPendingDeleteId(null);
  }

  function openConversion(item: WaitingItem) {
    setConvertCategory("personal");
    setConvertDueTime("");
    setConvertingItem(item);
    onError("");
  }

  async function convertToToday() {
    if (!convertingItem || isConverting) return;
    setIsConverting(true);
    onError("");
    const taskId = crypto.randomUUID();
    let convertedTask: PlannerTask;

    if (isConnected) {
      const response = await fetch("/api/planner/waiting/convert", {
        body: JSON.stringify({
          category: convertCategory,
          dueTime: convertDueTime || null,
          taskId,
          waitingItemId: convertingItem.id,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        onError("오늘 할 일로 전환하지 못했습니다.");
        setIsConverting(false);
        return;
      }

      const data = (await response.json()) as { task: PlannerTask };
      convertedTask = data.task;
    } else {
      const now = new Date().toISOString();
      convertedTask = {
        category: convertCategory,
        completed_at: null,
        created_at: now,
        due_time: convertDueTime || null,
        id: taskId,
        is_completed: false,
        note: convertingItem.note,
        owner_id: ownerId,
        related_url: convertingItem.related_url,
        sort_order: 10,
        task_date: today,
        template_id: null,
        title: convertingItem.title,
        updated_at: now,
      };
    }

    setItems((current) =>
      current.filter((item) => item.id !== convertingItem.id),
    );
    onConverted(convertedTask);
    setConvertingItem(null);
    setIsConverting(false);
  }

  return (
    <>
      <form
        onSubmit={addWaitingItem}
        className="grid gap-3 border-b border-slate-200 bg-slate-50/80 p-4 lg:grid-cols-[minmax(200px,1fr)_150px_minmax(160px,0.75fr)_minmax(180px,0.8fr)_44px] dark:border-white/10 dark:bg-white/[0.03]"
      >
        <label className="sr-only" htmlFor="waiting-title">대기 항목</label>
        <input
          id="waiting-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          placeholder="모니터링할 항목을 입력하세요"
          className="h-11 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950 dark:placeholder:text-slate-500"
        />
        <label className="sr-only" htmlFor="waiting-check-date">다음 확인일</label>
        <input
          id="waiting-check-date"
          type="date"
          value={nextCheckDate}
          onChange={(event) => setNextCheckDate(event.target.value)}
          className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950"
        />
        <label className="sr-only" htmlFor="waiting-note">비고</label>
        <input
          id="waiting-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          placeholder="비고"
          className="h-11 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950 dark:placeholder:text-slate-500"
        />
        <label className="sr-only" htmlFor="waiting-url">관련 링크</label>
        <input
          id="waiting-url"
          type="url"
          value={relatedUrl}
          onChange={(event) => setRelatedUrl(event.target.value)}
          maxLength={2048}
          placeholder="관련 링크"
          className="h-11 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-white/10 dark:bg-slate-950 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          title="대기 항목 추가"
          disabled={!title.trim() || isAdding}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45 lg:w-11"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">대기 항목 추가</span>
        </button>
      </form>

      <div className="hidden grid-cols-[minmax(180px,1fr)_132px_minmax(160px,0.8fr)_64px_116px] border-b border-slate-200 bg-white px-4 py-3 text-center text-xs font-extrabold text-slate-500 md:grid dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
        <span>대기 항목</span>
        <span>다음 확인일</span>
        <span>비고</span>
        <span>링크</span>
        <span>관리</span>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-white/10">
        {items.map((item) => {
          const isDue = Boolean(item.next_check_date && item.next_check_date <= today);
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className={`grid gap-4 bg-white px-4 py-4 transition hover:bg-blue-50/35 md:items-center md:gap-0 dark:bg-slate-900 dark:hover:bg-blue-400/[0.035] ${
                isEditing
                  ? "md:grid-cols-[minmax(150px,1fr)_132px_minmax(140px,0.65fr)_minmax(180px,0.8fr)_80px]"
                  : "md:grid-cols-[minmax(180px,1fr)_132px_minmax(160px,0.8fr)_64px_116px]"
              }`}
            >
              <div className="min-w-0 md:px-3">
                <span className="mb-1 block text-xs font-bold text-slate-400 md:hidden">대기 항목</span>
                {isEditing ? (
                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    maxLength={200}
                    aria-label={`${item.title} 제목 수정`}
                    className="h-9 w-full rounded-md border border-blue-300 bg-white px-2 text-sm font-bold outline-none focus:border-blue-500 dark:border-blue-300/30 dark:bg-slate-950"
                  />
                ) : (
                  <p className="break-words text-sm font-bold leading-6 text-slate-800 [overflow-wrap:anywhere] dark:text-slate-100">
                    {item.title}
                  </p>
                )}
              </div>

              <div className="min-w-0 md:px-2 md:text-center">
                <span className="mb-1 block text-xs font-bold text-slate-400 md:hidden">다음 확인일</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={editNextCheckDate}
                    onChange={(event) => setEditNextCheckDate(event.target.value)}
                    aria-label={`${item.title} 다음 확인일 수정`}
                    className="h-9 w-full rounded-md border border-blue-300 bg-white px-2 text-xs font-bold outline-none focus:border-blue-500 dark:border-blue-300/30 dark:bg-slate-950"
                  />
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      isDue
                        ? "text-amber-700 dark:text-amber-300"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.next_check_date
                      ? formatKoreanDate(item.next_check_date)
                      : "미정"}
                  </span>
                )}
              </div>

              <div className="min-w-0 md:px-3">
                <span className="mb-1 block text-xs font-bold text-slate-400 md:hidden">비고</span>
                {isEditing ? (
                  <input
                    value={editNote}
                    onChange={(event) => setEditNote(event.target.value)}
                    maxLength={500}
                    placeholder="비고"
                    aria-label={`${item.title} 비고 수정`}
                    className="h-9 w-full rounded-md border border-blue-300 bg-white px-2 text-sm font-medium outline-none focus:border-blue-500 dark:border-blue-300/30 dark:bg-slate-950"
                  />
                ) : (
                  <p className="break-words text-sm font-medium leading-5 text-slate-500 [overflow-wrap:anywhere] dark:text-slate-400">
                    {item.note || "-"}
                  </p>
                )}
              </div>

              <div className="min-w-0 md:px-2 md:text-center">
                <span className="mb-1 block text-xs font-bold text-slate-400 md:hidden">관련 링크</span>
                {isEditing ? (
                  <input
                    type="url"
                    value={editRelatedUrl}
                    onChange={(event) => setEditRelatedUrl(event.target.value)}
                    maxLength={2048}
                    placeholder="https://"
                    aria-label={`${item.title} 관련 링크 수정`}
                    className="h-9 w-full rounded-md border border-blue-300 bg-white px-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-blue-300/30 dark:bg-slate-950"
                  />
                ) : item.related_url ? (
                  <a
                    href={item.related_url}
                    target="_blank"
                    rel="noreferrer"
                    title="관련 링크 열기"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-400/10"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{item.title} 관련 링크 열기</span>
                  </a>
                ) : (
                  <span className="text-sm text-slate-300 dark:text-slate-600">-</span>
                )}
              </div>

              <div className="order-first flex min-w-0 items-center justify-between gap-1 md:order-none md:justify-center">
                <span className="text-xs font-bold text-slate-400 md:hidden">관리</span>
                <div className="flex justify-end gap-0.5">
                  {isEditing ? (
                    <>
                      <IconButton
                        label={`${item.title} 수정 저장`}
                        title="수정 저장"
                        onClick={() => void saveWaitingItem(item.id)}
                        disabled={!editTitle.trim() || isSaving}
                      >
                        <Save className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={`${item.title} 수정 취소`}
                        title="수정 취소"
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        label={`${item.title} 오늘 할 일로 전환`}
                        title="오늘 할 일로 전환"
                        onClick={() => openConversion(item)}
                      >
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={`${item.title} 수정`}
                        title="대기 항목 수정"
                        onClick={() => startEditing(item)}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={`${item.title} 삭제`}
                        title="대기 항목 삭제"
                        onClick={() => setPendingDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </IconButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">
              모니터링 중인 대기 항목이 없습니다.
            </p>
          </div>
        ) : null}
      </div>

      {convertingItem ? (
        <ModalBackdrop
          onDismiss={() => {
            if (!isConverting) setConvertingItem(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="convert-waiting-title"
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 id="convert-waiting-title" className="mt-5 text-xl font-extrabold">
              오늘 할 일로 전환
            </h2>
            <p className="mt-2 break-words text-sm font-bold text-slate-700 [overflow-wrap:anywhere] dark:text-slate-200">
              {convertingItem.title}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold text-slate-500 dark:text-slate-400">카테고리</span>
                <CategoryPicker
                  ariaLabel="전환할 할 일 카테고리"
                  value={convertCategory}
                  onChange={setConvertCategory}
                  size="field"
                  disabled={isConverting}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-extrabold text-slate-500 dark:text-slate-400">예정 시간</span>
                <input
                  type="time"
                  value={convertDueTime}
                  onChange={(event) => setConvertDueTime(event.target.value)}
                  disabled={isConverting}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 disabled:opacity-50 dark:border-white/10 dark:bg-slate-950"
                />
              </label>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConvertingItem(null)}
                disabled={isConverting}
                className="h-11 rounded-lg border border-slate-200 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/6"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void convertToToday()}
                disabled={isConverting}
                className="h-11 rounded-lg bg-blue-600 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isConverting ? "전환 중" : "전환"}
              </button>
            </div>
          </section>
        </ModalBackdrop>
      ) : null}

      {pendingDeleteItem ? (
        <ModalBackdrop
          onDismiss={() => {
            if (!isDeleting) setPendingDeleteId(null);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-waiting-title"
            className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-slate-300">
              <Trash2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 id="delete-waiting-title" className="mt-5 text-xl font-extrabold">대기 항목을 삭제할까요?</h2>
            <p className="mt-3 break-words text-sm font-medium leading-6 text-slate-500 [overflow-wrap:anywhere] dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-200">{pendingDeleteItem.title}</span>을 삭제하면 다시 복구할 수 없습니다.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                disabled={isDeleting}
                className="h-11 rounded-lg border border-slate-200 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/6"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void deleteWaitingItem(pendingDeleteItem.id)}
                disabled={isDeleting}
                className="h-11 rounded-lg bg-slate-900 text-sm font-extrabold text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {isDeleting ? "삭제 중" : "삭제"}
              </button>
            </div>
          </section>
        </ModalBackdrop>
      ) : null}
    </>
  );
}

function IconButton({
  children,
  disabled = false,
  label,
  onClick,
  title,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="group inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/8 dark:hover:text-slate-200"
    >
      <span className="transition-transform duration-200 group-hover:scale-110">{children}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

function ModalBackdrop({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 px-5 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      {children}
    </div>
  );
}

function sortWaitingItems(items: WaitingItem[]) {
  return [...items].sort((left, right) => {
    if (!left.next_check_date && right.next_check_date) return 1;
    if (left.next_check_date && !right.next_check_date) return -1;
    if (left.next_check_date && right.next_check_date) {
      const dateOrder = left.next_check_date.localeCompare(right.next_check_date);
      if (dateOrder) return dateOrder;
    }
    return left.created_at.localeCompare(right.created_at);
  });
}

function isOptionalHttpUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
