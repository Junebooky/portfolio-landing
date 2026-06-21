# portfolio-landing

Next.js App Router 기반 포트폴리오 랜딩페이지입니다.

## Local

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Docker

```bash
npm run docker:build
npm run docker:run
```

또는:

```bash
docker compose up --build
```

## Vercel

```bash
vercel link --yes --project portfolio-landing --team junebooky
vercel deploy --prod
```

Vercel 표준 Next.js 배포와 Docker standalone 배포를 모두 고려해 `next.config.ts`에 `output: "standalone"`을 설정했습니다.
