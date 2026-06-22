import Image from "next/image";
import type { SimpleIcon } from "simple-icons";
import { siGithub, siNaver } from "simple-icons";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BookMarked,
  CalendarDays,
  Code2,
  Download,
  FileSpreadsheet,
  FileText,
  Folder,
  Landmark,
  Mail,
  MapPin,
  Newspaper,
  Palette,
  Phone,
  Star,
  UsersRound,
} from "lucide-react";
import { CountUpNumber } from "@/components/count-up-number";
import { ThemeToggle } from "@/components/theme-toggle";
import { TravelImageSlider } from "@/components/travel-image-slider";

const contact = {
  name: "윤태준(YUN TAE JUN)",
  role: "Full-stack Developer & Designer",
  email: "gotoward7@gmail.com",
  phone: "010-6348-8726",
  location: "Seoul, Korea",
  github: "https://github.com/Junebooky",
  blog: "https://blog.naver.com/junebooky",
};

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

const socialLinks: Array<{
  label: string;
  href: string;
  brandIcon?: SimpleIcon;
  lucideIcon?: LucideIcon;
  color?: string;
}> = [
  {
    label: "GitHub",
    href: contact.github,
    brandIcon: siGithub,
    color: "currentColor",
  },
  {
    label: "Blog",
    href: contact.blog,
    brandIcon: siNaver,
    color: "currentColor",
  },
  { label: "Email", href: `mailto:${contact.email}`, lucideIcon: Mail },
];

const valueCards: Array<{
  title: string;
  description: string[];
  icon: LucideIcon;
}> = [
  {
    title: "Full-stack 개발자",
    icon: Code2,
    description: [
      "웹 서비스 기획, 설계, 개발 및 운영 경험",
      "React, Node.js 기반의 서비스 구축",
      "데이터베이스 설계 및 API 개발",
    ],
  },
  {
    title: "디자이너",
    icon: Palette,
    description: [
      "사용자 중심의 UI/UX 설계 및 디자인",
      "프로토타이핑 및 사용자 테스트",
      "디자인 시스템 구축 및 일관성 관리",
    ],
  },
  {
    title: "산업부 / 경제부 경험",
    icon: Landmark,
    description: [
      "산업/경제 데이터 분석 및 인사이트 도출",
      "정책, 시장 동향 리서치 및 보고서 작성",
      "이해관계자 커뮤니케이션 및 협업 경험",
    ],
  },
];

const insightCards: Array<{
  title: string;
  body: string;
  icon: LucideIcon;
}> = [
  {
    title: "경제부 / 산업부 기자 경력",
    body: "경제·산업 이슈 취재 및 분석, 기업·정책 리포트 작성 경험",
    icon: Newspaper,
  },
  {
    title: "TSN Korea 스포츠 전문기자 경력",
    body: "해외 TSN 뉴스를 국내 독자를 위해 한국어로 번역·콘텐츠 제작 경험",
    icon: FileText,
  },
  {
    title: "국내 산업 분석 및 아카이빙 역량",
    body: "반도체, IT, 모빌리티 등 주요 산업의 트렌드와 구조를 체계적으로 분석",
    icon: Folder,
  },
  {
    title: "블로그와 엑셀로 국내 산업/기업 약 2,000개 이상 정리",
    body: "산업/기업 정보, 이슈, 재무지표 등 데이터베이스 구축 및 지식 관리",
    icon: FileSpreadsheet,
  },
  {
    title: "사업보고서를 꾸준히 읽는 습관",
    body: "주요 기업의 사업보고서 정독 및 비교 분석으로 실적, 전략, 리스크 이해",
    icon: BookOpen,
  },
];

const skillGroups = [
  {
    title: "Frontend",
    items: [
      { name: "React", icon: "/icons/react.svg" },
      { name: "TypeScript", icon: "/icons/typescript.svg" },
      { name: "Next.js", icon: "/icons/nextjs.svg" },
      { name: "Tailwind CSS", icon: "/icons/tailwindcss.svg" },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "Node.js", icon: "/icons/nodejs.svg" },
      { name: "Express", icon: "/icons/express.svg" },
      { name: "Python", icon: "/icons/python.svg" },
      { name: "REST API", icon: "/icons/openapi.svg" },
    ],
  },
  {
    title: "Database & Infra",
    items: [
      { name: "MySQL", icon: "/icons/mysql.svg" },
      { name: "PostgreSQL", icon: "/icons/postgresql.svg" },
      { name: "MongoDB", icon: "/icons/mongodb.svg" },
      { name: "Supabase", icon: "/icons/supabase.svg" },
      { name: "AWS", icon: "/icons/aws.svg" },
      { name: "Google Cloud", icon: "/icons/googlecloud.svg" },
      { name: "Docker", icon: "/icons/docker.svg" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Figma", icon: "/icons/figma.svg" },
      { name: "Notion", icon: "/icons/notion.svg" },
      { name: "Git", icon: "/icons/git.svg" },
      { name: "Jira", icon: "/icons/jira.svg" },
      { name: "Slack", icon: "/icons/slack.svg" },
    ],
  },
];

const projects = [
  {
    title: "산업 동향 분석 플랫폼",
    type: "Full-stack",
    description:
      "산업 데이터를 뉴스 리포트와 인사이트로 제공하는 B2B 플랫폼 구축",
    tags: ["React", "Node.js", "MySQL", "AWS"],
    variant: "analytics",
  },
  {
    title: "경제 뉴스 큐레이션 앱",
    type: "Full-stack / Design",
    description:
      "경제 및 금융 이슈를 선별해 콘텐츠로 제공하는 모바일 웹 서비스",
    tags: ["Next.js", "TypeScript", "MongoDB", "AWS"],
    variant: "mobile",
  },
  {
    title: "정책 정보 포털 UI/UX",
    type: "Design",
    description:
      "정책 정보 접근성과 사용자 명확성을 높이는 UX 리서치 및 프로토타입",
    tags: ["Figma", "Design System", "User Research"],
    variant: "policy",
  },
];

const stats: Array<{
  label: string;
  value: number;
  suffix: string;
  icon: LucideIcon;
}> = [
  { label: "경력", value: 5, suffix: "+", icon: CalendarDays },
  { label: "프로젝트", value: 15, suffix: "+", icon: FileText },
  { label: "협업/이해관계자", value: 20, suffix: "+", icon: UsersRound },
  { label: "책임감과 실행력", value: 100, suffix: "%", icon: Star },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f5f8fc_100%)] text-slate-950 dark:bg-[linear-gradient(180deg,#08101f_0%,#0b1220_52%,#101827_100%)] dark:text-white">
      <Header />
      <HeroSection />
      <ValueSection />
      <InsightSection />
      <GlobalExperienceSection />
      <SkillsSection />
      <ProjectsSection />
      <AboutSection />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/84 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="#home"
          className="text-xl font-extrabold tracking-normal text-slate-950 dark:text-white"
        >
          {contact.name}.
        </a>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex dark:text-slate-300"
        >
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={`relative transition hover:text-blue-600 dark:hover:text-blue-300 ${
                index === 0 ? "text-blue-600 dark:text-blue-300" : ""
              }`}
            >
              {item.label}
              {index === 0 ? (
                <span className="absolute -bottom-3 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-blue-600" />
              ) : null}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden h-10 items-center gap-2 rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-800 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white sm:inline-flex dark:border-white/20 dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-slate-950"
          >
            Resume
            <Download className="h-4 w-4" aria-hidden="true" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      id="home"
      className="relative mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-5 pb-2 pt-12 sm:px-8 lg:min-h-[590px] lg:grid-cols-[1.02fr_0.98fr] lg:items-end lg:pt-8"
    >
      <div className="z-10 flex flex-col items-start pb-8 lg:pb-12">
        <p className="mb-5 text-lg font-bold text-slate-700 dark:text-slate-300">
          안녕하세요,
        </p>
        <h1 className="max-w-3xl text-[38px] font-extrabold leading-[1.18] tracking-normal text-slate-950 sm:text-5xl lg:text-[52px] dark:text-white">
          문제 해결을 설계하고
          <br />
          가치를 만드는
          <span className="mt-3 block text-[30px] leading-tight sm:text-4xl lg:text-[43px]">
            <span className="text-blue-600 dark:text-blue-400">
              Full-stack
            </span>{" "}
            Developer & Designer
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
          사용자 중심의 디자인과 견고한 기술로 서비스를 만들고, 산업/경제
          분야의 경험으로 비즈니스 가치를 연결합니다.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a
            href="#projects"
            className="inline-flex h-14 items-center justify-center gap-3 rounded-lg bg-slate-950 px-7 text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-300"
          >
            프로젝트 보기
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href="#contact"
            className="inline-flex h-14 items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-7 text-sm font-extrabold text-slate-900 transition hover:border-blue-500 hover:text-blue-700 dark:border-white/15 dark:bg-white/8 dark:text-white dark:hover:border-blue-300 dark:hover:text-blue-200"
          >
            연락하기
            <Mail className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {socialLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={
                item.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              aria-label={item.label}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-md dark:border-white/10 dark:bg-white/8 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
            >
              {item.brandIcon ? (
                <BrandIcon
                  icon={item.brandIcon}
                  className="h-5 w-5"
                  color={item.color}
                />
              ) : item.lucideIcon ? (
                <item.lucideIcon className="h-5 w-5" aria-hidden="true" />
              ) : null}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="relative min-h-[460px] lg:min-h-[590px]">
        <div className="absolute inset-x-0 bottom-0 mx-auto h-px max-w-xl bg-slate-200 dark:bg-white/10" />
        <Image
          src="/person.svg"
          alt={`${contact.name} profile portrait`}
          width={620}
          height={827}
          priority
          unoptimized
          className="absolute bottom-0 left-1/2 h-[108%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom drop-shadow-[0_28px_46px_rgba(15,23,42,0.16)] sm:h-[112%] lg:left-[56%] lg:h-[116%]"
        />
      </div>
    </section>
  );
}

function ValueSection() {
  return (
    <section id="experience" className="mx-auto max-w-7xl scroll-mt-24 px-5 sm:px-8">
      <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white/88 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:grid-cols-[0.8fr_1fr_1fr_1fr] dark:border-white/10 dark:bg-white/6">
        <SectionLead
          title="경험으로 증명하는 가치"
          compact
        />
        {valueCards.map((card) => (
          <article
            key={card.title}
            className="border-slate-200 lg:border-l lg:pl-10 dark:border-white/10"
          >
            <IconBadge icon={card.icon} />
            <h3 className="mt-6 text-lg font-extrabold text-slate-950 dark:text-white">
              {card.title}
            </h3>
            <ul className="mt-4 space-y-3 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
              {card.description.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950 dark:bg-blue-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function InsightSection() {
  return (
    <section className="mx-auto mt-6 max-w-7xl px-5 sm:px-8">
      <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white/88 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:grid-cols-[0.82fr_2.7fr] dark:border-white/10 dark:bg-white/6">
        <div>
          <SectionLead title="기자·연구 기반의 산업 인사이트" />
          <p className="mt-7 max-w-xs text-base font-medium leading-8 text-slate-600 dark:text-slate-300">
            경제·산업 취재와 리서치 경험으로 데이터를 맥락 있게 해석하고,
            가치로 연결합니다.
          </p>
        </div>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {insightCards.map((card) => (
            <article
              key={card.title}
              className="border-slate-200 sm:border-l sm:pl-8 dark:border-white/10"
            >
              <card.icon
                className="h-11 w-11 text-blue-600 dark:text-blue-300"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <h3 className="mt-4 text-base font-extrabold leading-6 text-slate-950 dark:text-white">
                {card.title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GlobalExperienceSection() {
  return (
    <section className="relative mt-8 scroll-mt-24 overflow-hidden bg-slate-950">
      <div className="absolute inset-y-0 left-0 z-0 w-full bg-[#050b18] lg:w-[35.4%]" />
      <div className="absolute inset-y-0 left-0 right-0 lg:left-[35.4%]">
        <Image
          src="/world_map.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.42] lg:object-contain lg:object-right lg:opacity-50"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.98)_0%,rgba(7,13,28,0.96)_35%,rgba(15,23,42,0.62)_58%,rgba(15,23,42,0.22)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_45%,rgba(37,99,235,0.18),transparent_42%)]" />

      <div className="relative mx-auto grid min-h-[690px] max-w-[1560px] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.58fr_1.42fr] lg:gap-16 lg:py-18">
        <div className="max-w-2xl lg:max-w-md lg:pl-8 xl:pl-14">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-300">
            World Travel Experience
          </p>
          <span className="mt-7 block h-px w-16 bg-blue-200/70" />
          <h2 className="mt-5 break-keep text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
            세계여행으로 보고서 밖의 산업과 기업을 직접 확인했습니다.
          </h2>
          <p className="mt-6 break-keep text-base font-medium leading-8 text-slate-200 sm:text-lg">
            책과 사업보고서로 공부한 산업 구조를 실제 도시, 상권, 이동 경로,
            기업 현장에서 두 눈으로 확인했습니다. 여행은 단순한 이동이 아니라
            산업과 기업을 현실의 맥락으로 이해하는 훈련이었습니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "세계여행 기반 관찰",
              "산업 구조의 실물감",
              "기업과 도시의 연결",
              "보고서 밖의 현장",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white shadow-sm backdrop-blur"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <TravelImageSlider />
      </div>
    </section>
  );
}

function SkillsSection() {
  return (
    <section
      id="skills"
      className="mx-auto mt-9 max-w-7xl scroll-mt-24 px-5 sm:px-8"
    >
      <SectionHeading title="기술 스택" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/6"
          >
            <h3 className="text-sm font-extrabold text-slate-600 dark:text-slate-300">
              {group.title}
            </h3>
            <div className="mt-5 grid grid-cols-4 gap-3">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="group min-w-0 cursor-default text-center"
                  title={item.name}
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-110 group-hover:border-blue-200 group-hover:shadow-[0_16px_34px_rgba(37,99,235,0.18)] group-hover:ring-4 group-hover:ring-blue-500/10 dark:border-white/10 dark:bg-white dark:group-hover:border-blue-200">
                    <Image
                      src={item.icon}
                      alt={`${item.name} logo`}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-9 w-9 object-contain transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 flex h-8 items-start justify-center text-center text-[10px] font-bold leading-tight text-slate-600 transition group-hover:text-blue-700 dark:text-slate-300 dark:group-hover:text-blue-200">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section
      id="projects"
      className="mx-auto mt-9 max-w-7xl scroll-mt-24 px-5 sm:px-8"
    >
      <div className="flex items-center justify-between gap-4">
        <SectionHeading title="주요 프로젝트" />
        <a
          href={contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-600 transition hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300"
        >
          모든 프로젝트 보기
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.title}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/6"
          >
            <ProjectPreview variant={project.variant} />
            <div className="flex flex-1 flex-col p-5">
              <span className="block h-4 text-xs font-extrabold text-blue-600 dark:text-blue-300">
                {project.type}
              </span>
              <h3 className="mt-2 min-h-[56px] text-xl font-extrabold leading-7 text-slate-950 dark:text-white">
                {project.title}
              </h3>
              <p className="mt-3 min-h-[84px] text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                {project.description}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700 dark:bg-blue-400/10 dark:text-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto grid max-w-7xl scroll-mt-24 gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[0.85fr_2fr]"
    >
      <div>
        <SectionHeading title="About Me" />
        <p className="mt-5 max-w-md text-base font-medium leading-8 text-slate-600 dark:text-slate-300">
          기술과 디자인, 그리고 산업에 대한 이해를 바탕으로 사용자의 비즈니스
          모두에게 가치를 만드는 개발을 합니다.
        </p>
        <a
          href={contact.blog}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-extrabold text-slate-800 transition hover:border-blue-500 hover:text-blue-700 dark:border-white/15 dark:text-white dark:hover:border-blue-300 dark:hover:text-blue-200"
        >
          더 알아보기
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white/90 p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/6"
          >
            <stat.icon
              className="mx-auto h-6 w-6 text-slate-600 dark:text-slate-300"
              aria-hidden="true"
            />
            <p className="mt-5 text-4xl font-black tracking-normal text-slate-950 dark:text-white">
              <CountUpNumber value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-2 text-sm font-extrabold text-slate-600 dark:text-slate-300">
              {stat.label}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-24 bg-slate-950 text-white dark:bg-black"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_1.3fr_auto] lg:items-center">
        <div>
          <h2 className="text-2xl font-extrabold">함께 좋은 제품을 만들어요!</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
            새로운 아이디어나 협업 제안은 언제든 환영합니다.
          </p>
        </div>
        <div className="grid gap-3 text-sm font-semibold text-slate-300 sm:grid-cols-2">
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-3 transition hover:text-white"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {contact.email}
          </a>
          <a
            href={`tel:${contact.phone.replaceAll("-", "")}`}
            className="inline-flex items-center gap-3 transition hover:text-white"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {contact.phone}
          </a>
          <span className="inline-flex items-center gap-3">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {contact.location}
          </span>
          <a
            href={contact.blog}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 transition hover:text-white"
          >
            <BookMarked className="h-4 w-4" aria-hidden="true" />
            Naver Blog
          </a>
        </div>
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex h-14 items-center justify-center gap-3 rounded-lg border border-white/25 px-6 text-sm font-extrabold transition hover:bg-white hover:text-slate-950"
        >
          연락하기
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

function SectionLead({
  title,
  compact = false,
}: {
  title: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "pt-1" : ""}>
      <h2 className="max-w-sm text-2xl font-extrabold leading-snug text-slate-950 sm:text-3xl dark:text-white">
        {title}
      </h2>
      <span className="mt-4 block h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-300" />
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
        {title}
      </h2>
      <span className="mt-3 block h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-300" />
    </div>
  );
}

function BrandIcon({
  icon,
  className,
  color = "currentColor",
}: {
  icon: SimpleIcon;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={color}
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.path} />
    </svg>
  );
}

function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-14 w-14 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
      <Icon className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

function ProjectPreview({ variant }: { variant: string }) {
  if (variant === "mobile") {
    return (
      <div className="relative h-52 overflow-hidden bg-[#06275c]">
        <div className="absolute inset-x-8 bottom-0 flex items-end justify-center gap-4">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className={`h-44 w-24 rounded-t-[28px] border-4 border-white/90 bg-white p-2 shadow-2xl ${
                item === 1 ? "h-52" : "opacity-90"
              }`}
            >
              <div className="h-4 rounded-full bg-blue-100" />
              <div className="mt-3 h-16 rounded-xl bg-blue-600" />
              <div className="mt-3 space-y-2">
                <div className="h-2 rounded bg-slate-200" />
                <div className="h-2 w-3/4 rounded bg-slate-200" />
                <div className="h-7 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "policy") {
    return (
      <div className="h-52 bg-slate-50 p-7 dark:bg-slate-900">
        <div className="mx-auto max-w-sm rounded-xl border border-blue-100 bg-white p-5 shadow-lg dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-blue-100" />
            <div className="h-7 w-16 rounded bg-blue-600" />
          </div>
          <div className="mt-6 grid grid-cols-[1fr_0.85fr] gap-4">
            <div>
              <div className="h-4 w-36 rounded bg-slate-900 dark:bg-white" />
              <div className="mt-3 h-3 w-28 rounded bg-slate-200" />
              <div className="mt-6 h-8 w-24 rounded bg-blue-600" />
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <div className="h-16 rounded-lg bg-blue-200" />
              <div className="mt-3 h-3 rounded bg-white" />
              <div className="mt-2 h-3 w-2/3 rounded bg-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-52 bg-slate-50 p-6 dark:bg-slate-900">
      <div className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-slate-950">
        <div className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-red-300" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
        </div>
        <div className="mt-5 grid h-[130px] grid-cols-[0.36fr_1fr] gap-4">
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-5 rounded bg-slate-100 dark:bg-white/10" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-400/10">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="mt-5 h-3 w-20 rounded bg-blue-200" />
              <div className="mt-2 h-2 w-16 rounded bg-blue-100" />
            </div>
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-white/10">
              <div className="h-16 rounded bg-white dark:bg-slate-800" />
              <div className="mt-3 h-2 rounded bg-slate-200 dark:bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
