import type { NextRequest } from "next/server";
import { convertWaitingItem } from "@/lib/planner/service";
import type { TaskCategory } from "@/lib/planner/types";

const categories = new Set<TaskCategory>(["work", "personal", "other"]);
const noStoreHeaders = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const category = body.category as TaskCategory;
    const dueTime = body.dueTime === null || body.dueTime === ""
      ? null
      : body.dueTime;

    if (
      !isUuid(body.waitingItemId) ||
      !isUuid(body.taskId) ||
      !categories.has(category) ||
      (dueTime !== null &&
        (typeof dueTime !== "string" || !/^\d{2}:\d{2}$/.test(dueTime)))
    ) {
      return Response.json(
        { error: "전환 입력값이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const task = await convertWaitingItem({
      category,
      dueTime,
      taskId: body.taskId,
      waitingItemId: body.waitingItemId,
    });

    return Response.json({ task }, { headers: noStoreHeaders, status: 201 });
  } catch (error) {
    console.error("Planner waiting conversion API error", error);
    return Response.json(
      { error: "대기 항목을 오늘 할 일로 전환하지 못했습니다." },
      { headers: noStoreHeaders, status: 500 },
    );
  }
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}
