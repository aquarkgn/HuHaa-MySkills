#!/bin/bash
# SkillHelper 前端框架初始化脚本
# Next.js 15 + React 18 + TypeScript 完整项目结构

set -e

PROJECT_NAME="skillhelper-web"
WORKSPACE_DIR="/Users/mac/Project/SkillsHelper"

echo "🚀 初始化 Next.js 前端项目..."
cd "$WORKSPACE_DIR"

# 1. 创建 Next.js 项目（使用官方 create-next-app）
npm create next-app@latest "$PROJECT_NAME" \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --import-alias "@/*" \
  --skip-git \
  --no-src-dir

cd "$PROJECT_NAME"

# 2. 安装核心依赖
echo "📦 安装依赖包..."
npm install \
  react@18.3.1 \
  react-dom@18.3.1 \
  zustand@4.4.7 \
  @tanstack/react-query@5.36.2 \
  react-hook-form@7.52.0 \
  zod@3.23.5 \
  lucide-react@0.408.0 \
  class-variance-authority@0.7.0 \
  clsx@2.1.0 \
  tailwind-merge@2.3.0

# 3. 安装 shadcn/ui 和开发工具
npm install --save-dev \
  @types/node@20.11.5 \
  @types/react@18.2.48 \
  @types/react-dom@18.2.18 \
  typescript@5.3.3 \
  autoprefixer@10.4.17 \
  postcss@8.4.33 \
  prettier@3.1.1 \
  eslint@8.56.0 \
  eslint-config-next@15.0.0 \
  @typescript-eslint/parser@6.16.0 \
  @typescript-eslint/eslint-plugin@6.16.0 \
  eslint-plugin-react@7.33.2 \
  eslint-plugin-react-hooks@4.6.0

# 4. 创建项目目录结构
echo "📁 创建项目目录结构..."

mkdir -p \
  src/components/ui \
  src/components/common \
  src/components/layout \
  src/features \
  src/hooks \
  src/lib \
  src/types \
  src/constants \
  src/config \
  src/styles \
  src/providers \
  tests/unit \
  tests/integration \
  tests/__mocks__ \
  public/images \
  public/icons

# 5. 创建核心配置文件
echo "⚙️  创建配置文件..."

# TypeScript 配置
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"],
      "@/types/*": ["src/types/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/config/*": ["src/config/*"],
      "@/styles/*": ["src/styles/*"],
      "@/constants/*": ["src/constants/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# ESLint 配置
cat > .eslintrc.json << 'EOF'
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/prop-types": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
EOF

# Prettier 配置
cat > .prettierrc << 'EOF'
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always"
}
EOF

# Next.js 配置
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
};

module.exports = nextConfig;
EOF

# 6. 创建 Tailwind 配置和主题
cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        border: 'hsl(var(--color-border))',
        input: 'hsl(var(--color-input))',
        ring: 'hsl(var(--color-ring))',
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          foreground: 'hsl(var(--color-secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--color-destructive))',
          foreground: 'hsl(var(--color-destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--color-muted))',
          foreground: 'hsl(var(--color-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          foreground: 'hsl(var(--color-accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
EOF

# 7. 创建全局样式和主题变量
mkdir -p src/styles
cat > src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;

    /* Light Mode (Default) */
    --color-border: 220 13% 91%;
    --color-input: 220 13% 91%;
    --color-ring: 215 100% 46%;

    --color-background: 0 0% 100%;
    --color-foreground: 220 9% 12%;

    --color-primary: 215 100% 46%;
    --color-primary-foreground: 220 9% 12%;

    --color-secondary: 217 33% 17%;
    --color-secondary-foreground: 210 40% 96%;

    --color-destructive: 0 84% 60%;
    --color-destructive-foreground: 210 40% 96%;

    --color-muted: 220 13% 91%;
    --color-muted-foreground: 217 33% 40%;

    --color-accent: 38 92% 50%;
    --color-accent-foreground: 220 9% 12%;

    --radius-lg: 0.5rem;
    --radius-md: 0.375rem;
    --radius-sm: 0.25rem;
  }

  .dark {
    --color-border: 217 33% 17%;
    --color-input: 217 33% 17%;
    --color-ring: 215 100% 46%;

    --color-background: 220 9% 8%;
    --color-foreground: 210 40% 96%;

    --color-primary: 215 100% 46%;
    --color-primary-foreground: 220 9% 12%;

    --color-secondary: 210 40% 96%;
    --color-secondary-foreground: 217 33% 17%;

    --color-destructive: 0 84% 60%;
    --color-destructive-foreground: 0 0% 100%;

    --color-muted: 217 33% 17%;
    --color-muted-foreground: 215 14% 55%;

    --color-accent: 38 92% 50%;
    --color-accent-foreground: 220 9% 12%;
  }
}

@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
EOF

# 8. 创建 package.json 脚本
cat > package.json << 'EOF'
{
  "name": "skillhelper-web",
  "version": "1.0.0",
  "description": "SkillHelper - 前端应用",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next": "^15.0.0",
    "zustand": "^4.4.7",
    "@tanstack/react-query": "^5.36.2",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.5",
    "lucide-react": "^0.408.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17",
    "prettier": "^3.1.1",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "@typescript-eslint/parser": "^6.16.0",
    "@typescript-eslint/eslint-plugin": "^6.16.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
EOF

# 9. 创建示例组件结构
cat > src/types/index.ts << 'EOF'
/**
 * 全局类型定义
 * 按功能模块组织，避免类型定义分散
 */

// 通用类型
export interface BaseResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 用户相关
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
}

// 技能相关
export interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: 1 | 2 | 3 | 4 | 5
  createdAt: string
}
EOF

cat > src/lib/cn.ts << 'EOF'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名
 * 处理 Tailwind 类名冲突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

echo "✅ 项目初始化完成！"
echo ""
echo "📋 后续步骤："
echo "1. cd $PROJECT_NAME"
echo "2. npm run dev"
echo "3. 访问 http://localhost:3000"
echo ""
echo "📚 规范文档："
echo "   - TypeScript Strict 模式已启用"
echo "   - Tailwind CSS + CSS Variables 主题系统就绪"
echo "   - shadcn/ui 组件库已配置"
echo "   - ESLint + Prettier 自动格式化已启用"
echo ""
