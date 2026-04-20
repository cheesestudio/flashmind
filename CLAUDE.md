# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在本项目中工作时提供指导。

## 项目概述

FlashMind（AI闪卡大师）是一个基于艾宾浩斯遗忘曲线的 AI 闪卡学习应用。React + TypeScript 单页应用，数据存储在浏览器 localStorage 中。

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 类型检查并构建生产版本
npm run preview  # 预览生产构建
```

## 架构设计

### 数据流
- **存储层**：通过 `src/utils/storage.ts` 操作浏览器 localStorage
- **复习算法**：`src/utils/spacedReview.ts` 实现 SM-2 算法变体
- **类型定义**：`src/types/index.ts` 定义核心领域类型

### 核心类型 (src/types/index.ts)
- `Flashcard`: { id, front, back, createdAt, nextReviewAt, interval, easeFactor }
- `CardLibrary`: { id, name, description?, cards[], createdAt, updatedAt }
- `StudyRecord`: { libraryId, cardId, reviewedAt, quality }

### 核心工具函数
- `src/utils/storage.ts`: CardLibrary 的增删改查、导入导出 JSON
- `src/utils/spacedReview.ts`: calculateNextReview()、getCardsDueForReview()、formatNextReview()

## 设计文档

项目根目录有两个中文设计文档：
- `AI闪卡助手设计.md` - 产品设计和功能规格
- `AI闪卡助手实现计划.md` - 详细实现计划，包含各组件完整代码

实现计划中包含了所有计划功能组件的完整代码（Header、CardLibrary、CardEditor、StudyMode、AIGenerator）以及自定义 Hooks（useFlashcards、useAI）。

## 当前状态

应用目前处于最小骨架状态 - 类型定义和工具函数已实现，但 UI 组件和主应用逻辑尚未完整构建。可按照实现计划文档完成功能开发。