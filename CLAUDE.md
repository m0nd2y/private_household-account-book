# 개인 가계부 (Private Household Account Book)

## 프로젝트 개요

개인용 가계부 웹 애플리케이션. 인증 없이 해시 URL(`/{SECRET_HASH}/`)로 접근 제한.

## 기술 스택

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix 기반 UI 컴포넌트)
- **Prisma ORM** + **SQLite**
- **Recharts** (차트), **Zod** (유효성 검사), **Lucide React** (아이콘)
- **pnpm** 패키지 매니저

## 서버 초기 설정 (최초 1회)

```bash
# 1. Node.js 18+ 및 pnpm 설치
npm install -g pnpm

# 2. 저장소 클론
git clone git@github.com:m0nd2y/private_household-account-book.git
cd private_household-account-book

# 3. 의존성 설치
pnpm install

# 4. 환경 변수 생성
echo 'DATABASE_URL="file:./dev.db"' > .env
# SECRET_HASH는 첫 실행 시 자동 생성됨

# 5. DB 마이그레이션 (이미 dev.db가 포함되어 있으므로 deploy 사용)
pnpm prisma migrate deploy

# 6. 빌드 및 실행
pnpm build
pnpm start
# 또는 PM2: pm2 start pnpm --name "household" -- start
```

## 코드 수정 후 반영 절차

```bash
# 1. 코드 수정 후 빌드 확인
pnpm build

# 2. DB 스키마 변경이 있었다면 마이그레이션
pnpm prisma migrate dev --name 변경내용설명

# 3. 서버 재시작
pm2 restart household
# 또는 pnpm start
```

## 코드 업데이트 (git pull 후)

```bash
git pull origin main
pnpm install
pnpm prisma migrate deploy
pnpm build
pm2 restart household
```

## 커밋 & 푸시

```bash
git add 변경파일들
git commit -m "설명"
git push origin main
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 (HMR, localhost:3000) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 |
| `pnpm lint` | ESLint 검사 |
| `pnpm prisma migrate dev --name 이름` | 개발용 마이그레이션 생성+적용 |
| `pnpm prisma migrate deploy` | 프로덕션 마이그레이션 적용 |
| `pnpm prisma db seed` | 시드 데이터 (기본 카테고리) |
| `pnpm prisma studio` | DB GUI (localhost:5555) |

## 환경 변수 (.env)

```env
DATABASE_URL="file:./dev.db"    # SQLite DB 경로 (prisma/ 기준 상대경로)
SECRET_HASH="자동생성됨"          # 미설정 시 첫 실행 때 자동 생성
```

## 보안: 해시 URL

- `src/middleware.ts` — URL path 첫 segment를 `SECRET_HASH`와 비교, 불일치 시 404
- `/api/*` 경로는 검증 없이 통과
- `src/instrumentation.ts` — 서버 시작 시 해시 없으면 자동 생성, 콘솔에 접속 URL 출력

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
│   ├── api/                     # API Routes (모든 CRUD)
│   │   ├── transactions/        # 거래 CRUD
│   │   ├── categories/          # 카테고리 CRUD
│   │   ├── payment-methods/     # 결제수단 CRUD
│   │   ├── budgets/             # 예산 CRUD
│   │   ├── recurring/           # 정기거래 CRUD
│   │   ├── fixed-costs/         # 고정비용 CRUD + [id]/pay (납부)
│   │   ├── assets/              # 자산 CRUD + summary, monthly-trend
│   │   ├── statistics/          # summary, category, monthly-trend, payment-method
│   │   └── data/reset/          # 전체 데이터 초기화
│   └── middleware.ts
├── components/
│   ├── ui/                      # shadcn/ui 컴포넌트 (수정 지양)
│   ├── charts/                  # DonutChart, MonthlyLineChart, MonthlyBarChart
│   ├── forms/                   # transaction-form, category-form 등
│   ├── layout/                  # sidebar, header, mobile-nav
│   └── shared/                  # theme-provider, floating-action-button
├── lib/
│   ├── prisma.ts                # Prisma 싱글턴 클라이언트
│   ├── hash.ts                  # 해시 검증 유틸
│   ├── utils.ts                 # formatCurrency, formatDate, cn()
│   └── validations/             # Zod 스키마
├── types/index.ts               # 타입 정의 + 한글 라벨 상수
├── constants/index.ts           # NAV_ITEMS
└── instrumentation.ts           # SECRET_HASH 자동 생성
```

## DB 스키마 (prisma/schema.prisma)

| 모델 | 설명 |
|------|------|
| Category | 수입/지출 카테고리 (트리 구조, parentId) |
| PaymentMethod | 결제수단 (신용카드, 체크카드, 현금, 계좌이체, 간편결제) |
| Transaction | 수입/지출 거래 (amount, type, date, categoryId, paymentMethodId) |
| Budget | 월별/카테고리별 예산 (@@unique month+year+categoryId) |
| RecurringTransaction | 정기 거래 (frequency: DAILY/WEEKLY/MONTHLY/YEARLY) |
| Tag | 거래 태그 (M:N with Transaction) |
| Asset | 자산 (DEPOSIT/SAVINGS/INVESTMENT/CRYPTO/PENSION_INSURANCE) |
| AssetTransaction | 자산 거래 (BUY/SELL/DEPOSIT/WITHDRAW/INTEREST/DIVIDEND) |
| AssetSnapshot | 자산 스냅샷 (@@unique assetId+date) |
| FixedCost | 고정비용 (category 8종 + costType: EXPENSE/SAVING) |
| FixedCostPayment | 월별 납부 (@@unique fixedCostId+year+month) |

## 고정비용 시스템

- **category**: HOUSING(주거), UTILITY(공과금), TELECOM(통신), SUBSCRIPTION(구독), INSURANCE(보험), TRANSPORT(교통), FINANCE(금융), ETC(기타)
- **costType**:
  - `EXPENSE` → 대시보드 **지출** 합계에 포함
  - `SAVING` → **자산 투입**(allocation)에 포함, 지출에 미포함
- 납부: `POST /api/fixed-costs/[id]/pay?month=&year=`
- 취소: `DELETE /api/fixed-costs/[id]/pay?month=&year=`

## API 응답 패턴

- 리스트: `{ data: [...] }` 래퍼
- 단건: 객체 직접 반환
- 에러: `{ error: "메시지" }` + HTTP status
- 클라이언트 unwrap: `const list = Array.isArray(json) ? json : json.data || []`

## 코딩 컨벤션

- 모든 페이지는 `"use client"` (클라이언트 컴포넌트)
- API Route → Zod validation → `result.data`를 Prisma에 전달
- shadcn/ui: `@/components/ui/`에서 import
- 금액: `Int` (원 단위), 표시 시 `formatCurrency()` (`lib/utils.ts`)
- 날짜: `date-fns`, DB에는 `DateTime`
- 네비게이션 추가 시 3곳 수정: `constants/index.ts`, `sidebar.tsx`, `mobile-nav.tsx`
- 새 페이지 추가: `src/app/[hash]/페이지명/page.tsx` + API는 `src/app/api/페이지명/route.ts`

## 디자인

- Primary: Blue (#3B82F6), 수입: Green (#22C55E), 지출: Red (#EF4444)
- 반응형 모바일 우선, 사이드바는 lg 이상
- 다크 모드: next-themes
- 토스트: sonner (`toast.success()`, `toast.error()`)

## 주의사항

- `.env` 파일은 커밋하지 않음 (.gitignore에 포함)
- `prisma/dev.db`는 커밋에 포함됨 (DB 데이터 공유용)
- DB 스키마 변경 시 반드시 `pnpm prisma migrate dev` 실행 후 커밋
- `pnpm build` 성공 확인 후 커밋할 것
