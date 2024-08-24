# Base 이미지 설정
FROM node:22.1.0 AS base

# 작업 디렉토리 설정
WORKDIR /app

# 루트 패키지 파일 복사 및 pnpm 설치
COPY ../package.json ../pnpm-lock.yaml ../pnpm-workspace.yaml ./
RUN npm install -g pnpm

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 백엔드 실행 단계
FROM node:22.1.0 AS backend

# 작업 디렉토리 설정
WORKDIR /app

# bun 설치
RUN curl -fsSL https://bun.sh/install | bash

# 백엔드 소스 코드 복사
COPY ./src ./src
COPY ./shared ../shared

# 환경 변수 설정 (옵션)
ENV PORT=8080

# 백엔드 서버 시작 (bun으로 TypeScript 파일 직접 실행)
CMD ["bash", "-c", "~/.bun/bin/bun src/index.ts"]
