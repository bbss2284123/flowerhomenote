/**
 * 꽃과살림노트 공통 설정. 이름, 도메인, 분류, 색, 글쓴이, 광고, 분석, 인증은 여기만 바꿉니다.
 * 광고·분석·인증 값은 비어 있습니다. 채우기 전에는 스크립트와 ads.txt 게시자 줄을 넣지 않습니다.
 *
 * 색은 홈 시안과 브랜드 키트에 맞춥니다.
 * 설계서 초안의 #FCFAF7 / #26352C / #355C45 / #A76E64 와
 * 키트의 #FCFBF8 / #273322 / #416743 / #D78981 이 조금 달랐고, 붙은 홈 시안은 키트 쪽에 가깝습니다.
 * --brand-hover 만 설계서의 딥 세이지 #355C45 를 씁니다.
 */
export interface CategoryTopic {
  label: string;
  q: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  /** 홈 타일·카드 배경 */
  tile: string;
  /** 글·캡션에 쓰는 분류 글자색. 작은 글자에도 대비가 되게 진하게 둡니다. */
  accent: string;
  /** 옅은 배경 */
  soft: string;
  /** 장식용. 작은 본문 글자에는 쓰지 않습니다. */
  pill: string;
  topics: CategoryTopic[];
}

export interface Hub {
  id: string;
  name: string;
  description: string;
  /** 상위 분류가 아닌 필터이면 true */
  filter: boolean;
  icon: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  match: string[];
}

export interface TopicLink {
  label: string;
  q: string;
  icon: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
}

export const siteConfig = {
  name: "꽃과살림노트",
  nameEn: "flowerhomenote",
  logoText: "꽃과살림노트",
  /** 설계서의 한 줄 소개 */
  tagline: "꽃이 있는 집, 식물이 자라는 일상, 반려동물과 안전한 살림을 위한 실용 생활 노트.",
  /** 홈 시안 배너. 본문 글꼴이 아니라 이 문장만 배너에 씁니다. */
  banner: {
    kicker: "일상을 가꾸는 작은 기록",
    title: "꽃과 살림에 필요한 정보를 모았어요",
    sub: "키우기 · 관리법 · 문제 해결 · 계절별 생활 팁",
  },
  url: "https://flowerhomenote.com",
  description:
    "꽃·꽃말, 식물 키우기, 가드닝·텃밭, 반려동물, 살림·청소를 검색한 문제부터 해결 순서까지 적는 생활 노트입니다.",
  lang: "ko",
  locale: "ko_KR",
  /** TODO: 받는 메일함으로 바꾸세요. */
  contactEmail: "contact@flowerhomenote.com",
  legalUpdated: "2026-11-03",
  postsPerPage: 6,
  /** 한국 시간 기준 하루 발행 상한. 같은 날 이 편수를 넘기면 검수가 실패하고, 예약 공개도 넘긴 글을 올리지 않습니다. */
  maxPostsPerDay: 2,
  /** TODO: IndexNow 키. 비우면 키 파일을 만들지 않고 핑도 보내지 않습니다. */
  indexNowKey: "",
  author: {
    /** TODO: 실제 필명으로 바꾸세요. 비어 있는 동안은 사이트 이름을 발행자로 둡니다. */
    name: "꽃과살림노트",
    slug: "editor",
    role: "편집",
    bio: "운영자 필명은 아직 정해지지 않았습니다. 글은 출처와 확인일을 남긴 뒤에만 발행합니다.",
  },
  design: {
    fontFamily: '"Pretendard Variable", Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
    bg: "#FCFBF8",
    surface: "#FFFFFF",
    text: "#273322",
    muted: "#5C6A60",
    brand: "#416743",
    brandHover: "#355C45",
    border: "#E6E4DC",
    rose: "#F8E8E4",
    sage: "#EAF1E7",
    sand: "#F4EBDC",
    accent: "#D78981",
    radius: "16px",
    shadow: "0 4px 18px rgba(31, 50, 34, 0.06)",
    max: "1240px",
  },
  categories: [
    {
      id: "flowers",
      name: "꽃·꽃말",
      description: "꽃 종류, 계절 꽃, 절화와 꽃다발, 화병 관리, 꽃말의 출처를 다룹니다.",
      tile: "#F8E8E4",
      accent: "#8C4E4A",
      soft: "#F8E8E4",
      pill: "#D78981",
      topics: [
        { label: "절화 관리", q: "절화 물갈이" },
        { label: "꽃다발", q: "꽃다발 관리" },
        { label: "꽃말", q: "꽃말 출처" },
        { label: "화병", q: "화병 관리" },
      ],
    },
    {
      id: "plants",
      name: "식물 키우기",
      description: "식물별 햇빛·물·온도, 잎 변색, 병충해, 분갈이를 증상부터 점검 순서로 정리합니다.",
      tile: "#EAF1E7",
      accent: "#416743",
      soft: "#EAF1E7",
      pill: "#7FA184",
      topics: [
        { label: "물주기", q: "식물 물주기" },
        { label: "잎 변색", q: "잎이 노랗게" },
        { label: "햇빛", q: "햇빛 부족 식물" },
        { label: "분갈이", q: "분갈이 시기" },
      ],
    },
    {
      id: "gardening",
      name: "가드닝·텃밭",
      description: "베란다 화분, 허브와 채소, 계절 작업, 초보 도구를 다룹니다.",
      tile: "#E7F0E2",
      accent: "#3E6A45",
      soft: "#E7F0E2",
      pill: "#86A778",
      topics: [
        { label: "베란다", q: "베란다 텃밭" },
        { label: "허브", q: "허브 키우기" },
        { label: "가지치기", q: "허브 가지치기" },
        { label: "배수", q: "화분 배수" },
      ],
    },
    {
      id: "pets",
      name: "반려동물",
      description: "강아지·고양이 생활 관리, 털과 발, 식물과 함께 사는 집을 다룹니다. 질병 치료는 검증과 동물병원 상담이 먼저입니다.",
      tile: "#F8F1E6",
      accent: "#8A6232",
      soft: "#F8F1E6",
      pill: "#CA965B",
      topics: [
        { label: "털", q: "고양이 털" },
        { label: "발 닦기", q: "강아지 발 닦기" },
        { label: "식물과 안전", q: "반려동물 식물" },
        { label: "세탁", q: "반려동물 침구 세탁" },
      ],
    },
    {
      id: "home",
      name: "살림·청소",
      description: "주방, 욕실, 세탁, 냄새, 곰팡이, 정리·수납, 계절별 집 관리를 다룹니다.",
      tile: "#E7F2EA",
      accent: "#2F6A4A",
      soft: "#E7F2EA",
      pill: "#5D8B6B",
      topics: [
        { label: "곰팡이", q: "욕실 곰팡이" },
        { label: "냄새", q: "냉장고 냄새" },
        { label: "기름때", q: "가스레인지 기름때" },
        { label: "결로", q: "베란다 결로" },
      ],
    },
  ] as Category[],
  hubs: [
    {
      id: "month",
      name: "이번 달 필요한 관리",
      description: "이번 달에 실내 식물과 집에서 먼저 볼 일을 모읍니다.",
      filter: false,
      icon: "gardening",
    },
    {
      id: "beginner",
      name: "초보자 가이드",
      description: "화분, 꽃, 청소, 반려동물을 처음 시작할 때 여는 글입니다.",
      filter: false,
      icon: "flowers",
    },
    {
      id: "problems",
      name: "자주 겪는 문제",
      description: "잎 변색, 곰팡이, 냄새, 털처럼 반복되는 문제를 모읍니다.",
      filter: false,
      icon: "home",
    },
    {
      id: "with-pets",
      name: "반려동물과 함께하는 집",
      description: "반려동물이 있는 집에서 식물과 살림을 함께 볼 때 여는 글입니다.",
      filter: false,
      icon: "pets",
    },
    {
      id: "season",
      name: "계절별 추천",
      description: "계절이 바뀔 때 실내와 베란다에서 볼 관리를 모읍니다.",
      filter: false,
      icon: "gardening",
    },
    {
      id: "storage",
      name: "정리·수납",
      description: "살림·청소 안의 정리와 수납입니다. 여섯 번째 상위 분류가 아닙니다.",
      filter: true,
      icon: "storage",
    },
  ] as Hub[],
  nav: [
    { id: "index", label: "홈", href: "/", match: ["index"] },
    { id: "flowers-plants", label: "꽃·식물", href: "/flowers-plants/", match: ["flowers-plants", "flowers", "plants"] },
    { id: "gardening", label: "가드닝", href: "/category/gardening/", match: ["gardening"] },
    { id: "pets", label: "반려동물", href: "/category/pets/", match: ["pets"] },
    { id: "living", label: "살림·청소", href: "/category/home/", match: ["home", "storage"] },
  ] as NavItem[],
  /** 조회수가 아닙니다. 편집자가 골라 둔 검색 주제입니다. */
  editorTopics: [
    { label: "수국 물주기와 햇빛 관리", q: "수국 물주기", icon: "flowers", excerpt: "물주기부터 가지치기까지", category: "flowers", categoryLabel: "꽃·식물" },
    { label: "노랗게 변하는 식물 잎", q: "잎이 노랗게", icon: "plants", excerpt: "잎이 누렇게 변하는 이유", category: "plants", categoryLabel: "꽃·식물" },
    { label: "고양이 털 관리", q: "고양이 털", icon: "pets", excerpt: "빗질부터 청소까지", category: "pets", categoryLabel: "반려동물" },
    { label: "베란다 허브 기르기", q: "베란다 허브", icon: "gardening", excerpt: "바질·로즈마리 시작하기", category: "gardening", categoryLabel: "가드닝" },
    { label: "욕실 곰팡이 예방", q: "욕실 곰팡이", icon: "home", excerpt: "예방과 관리 방법", category: "home", categoryLabel: "살림·청소" },
  ] as TopicLink[],
  /**
   * 발행 글이 없을 때만 홈 카드 칸에 보여 주는 편집자 추천 주제.
   * 브랜드 키트의 예시 제목이며 글, 날짜, 조회수가 아닙니다.
   */
  homeTopics: [
    { label: "수국 예쁘게 키우는 법", q: "수국 키우기", icon: "flowers", excerpt: "물주기부터 가지치기까지", category: "flowers", categoryLabel: "꽃·식물" },
    { label: "몬스테라 잎이 노랗게 될 때", q: "몬스테라 잎", icon: "plants", excerpt: "잎이 누렇게 변하는 이유", category: "plants", categoryLabel: "꽃·식물" },
    { label: "고양이 털 관리 쉽게 하는 법", q: "고양이 털", icon: "pets", excerpt: "빗질부터 청소까지", category: "pets", categoryLabel: "반려동물" },
    { label: "베란다 허브 키우기 입문", q: "베란다 허브", icon: "gardening", excerpt: "바질·로즈마리 시작하기", category: "gardening", categoryLabel: "가드닝" },
    { label: "욕실 곰팡이 깔끔하게 없애는 법", q: "욕실 곰팡이", icon: "home", excerpt: "예방과 관리 방법", category: "home", categoryLabel: "살림·청소" },
    { label: "집 청소 루틴 쉽게 시작하기", q: "집 청소", icon: "home", excerpt: "주방과 거실을 차근차근", category: "home", categoryLabel: "살림·청소" },
  ] as TopicLink[],
  problemLinks: [
    { label: "식물 잎", q: "잎이 노랗게" },
    { label: "냄새", q: "집 냄새" },
    { label: "얼룩", q: "얼룩 청소" },
    { label: "털", q: "반려동물 털" },
    { label: "화분", q: "화분 배수" },
  ],
  adsense: {
    /** TODO: AdSense 게시자 ID (pub- 로 시작). 비우면 ads.txt 에 게시자 줄을 넣지 않습니다. */
    publisherId: "",
    slots: {
      /** TODO: 광고 슬롯 ID */
      afterIntro: "",
      midArticle: "",
      endArticle: "",
      sidebar: "",
    },
  },
  /** TODO: GA4 측정 ID (G- 로 시작). 비우면 분석 스크립트를 넣지 않습니다. */
  ga4Id: "",
  /** TODO: Cloudflare Web Analytics 토큰. 비우면 비콘을 넣지 않습니다. */
  cloudflareWebAnalyticsToken: "",
  verification: {
    /** TODO: Google Search Console 인증 코드 */
    google: "",
    /** TODO: 네이버 서치어드바이저 인증 코드 */
    naver: "",
    /** TODO: Bing 웹마스터 인증 코드 */
    bing: "",
  },
} as const;

export type CategoryId = (typeof siteConfig.categories)[number]["id"];
export type HubId = (typeof siteConfig.hubs)[number]["id"];

export function categoryById(id: string): Category | undefined {
  return siteConfig.categories.find((category) => category.id === id);
}

export function hubById(id: string): Hub | undefined {
  return siteConfig.hubs.find((hub) => hub.id === id);
}

export function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
