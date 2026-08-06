import type { NextRequest } from "next/server";
import {
  createWaitingItem,
  deleteWaitingItem,
  updateWaitingItem,
} from "@/lib/planner/service";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return forbidden();

  try {
    const input = parseWaitingItemInput(await request.json());
    if (!input.ok || !isUuid(input.body.id)) return invalidInput();

    const waitingItem = await createWaitingItem({
      ...input.value,
      id: input.body.id,
    });

    return Response.json(
      { waitingItem },
      { headers: noStoreHeaders, status: 201 },
    );
  } catch (error) {
    return plannerError(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request)) return forbidden();

  try {
    const input = parseWaitingItemInput(await request.json());
    if (!input.ok || !isUuid(input.body.id)) return invalidInput();

    const waitingItem = await updateWaitingItem(input.body.id, input.value);
    return Response.json({ waitingItem }, { headers: noStoreHeaders });
  } catch (error) {
    return plannerError(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return forbidden();

  const waitingItemId = request.nextUrl.searchParams.get("id");
  if (!isUuid(waitingItemId)) return invalidInput();

  try {
    await deleteWaitingItem(waitingItemId);
    return Response.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    return plannerError(error);
  }
}

function parseWaitingItemInput(value: unknown) {
  const body = value as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const relatedUrl = typeof body.relatedUrl === "string"
    ? body.relatedUrl.trim()
    : "";
  const nextCheckDate = body.nextCheckDate === null || body.nextCheckDate === ""
    ? null
    : body.nextCheckDate;

  if (
    !title ||
    title.length > 200 ||
    note.length > 500 ||
    (nextCheckDate !== null && !isDate(nextCheckDate)) ||
    !isOptionalHttpUrl(relatedUrl)
  ) {
    return { body, ok: false as const };
  }

  return {
    body,
    ok: true as const,
    value: {
      nextCheckDate,
      note,
      relatedUrl,
      title,
    },
  };
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

function invalidInput() {
  return Response.json(
    { error: "대기 항목 입력값이 올바르지 않습니다." },
    { status: 400 },
  );
}

function forbidden() {
  return Response.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
}

function plannerError(error: unknown) {
  console.error("Planner waiting item API error", error);
  return Response.json(
    { error: "대기 항목을 처리하지 못했습니다." },
    { headers: noStoreHeaders, status: 500 },
  );
}
