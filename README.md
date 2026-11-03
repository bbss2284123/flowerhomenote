# 꽃과살림노트

꽃이 있는 집, 식물이 자라는 일상, 반려동물과 안전한 살림을 위한 실용 생활 노트입니다.  
프로덕션 주소는 [https://flowerhomenote.com](https://flowerhomenote.com) 입니다.

Astro 정적 사이트입니다. 빌드 결과는 `dist` 이고, 검색은 Pagefind, 글은 `src/content/posts` 입니다.

## 로컬에서 보기

Node.js 22가 필요합니다.

```bash
npm install
npm run dev
```

- 발행된 글만 홈의 글 목록에 나옵니다. 지금은 검수를 통과한 발행 글이 없습니다.
- 발행 글이 없으면 홈 카드는 **편집자 추천 주제**입니다. 글, 날짜, 조회수가 아닙니다.
- 개발 서버에서 초안 글: `/draft/draft-plant-care/`, `/draft/draft-cleaning/`, `/draft/draft-pets/`, `/draft/draft-season/`
- `npm run build` 결과에는 초안 주소가 들어가지 않습니다.

```bash
npm run check
npm run build
npm run preview
```

## Cloudflare Pages

| 항목 | 값 |
| --- | --- |
| 빌드 명령 | `npm run build` |
| 출력 디렉터리 | `dist` |
| 환경 변수 | `NODE_VERSION=22` |
| 프로덕션 도메인 | `flowerhomenote.com` |

GitHub Actions `Scheduled publish` 가 30분마다 07:00–22:30 KST 에 돌아갑니다. 저장소 비밀 `CF_PAGES_DEPLOY_HOOK` 에 Cloudflare Pages 배포 훅 URL을 넣습니다. 비밀이 없으면 배포를 건너뛰고 성공으로 끝납니다.

초안(`draft: true`)은 배포 대상이 아닙니다. `publishAt`(없으면 `date`)이 아직 오지 않은 글은 빌드에 나오지 않고, 그 시각이 지난 뒤의 예약 실행이 배포 훅을 호출합니다. 같은 한국 날짜에 공개되는 글은 `site.config.ts` 의 `maxPostsPerDay`(1)까지입니다.

## 주인님이 채울 값

`site.config.ts` 에 `TODO` 로 비워 둔 칸입니다. 비어 있으면 스크립트와 ads.txt 게시자 줄을 넣지 않습니다.

| 칸 | 넣는 값 |
| --- | --- |
| `author.name` | 필명. 비어 있는 동안은 사이트 이름을 발행자로 둡니다. |
| `contactEmail` | 문의 메일 |
| `adsense.publisherId` | AdSense 게시자 ID (`pub-` 로 시작) |
| `adsense.slots.*` | 본문·사이드 슬롯 ID |
| `ga4Id` | GA4 측정 ID (`G-`) |
| `cloudflareWebAnalyticsToken` | Cloudflare Web Analytics 토큰 |
| `verification.google` | Google Search Console 메타 코드. 지금은 DNS로 인증하므로 비워 둡니다. |
| `verification.naver` | 네이버 서치어드바이저 인증 코드. 들어가 있으면 `naver-site-verification` 메타를 넣습니다. |
| `verification.bing` | Bing 웹마스터 인증 코드. 들어가 있으면 `msvalidate.01` 메타를 넣습니다. |
| `indexNowKey` | IndexNow 키. 비우면 핑하지 않습니다. |

로컬에서만 GA를 덮어쓰려면 `.env` 에 `PUBLIC_GA_ID` 를 넣습니다. 예시는 `.env.example` 입니다.

본문에 광고가 필요하면 `<AdSlot position="after-intro" />`, `mid`, `end`, `sidebar` 를 넣습니다. ID가 비어 있으면 배너를 그리지 않습니다.

## 디렉터리

| 경로 | 역할 |
| --- | --- |
| `site.config.ts` | 이름, 도메인, 분류, 색, 글쓴이, 광고, 분석, 인증 |
| `src/content/posts` | 글. 초안도 여기 두되 `draft: true` |
| `work/<slug>/facts.yaml` | 글에 적는 숫자의 출처 원장 |
| `docs/templates` | 템플릿 A 식물, B 청소, C 반려동물, D 계절 |
| `public/brand` | 로고, OG, 편집 배경. `samples/` 는 AI 샘플이며 글 사진으로 쓰지 않습니다 |
| `public/icons` | 분류 아이콘 |
| `public/thumb/backgrounds` | 빌드가 만드는 글자 없는 분류 배경 |
| `public/thumb/posts/<slug>` | 빌드가 만드는 카드·OG. 제목은 이미지 안이 아니라 HTML입니다 |
| `rules/banned.yaml` | 발행을 막는 상투 표현 |

## 색

홈 시안과 브랜드 키트에 맞춘 값입니다. 설계서 초안과 소수 자리에서 달랐습니다.

| 토큰 | 값 | 쓰는 곳 |
| --- | --- | --- |
| `--bg` | `#FCFBF8` | 페이지 배경. 설계서 초안은 `#FCFAF7` |
| `--text` | `#273322` | 본문. 설계서 초안은 `#26352C` |
| `--brand` | `#416743` | 로고·링크·버튼. 설계서 초안은 `#355C45` |
| `--brand-hover` | `#355C45` | 진한 세이지. 설계서의 브랜드 색 |
| `--sage` | `#EAF1E7` | 소개 배너, 빠른 답 |
| `--accent` | `#D78981` | 장식. 설계서 초안은 `#A76E64`. 작은 본문에는 쓰지 않습니다 |
| `--muted` | `#5C6A60` | 보조 글자 |
| `--sand` | `#F4EBDC` | 팁 상자 |
| `--rose` | `#F8E8E4` | 경고 상자 |

본문은 Pretendard Variable 이고, 없으면 Noto Sans KR, Apple SD Gothic Neo 순입니다. 본문 17.5px, 글 안은 18px, 줄 높이 1.75입니다. 폭은 1240px입니다.

## 분류와 허브

상위 분류는 다섯 개입니다. `flowers` 꽃·꽃말, `plants` 식물 키우기, `gardening` 가드닝·텃밭, `pets` 반려동물, `home` 살림·청소.

상단 메뉴의 꽃·식물은 `/flowers-plants/` 에서 꽃·꽃말과 식물 키우기를 같이 보여 줍니다. 정리·수납은 여섯 번째 분류가 아니라 `/hub/storage/` 필터입니다.

허브는 이번 달 필요한 관리, 초보자 가이드, 자주 겪는 문제, 반려동물과 함께하는 집, 계절별 추천입니다. 글의 `hubs` 에 해당 id를 넣으면 허브에 모입니다.

## 글을 추가하는 방법

1. `docs/templates/` 의 A–D 중 하나를 `src/content/posts/<slug>.mdx` 로 복사합니다.
2. `work/<slug>/facts.yaml` 을 만듭니다. 숫자가 없으면 `facts: []` 입니다.
3. `[작성]` 을 모두 바꿉니다. 남으면 `npm run check` 가 멈춥니다.
4. 대표 검색어 `main_query` 를 제목, 설명, 첫 문단에 넣습니다. 설명은 80–120자입니다.
5. 출처마다 `checked_at` 을 적습니다. 이미지는 `alt`, `source_type` 이 필요하고, 직접 촬영이 아니면 `license_proof` 가 필요합니다.
6. 위험도가 `high` 이면 `verified_by` 가 필요합니다. `review_status` 가 `approved` 또는 `published` 이고 `draft: false` 일 때만 발행됩니다.
7. 같은 한국 날짜의 발행 글은 1편까지입니다. 그 전이면 `publishAt` 을 미래로 둡니다.

레이아웃만 보려면 초안 네 편을 개발 서버에서 엽니다. 그 문장은 관리법이 아닙니다.

## 글 쓰는 규칙

답부터 씁니다. 인사, 예고, 맺음 에세이는 넣지 않습니다.

- 첫 화면의 빠른 답은 `quickAnswer` 이고, 본문에도 `한눈에`, `핵심`, `요약`, `체크` 중 하나가 들어간 제목이 있어야 합니다.
- 첫 제목 앞은 3문장, 300자 이하입니다.
- `rules/banned.yaml` 의 표현은 막습니다. `안녕하세요`, `오늘은 ~에 대해 알아보겠습니다`, `많은 분들이 궁금해하시는`, `도움이 되셨길 바랍니다`, `이상으로` 가 여기 있습니다.
- 독성, 유독, 중독이라고 쓰면 학명과 출처가 있어야 합니다.
- 표백제를 다른 세정제와 섞으라고 적으면 멈춥니다. 섞지 말라는 문장은 통과합니다.
- 농사로 이미지와 공공누리 제4유형 이미지는 올리지 않습니다.
- 장식 이미지나 AI 이미지로 전후 비교를 말하지 않습니다.
- `public/brand/samples/` 의 여섯 장은 AI 샘플입니다. 글 사진으로 쓰면 검수가 멈춥니다.
- 이모지, 가짜 조회수, 뉴스레터, 로그인은 넣지 않습니다.

대표 이미지는 글자 없는 16:9 배경입니다. 키트에서 제목을 잘라 낸 장면과, `public/brand/backgrounds` 의 AI 장식(`source_type: ai_generated`)을 함께 씁니다. AI 배경은 현장 사진이나 관리 결과가 아닙니다. 카드에서는 제목을 사진 위 HTML로 한 번만 보여주고, 아래에는 분류와 한 줄 요약만 둡니다. 다른 그림이 필요하면 `thumbBackground` 와 `images` 에 그 파일 경로를 적습니다.

## 페이지

홈, 분류, 허브, 글, 검색, 전체 글, 소개, 출처 기준, 문의, 개인정보처리방침, 404.
