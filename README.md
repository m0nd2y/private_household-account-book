# 개인 가계부 (Private Household Account Book)

개인용 가계부 웹 애플리케이션. 로그인 없이 해시 URL로 접근하는 방식.

## 주요 기능

- **대시보드** — 월별 수입/지출 요약, 카테고리별 도넛 차트, 월별 추이 라인 차트, 예산 사용률, 고정비용 현황
- **거래 관리** — 수입/지출 등록, 수정, 삭제, 검색, 필터링, 페이지네이션
- **카테고리 관리** — 수입/지출 카테고리 CRUD, 아이콘/색상 설정, 하위 카테고리
- **결제수단 관리** — 신용카드, 체크카드, 현금, 계좌이체, 간편결제
- **예산 관리** — 월별 총예산 및 카테고리별 예산 설정, 사용률 추적
- **정기 거래** — 반복 수입/지출 등록 (매일/매주/매월/매년)
- **고정비용** — 월세, 구독료 등 고정 항목 등록 및 월별 납부 체크리스트
  - 분류: 주거, 공과금, 통신, 구독, 보험, 교통, 금융, 기타
  - 유형: 지출(대시보드 지출 합산) vs 저축/투자(자산 투입 합산)
- **자산 관리** — 예금, 적금, 투자, 가상화폐, 연금/보험 등록 및 월별 투입 추적
- **통계** — 카테고리별/결제수단별 분석, 월별 비교 차트
- **설정** — 다크 모드, 데이터 초기화

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| 스타일링 | Tailwind CSS, shadcn/ui |
| 차트 | Recharts |
| 폼/검증 | React Hook Form, Zod |
| Backend | Next.js API Routes |
| DB | Prisma ORM + SQLite |
| 패키지 매니저 | pnpm |

## 빠른 시작 (로컬)

```bash
# 1. 저장소 클론
git clone git@github.com:m0nd2y/private_household-account-book.git
cd private_household-account-book

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정
echo 'DATABASE_URL="file:./dev.db"' > .env
# SECRET_HASH는 미설정 시 첫 실행 때 자동 생성됨

# 4. DB 마이그레이션 + 시드 데이터
pnpm prisma migrate dev
pnpm prisma db seed

# 5. 개발 서버 실행
pnpm dev
```

첫 실행 시 콘솔에 접속 URL이 출력됩니다:
```
========================================
  가계부 접속 URL:
  http://localhost:3000/a7f3b9c2d8e4f1a6b0c5d9e3f7a2b8c4
========================================
```

## 서버 배포

### 사전 요구사항

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### 배포 단계

```bash
# 1. 저장소 클론
git clone git@github.com:m0nd2y/private_household-account-book.git
cd private_household-account-book

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
EOF
# SECRET_HASH는 첫 실행 시 자동 생성됨 (.env에 추가됨)
# 직접 지정하려면: SECRET_HASH="원하는해시값" 추가

# 4. DB 마이그레이션
pnpm prisma migrate deploy

# 5. 시드 데이터 (기본 카테고리 생성, 최초 1회)
pnpm prisma db seed

# 6. 프로덕션 빌드
pnpm build

# 7. 서버 실행
pnpm start
# 기본 포트: 3000
# 포트 변경: PORT=8080 pnpm start
```

### PM2로 백그라운드 실행 (권장)

```bash
# PM2 설치
npm install -g pm2

# 앱 실행
pm2 start pnpm --name "household-account-book" -- start

# 시스템 부팅 시 자동 시작
pm2 startup
pm2 save

# 상태 확인
pm2 status
pm2 logs household-account-book
```

### Nginx 리버스 프록시 (선택)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 업데이트 시

```bash
cd private_household-account-book
git pull origin main
pnpm install
pnpm prisma migrate deploy
pnpm build
pm2 restart household-account-book
```

## 보안

- 인증 시스템 대신 **추측 불가능한 해시 URL**로 접근 제한
- URL을 모르면 접근 불가 (404 반환)
- `.env` 파일에 `SECRET_HASH` 저장 (절대 커밋하지 않음)
- API 엔드포인트는 별도 인증 없음 (내부 네트워크 또는 Nginx로 보호 권장)

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DATABASE_URL` | Prisma DB 연결 문자열 | `file:./dev.db` |
| `SECRET_HASH` | URL 접근 해시 | 미설정 시 자동 생성 |
| `PORT` | 서버 포트 | `3000` |

## 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 (HMR) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 |
| `pnpm lint` | ESLint 검사 |
| `pnpm prisma migrate dev` | 개발용 마이그레이션 |
| `pnpm prisma migrate deploy` | 프로덕션 마이그레이션 |
| `pnpm prisma db seed` | 시드 데이터 투입 |
| `pnpm prisma studio` | DB GUI (localhost:5555) |
