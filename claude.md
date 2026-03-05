# 개인 가계부 (Private Household Account Book)

## 프로젝트 개요

개인용 가계부 웹 애플리케이션. 인증 없이 해시 URL(`/{SECRET_HASH}/`)로 접근 제한.

## 기술 스택

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix 기반 UI 컴포넌트)
- **Prisma ORM** + **SQLite** (개발) / PostgreSQL (프로덕션)
- **Recharts** (차트), **Zod** (유효성 검사), **Lucide React** (아이콘)
- **pnpm** 패키지 매니저

## 실행 명령어

```bash
pnpm install            # 의존성 설치
pnpm prisma migrate dev # DB 마이그레이션
pnpm prisma db seed     # 시드 데이터 (기본 카테고리)
pnpm dev                # 개발 서버 (localhost:3000)
pnpm build              # 프로덕션 빌드
pnpm start              # 프로덕션 서버
```

## 환경 변수 (.env)

```env
DATABASE_URL="file:./dev.db"
SECRET_HASH="자동생성됨"   # 미설정 시 첫 실행 때 자동 생성 (src/instrumentation.ts)
```

## 보안: 해시 URL

- `src/middleware.ts`에서 URL path의 첫 segment를 `SECRET_HASH` 환경변수와 비교
- 일치하지 않으면 404 반환. `/api/*` 경로는 검증 없이 통과
- `src/instrumentation.ts`에서 서버 시작 시 해시가 없으면 자동 생성 후 콘솔에 접속 URL 출력

## 프로젝트 구조

```
src/
├── app/
│   ├── [hash]/                  # 해시 URL 기반 페이지
│   │   ├── page.tsx             # 대시보드
│   │   ├── transactions/        # 거래 관리
│   │   ├── categories/          # 카테고리 관리
│   │   ├── payment-methods/     # 결제수단 관리
│   │   ├── budget/              # 예산 관리
│   │   ├── recurring/           # 정기 거래
│   │   ├── fixed-costs/         # 고정비용 관리
│   │   ├── assets/              # 자산 관리 (월별 투입 추적)
│   │   ├── statistics/          # 통계/차트
│   │   ├── settings/            # 설정
│   │   └── layout.tsx           # 사이드바+헤더 레이아웃
│   ├── api/                     # API Routes
│   │   ├── transactions/        # CRUD
│   │   ├── categories/          # CRUD
│   │   ├── payment-methods/     # CRUD
│   │   ├── budgets/             # CRUD
│   │   ├── recurring/           # CRUD
│   │   ├── fixed-costs/         # CRUD + [id]/pay (납부처리)
│   │   ├── assets/              # CRUD + summary, monthly-trend, snapshots
│   │   ├── statistics/          # summary, category, monthly-trend, payment-method
│   │   └── data/reset/          # 전체 데이터 초기화
│   └── middleware.ts            # 해시 검증
├── components/
│   ├── ui/                      # shadcn/ui 컴포넌트
│   ├── charts/                  # DonutChart, MonthlyLineChart, MonthlyBarChart
│   ├── forms/                   # 각종 폼 컴포넌트
│   ├── layout/                  # sidebar, header, mobile-nav
│   └── shared/                  # theme-provider, floating-action-button
├── lib/
│   ├── prisma.ts                # Prisma 싱글턴 클라이언트
│   ├── hash.ts                  # 해시 검증 유틸
│   ├── utils.ts                 # formatCurrency, formatDate, cn()
│   └── validations/             # Zod 스키마 (transaction, category, budget 등)
├── types/index.ts               # 타입 정의 + 라벨 상수
├── constants/index.ts           # NAV_ITEMS 등
└── instrumentation.ts           # 서버 시작 시 SECRET_HASH 자동 생성
```

## DB 스키마 핵심 모델

| 모델 | 설명 |
|------|------|
| Category | 수입/지출 카테고리 (트리 구조) |
| PaymentMethod | 결제수단 (신용카드, 체크카드, 현금 등) |
| Transaction | 수입/지출 거래 |
| Budget | 월별/카테고리별 예산 |
| RecurringTransaction | 정기 거래 |
| Tag | 거래 태그 |
| Asset | 자산 (예금, 적금, 투자, 가상화폐, 연금/보험) |
| AssetTransaction | 자산 거래 (매수, 매도, 입금, 출금, 이자, 배당) |
| AssetSnapshot | 자산 스냅샷 (시점별 가치) |
| FixedCost | 고정비용 항목 (category 분류 + costType 구분) |
| FixedCostPayment | 월별 고정비용 납부 기록 |

## 고정비용 시스템

- **category**: HOUSING, UTILITY, TELECOM, SUBSCRIPTION, INSURANCE, TRANSPORT, FINANCE, ETC
- **costType**: `EXPENSE`(지출) vs `SAVING`(저축/투자)
  - EXPENSE → 대시보드 지출 합계에 포함
  - SAVING → 자산 투입(allocation)에 포함, 지출에 미포함
- 납부 처리: `POST /api/fixed-costs/[id]/pay?month=&year=` (upsert)
- 납부 취소: `DELETE /api/fixed-costs/[id]/pay?month=&year=`

## API 응답 패턴

- 리스트: `{ data: [...] }` 래퍼 사용
- 단건: 객체 직접 반환
- 에러: `{ error: "메시지" }` + 적절한 HTTP status
- 클라이언트에서 unwrap: `const list = Array.isArray(json) ? json : json.data || []`

## 코딩 컨벤션

- 모든 페이지는 `"use client"` (클라이언트 컴포넌트)
- API Route에서 Zod validation 후 `result.data`를 Prisma에 전달
- shadcn/ui 컴포넌트는 `@/components/ui/`에서 import
- 금액은 `Int` (원 단위 정수), 표시 시 `formatCurrency()` 사용
- 날짜는 `date-fns` 활용, DB에는 `DateTime` 저장

## 디자인 가이드

- Primary: Blue (#3B82F6), 수입: Green (#22C55E), 지출: Red (#EF4444)
- 반응형: 모바일 우선, 사이드바는 lg 이상에서 표시
- 다크 모드: next-themes로 지원
- 토스트: sonner 사용 (`toast.success()`, `toast.error()`)
