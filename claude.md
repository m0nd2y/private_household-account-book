# 가계부 애플리케이션 (Household Account Book)

개인용 가계부 웹 애플리케이션 프로젝트

## 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트 라이브러리
- **Recharts** - 차트 라이브러리
- **React Hook Form** + **Zod** - 폼 관리 및 유효성 검사
- **Lucide React** - 아이콘

### Backend
- **Next.js API Routes** (App Router)
- **Prisma ORM** - 데이터베이스 ORM
- **SQLite** (개발) / **PostgreSQL** (프로덕션)

### 개발 도구
- **ESLint** + **Prettier** - 코드 품질
- **pnpm** - 패키지 매니저

---

## 보안 방식: 해시 URL

> 인증 시스템 없이 **추측 불가능한 해시 URL**로 접근을 제한합니다.

### 구조
```
https://yourdomain.com/{SECRET_HASH}/           # 대시보드
https://yourdomain.com/{SECRET_HASH}/transactions
https://yourdomain.com/{SECRET_HASH}/categories
https://yourdomain.com/{SECRET_HASH}/statistics
...
```

### 예시
```
SECRET_HASH = "a7f3b9c2d8e4f1a6b0c5d9e3f7a2b8c4"

→ https://yourdomain.com/a7f3b9c2d8e4f1a6b0c5d9e3f7a2b8c4/
→ https://yourdomain.com/a7f3b9c2d8e4f1a6b0c5d9e3f7a2b8c4/transactions
```

### 장점
- 로그인 없이 바로 접근
- URL을 모르면 접근 불가
- 북마크로 간편하게 저장

---

## 주요 기능

### 1. 대시보드 (Dashboard)
- [ ] 이번 달 총 수입/지출 요약
- [ ] 예산 대비 지출 현황 (프로그레스 바)
- [ ] 최근 거래 내역 (5~10건)
- [ ] 카테고리별 지출 비율 (도넛 차트)
- [ ] 월별 수입/지출 추이 (라인 차트)

### 2. 거래 관리 (Transactions)
- [ ] 수입/지출 등록
  - 날짜 선택
  - 금액 입력
  - 카테고리 선택
  - 결제수단 선택
  - 메모 입력
  - 태그 추가
- [ ] 거래 수정/삭제
- [ ] 거래 목록 조회 (페이지네이션)
- [ ] 거래 검색 및 필터링
  - 날짜 범위
  - 카테고리
  - 결제수단
  - 금액 범위
  - 키워드

### 3. 카테고리(품목) 관리 (Categories)
#### 기본 수입 카테고리
- 급여
- 부수입
- 용돈
- 투자수익
- 환급금
- 기타 수입

#### 기본 지출 카테고리
- 식비 (식료품, 외식, 카페/음료)
- 교통비 (대중교통, 주유, 택시, 주차)
- 주거비 (월세, 관리비, 공과금)
- 통신비 (휴대폰, 인터넷)
- 의료/건강 (병원, 약국, 건강관리)
- 교육 (학원, 도서, 강의)
- 문화/여가 (영화, 취미, 여행)
- 쇼핑 (의류, 생활용품)
- 금융 (보험료, 대출이자)
- 경조사
- 기타 지출

#### 카테고리 기능
- [ ] 커스텀 카테고리 추가
- [ ] 카테고리 수정/삭제
- [ ] 카테고리 아이콘/색상 설정
- [ ] 하위 카테고리 지원

### 4. 결제수단(카드) 관리 (Payment Methods)
- [ ] 결제수단 등록
  - 신용카드
  - 체크카드
  - 현금
  - 계좌이체
  - 간편결제 (카카오페이, 네이버페이 등)
- [ ] 카드 정보 관리
  - 카드명
  - 카드사
  - 결제일
  - 한도 (신용카드)
- [ ] 결제수단 수정/삭제
- [ ] 결제수단별 지출 내역 조회

### 5. 예산 관리 (Budget)
- [ ] 월별 총 예산 설정
- [ ] 카테고리별 예산 설정
- [ ] 예산 대비 지출 현황
- [ ] 예산 초과 알림
- [ ] 예산 이월 설정

### 6. 정기 거래 (Recurring Transactions)
- [ ] 정기 수입 등록 (급여, 용돈 등)
- [ ] 정기 지출 등록 (월세, 구독료 등)
- [ ] 반복 주기 설정 (매일/매주/매월/매년)
- [ ] 자동 기록 설정
- [ ] 정기 거래 수정/삭제

### 7. 통계 및 차트 (Statistics & Charts)
- [ ] 월별 수입/지출 비교 (막대 차트)
- [ ] 카테고리별 지출 비율 (파이/도넛 차트)
- [ ] 일별/주별/월별 지출 추이 (라인 차트)
- [ ] 결제수단별 지출 분석
- [ ] 전월 대비 증감률
- [ ] 연간 리포트
- [ ] 기간별 비교 분석

### 8. 데이터 관리 (Data Management)
- [ ] 데이터 내보내기 (CSV, Excel)
- [ ] 데이터 가져오기
- [ ] 데이터 백업
- [ ] 전체 데이터 초기화

### 9. 설정 (Settings)
- [ ] 통화 설정 (KRW 기본)
- [ ] 시작 요일 설정 (월별 시작일)
- [ ] 테마 설정 (라이트/다크 모드)

---

## 데이터베이스 스키마

> **인증 없음**: 해시 URL 방식으로 접근 제한 (URL 자체가 비밀번호 역할)

### Category (카테고리)
```prisma
model Category {
  id          String   @id @default(cuid())
  name        String
  type        TransactionType  // INCOME | EXPENSE
  icon        String?
  color       String?
  isDefault   Boolean  @default(false)
  parentId    String?
  parent      Category?  @relation("SubCategories", fields: [parentId], references: [id])
  children    Category[] @relation("SubCategories")
  createdAt   DateTime @default(now())

  transactions Transaction[]
  budgets      Budget[]
}
```

### PaymentMethod (결제수단)
```prisma
model PaymentMethod {
  id           String   @id @default(cuid())
  name         String
  type         PaymentType  // CREDIT_CARD | DEBIT_CARD | CASH | BANK_TRANSFER | E_WALLET
  cardCompany  String?
  paymentDay   Int?     // 결제일 (1-31)
  creditLimit  Int?     // 신용한도
  isDefault    Boolean  @default(false)
  createdAt    DateTime @default(now())

  transactions Transaction[]
}
```

### Transaction (거래)
```prisma
model Transaction {
  id              String   @id @default(cuid())
  amount          Int
  type            TransactionType  // INCOME | EXPENSE
  description     String?
  memo            String?
  date            DateTime
  categoryId      String
  category        Category @relation(fields: [categoryId], references: [id])
  paymentMethodId String?
  paymentMethod   PaymentMethod? @relation(fields: [paymentMethodId], references: [id])
  tags            Tag[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Budget (예산)
```prisma
model Budget {
  id          String   @id @default(cuid())
  amount      Int
  month       Int      // 1-12
  year        Int
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())

  @@unique([month, year, categoryId])
}
```

### RecurringTransaction (정기 거래)
```prisma
model RecurringTransaction {
  id              String   @id @default(cuid())
  amount          Int
  type            TransactionType
  description     String
  frequency       Frequency  // DAILY | WEEKLY | MONTHLY | YEARLY
  dayOfMonth      Int?
  dayOfWeek       Int?
  startDate       DateTime
  endDate         DateTime?
  isActive        Boolean  @default(true)
  categoryId      String
  paymentMethodId String?
  createdAt       DateTime @default(now())
}
```

### Tag (태그)
```prisma
model Tag {
  id           String   @id @default(cuid())
  name         String   @unique
  transactions Transaction[]
}
```

### Enums
```prisma
enum TransactionType {
  INCOME
  EXPENSE
}

enum PaymentType {
  CREDIT_CARD
  DEBIT_CARD
  CASH
  BANK_TRANSFER
  E_WALLET
}

enum Frequency {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}
```

---

## 프로젝트 구조

```
src/
├── app/                      # Next.js App Router
│   ├── [hash]/              # 해시 URL 기반 라우팅
│   │   ├── page.tsx         # 대시보드 홈
│   │   ├── transactions/    # 거래 관리
│   │   ├── categories/      # 카테고리 관리
│   │   ├── payment-methods/ # 결제수단 관리
│   │   ├── budget/          # 예산 관리
│   │   ├── recurring/       # 정기 거래
│   │   ├── statistics/      # 통계/차트
│   │   ├── settings/        # 설정
│   │   └── layout.tsx       # 대시보드 레이아웃 (해시 검증)
│   ├── api/                 # API Routes
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── payment-methods/
│   │   ├── budgets/
│   │   └── statistics/
│   ├── page.tsx             # 루트 (404 또는 리다이렉트)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # shadcn/ui 컴포넌트
│   ├── charts/              # 차트 컴포넌트
│   ├── forms/               # 폼 컴포넌트
│   ├── layout/              # 레이아웃 컴포넌트
│   └── shared/              # 공통 컴포넌트
├── lib/
│   ├── prisma.ts            # Prisma 클라이언트
│   ├── hash.ts              # 해시 검증 유틸리티
│   ├── utils.ts             # 유틸리티 함수
│   └── validations/         # Zod 스키마
├── middleware.ts            # 해시 URL 검증 미들웨어
├── hooks/                   # 커스텀 훅
├── types/                   # TypeScript 타입
├── constants/               # 상수
└── styles/                  # 스타일
```

---

## UI/UX 디자인 가이드

### 색상 팔레트
- **Primary**: Blue (#3B82F6)
- **수입**: Green (#22C55E)
- **지출**: Red (#EF4444)
- **배경**: White (#FFFFFF) / Dark (#1F2937)
- **텍스트**: Gray (#374151)

### 디자인 원칙
1. **깔끔하고 미니멀한 디자인**
2. **직관적인 네비게이션**
3. **반응형 레이아웃** (모바일 우선)
4. **다크 모드 지원**
5. **부드러운 애니메이션**

### 주요 컴포넌트
- 사이드바 네비게이션
- 헤더 (검색)
- 카드 기반 레이아웃
- 모달/드로어 폼
- 플로팅 액션 버튼 (거래 추가)

---

## 개발 순서

### Phase 1: 프로젝트 초기 설정
1. Next.js 프로젝트 생성
2. Tailwind CSS, shadcn/ui 설정
3. Prisma 설정 및 스키마 작성
4. 해시 URL 미들웨어 설정

### Phase 2: 기본 CRUD
1. 카테고리 관리
2. 결제수단 관리
3. 거래 등록/수정/삭제/조회

### Phase 3: 대시보드 & 차트
1. 대시보드 레이아웃
2. 요약 카드
3. 차트 컴포넌트

### Phase 4: 고급 기능
1. 예산 관리
2. 정기 거래
3. 통계 페이지

### Phase 5: 마무리
1. 설정 페이지
2. 데이터 내보내기
3. 반응형 최적화
4. 다크 모드

---

## 실행 명령어

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 데이터베이스 마이그레이션
pnpm prisma migrate dev

# Prisma Studio (DB GUI)
pnpm prisma studio

# 빌드
pnpm build
```

---

## 환경 변수

```env
# .env
DATABASE_URL="file:./dev.db"

# 비밀 해시 URL (32자 이상 랜덤 문자열 권장)
# 이 값이 URL 경로가 됩니다: /{SECRET_HASH}/
SECRET_HASH="a7f3b9c2d8e4f1a6b0c5d9e3f7a2b8c4"
```

### 해시 생성 방법
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# OpenSSL
openssl rand -hex 16

# 예시 출력: a7f3b9c2d8e4f1a6b0c5d9e3f7a2b8c4
```

---

## 접근 제어 흐름

```
1. 사용자가 /{SECRET_HASH}/ 경로로 접속
2. middleware.ts에서 URL의 해시값과 환경변수 비교
3. 일치하면 페이지 렌더링
4. 불일치하면 404 페이지 표시
5. 루트(/) 접근 시 404 표시 (사이트 존재 자체를 숨김)
```
