import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";
import { PlannerDashboard } from "@/components/planner/planner-dashboard";
import { createPreviewTasks } from "@/lib/planner/constants";
import { getSeoulDateString } from "@/lib/planner/date";
import { getPlannerSnapshot } from "@/lib/planner/service";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Planner | 윤태준(YUN TAE JUN)",
  description: "오늘의 할 일과 월간 달성 기록",
  robots: { index: false, follow: false },
};

export default async function PlannerPage() {
  const today = getSeoulDateString();

  if (!isSupabaseAdminConfigured()) {
    if (process.env.NODE_ENV === "development") {
      return (
        <PlannerDashboard
          connectionMode="preview"
          initialProgress={[]}
          initialTasks={createPreviewTasks(today)}
          ownerId="local-preview"
          today={today}
        />
      );
    }

    return <PlannerSetupRequired />;
  }

  const result = await loadPlannerSnapshot(today);
  if (!result.ok) {
    return (
      <PlannerDatabaseError message={result.error} />
    );
  }

  return (
    <PlannerDashboard
      connectionMode="connected"
      initialProgress={result.snapshot.progress}
      initialTasks={result.snapshot.tasks}
      ownerId={result.snapshot.ownerId}
      today={today}
    />
  );
}

async function loadPlannerSnapshot(today: string) {
  try {
    return {
      ok: true as const,
      snapshot: await getPlannerSnapshot(today, today.slice(0, 7)),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      ok: false as const,
    };
  }
}

function PlannerSetupRequired() {
  return (
    <PlannerStateFrame title="Planner 연결이 필요합니다">
      <p className="mt-4 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
        Supabase 서버 환경변수가 아직 배포 환경에 연결되지 않았습니다.
      </p>
    </PlannerStateFrame>
  );
}

function PlannerDatabaseError({ message }: { message: string }) {
  return (
    <PlannerStateFrame title="Planner 데이터를 불러오지 못했습니다">
      <p className="mt-4 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
        Supabase 연결과 Planner 스키마 상태를 확인해야 합니다.
      </p>
      <p className="mt-3 break-all rounded-lg bg-slate-100 px-4 py-3 font-mono text-xs text-slate-600 dark:bg-white/5 dark:text-slate-400">
        {message}
      </p>
    </PlannerStateFrame>
  );
}

function PlannerStateFrame({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5 py-12 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
          <Database className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-normal">{title}</h1>
        {children}
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          포트폴리오로 돌아가기
        </Link>
      </section>
    </main>
  );
}
