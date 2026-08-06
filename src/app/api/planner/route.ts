import type { NextRequest } from "next/server";
import {
  createPlannerTask,
  deletePlannerTask,
  getPlannerSnapshot,
  updatePlannerTask,
} from "@/lib/planner/service";
import { getSeoulDateString } from "@/lib/planner/date";
import type { TaskCategory } from "@/lib/planner/types";

const categories = new Set<TaskCategory>(["work", "personal", "other"]);
const noStoreHeaders = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const today = getSeoulDateString();
  const month = request.nextUrl.searchParams.get("month") ?? today.slice(0, 7);
  const taskDate = request.nextUrl.searchParams.get("date") ?? today;

  if (!/^\d{4}-\d{2}$/.test(month) || !isDate(taskDate)) {
    return Response.json({ error: "잘못된 날짜 형식입니다." }, { status: 400 });
  }

  try {
    const snapshot = await getPlannerSnapshot(taskDate, month);
    return Response.json(snapshot, { headers: noStoreHeaders });
  } catch (error) {
    return plannerError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbidden();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const relatedUrl = typeof body.relatedUrl === "string"
      ? body.relatedUrl.trim()
      : "";
    const category = body.category as TaskCategory;
    const dueTime = typeof body.dueTime === "string" && body.dueTime
      ? body.dueTime
      : null;

    if (
      !isUuid(body.id) ||
      !isDate(body.taskDate) ||
      !title ||
      title.length > 200 ||
      note.length > 500 ||
      !isOptionalHttpUrl(relatedUrl) ||
      !categories.has(category) ||
      (dueTime !== null && !/^\d{2}:\d{2}$/.test(dueTime)) ||
      typeof body.sortOrder !== "number"
    ) {
      return Response.json({ error: "할 일 입력값이 올바르지 않습니다." }, { status: 400 });
    }

    const task = await createPlannerTask({
      category,
      dueTime,
      id: body.id,
      note,
      relatedUrl,
      sortOrder: body.sortOrder,
      taskDate: body.taskDate,
      title,
    });

    return Response.json({ task }, { headers: noStoreHeaders, status: 201 });
  } catch (error) {
    return plannerError(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request)) return forbidden();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!isUuid(body.id)) {
      return Response.json({ error: "잘못된 할 일 ID입니다." }, { status: 400 });
    }

    const update: {
      category?: TaskCategory;
      completedAt?: string | null;
      dueTime?: string | null;
      isCompleted?: boolean;
      note?: string;
      title?: string;
    } = {};

    if (body.category !== undefined) {
      if (!categories.has(body.category as TaskCategory)) {
        return Response.json({ error: "잘못된 카테고리입니다." }, { status: 400 });
      }
      update.category = body.category as TaskCategory;
    }

    if (body.isCompleted !== undefined) {
      if (typeof body.isCompleted !== "boolean") {
        return Response.json({ error: "완료 상태가 올바르지 않습니다." }, { status: 400 });
      }
      update.isCompleted = body.isCompleted;
      update.completedAt = body.isCompleted ? new Date().toISOString() : null;
    }

    if (body.title !== undefined) {
      const title = typeof body.title === "string" ? body.title.trim() : "";
      if (!title || title.length > 200) {
        return Response.json({ error: "할 일 제목이 올바르지 않습니다." }, { status: 400 });
      }
      update.title = title;
    }

    if (body.note !== undefined) {
      const note = typeof body.note === "string" ? body.note.trim() : "";
      if (note.length > 500) {
        return Response.json({ error: "비고가 너무 깁니다." }, { status: 400 });
      }
      update.note = note;
    }

    if (body.dueTime !== undefined) {
      const dueTime = body.dueTime === null || body.dueTime === ""
        ? null
        : body.dueTime;
      if (dueTime !== null && (typeof dueTime !== "string" || !/^\d{2}:\d{2}$/.test(dueTime))) {
        return Response.json({ error: "예정 시간이 올바르지 않습니다." }, { status: 400 });
      }
      update.dueTime = dueTime;
    }

    if (
      update.category === undefined &&
      update.isCompleted === undefined &&
      update.title === undefined &&
      update.note === undefined &&
      update.dueTime === undefined
    ) {
      return Response.json({ error: "변경할 값이 없습니다." }, { status: 400 });
    }

    await updatePlannerTask(body.id, update);
    return Response.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    return plannerError(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return forbidden();

  const taskId = request.nextUrl.searchParams.get("id");
  if (!isUuid(taskId)) {
    return Response.json({ error: "잘못된 할 일 ID입니다." }, { status: 400 });
  }

  try {
    await deletePlannerTask(taskId);
    return Response.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    return plannerError(error);
  }
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function isOptionalHttpUrl(value: string) {
  if (!value) return true;
  if (value.length > 2048) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function forbidden() {
  return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
}

function plannerError(error: unknown) {
  console.error("Planner API error", error);
  return Response.json(
    { error: "Planner 데이터를 처리하지 못했습니다." },
    { headers: noStoreHeaders, status: 500 },
  );
}
