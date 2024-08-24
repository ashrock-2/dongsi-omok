# 베이스 이미지 설정: Node.js 환경
FROM node:22.1.0 AS base

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 매니저 설치 (pnpm)
RUN npm install -g pnpm

# 패키지 파일들을 복사
COPY . .

# 백엔드 종속성 설치
RUN pnpm install --filter back-end --filter shared --frozen-lockfile

# 백엔드 실행 단계
CMD ["bun", "back-end/src/index.ts"]
