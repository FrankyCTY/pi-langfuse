# AGENTS.md

## 项目概述

此仓库包含一个 Pi Coding Agent 扩展，将会话活动转发到 Langfuse 进行可观测性监控。运行时设计得尽可能精简：

- `index.ts`：扩展入口点、事件监听器、跟踪/跨度/生成生命周期和评分
- `package.json`：Pi/NPM 的包元数据
- `config.json`：仅用于手动开发的本地凭据文件，被 git 忽略
- `.agents/skills/langfuse/SKILL.md`：Langfuse 相关工作流的本地技能说明

## 扩展工作原理

该扩展监听 Pi 生命周期事件，并将它们映射到 Langfuse 对象：

1. `session_start` 捕获稳定的会话 ID
2. `before_agent_start` 为用户提示创建跟踪
3. `tool_call` / `tool_result` 创建和关闭工具跨度
4. `turn_end` 将 LLM 使用/成本元数据记录为生成
5. `agent_end` 完成跟踪并发布聚合评估分数
6. `session_shutdown` 刷新任何剩余状态

代码设计为有状态的。对跟踪/会话簿记的更改应仔细审查，因为多个 Pi 钩子共享相同的模块级状态。

## 本地开发

推荐环境：

- Node.js `>=22`（如 `package.json` 中声明）
- 包含 Langfuse 凭据的本地 `config.json`

典型工作流程：

```bash
npm install
pi "test prompt"
```

目前没有专门的测试套件或 `npm` 脚本。更改行为时，通过启用扩展运行 Pi 并确认跟踪、跨度、生成和分数出现在 Langfuse 中来验证。

## 编辑指南

- 优先在 `index.ts` 中进行小的、保持行为的更改；这里的错误大多是生命周期或可观测性形状错误，而不是 UI 问题。
- 将凭据材料排除在版本控制之外。`config.json` 应保持本地。
- 记录工具输入/输出时，注意有效负载大小和序列化失败。
- 如果添加新的 Langfuse 字段，请根据当前官方文档验证，因为 SDK 表面会演变。
- 除非 Pi 要求，否则避免在导入 SDK 文件时硬编码安装布局假设。

## 审查重点领域

审查或扩展此项目时，请特别注意：

- 跨 `before_agent_start`、`agent_end` 和 `session_shutdown` 的跟踪生命周期一致性
- 跟踪级别与观察级别的正确分数归属
- 对意外事件负载形状的防御性处理
- 大型工具有效负载的截断/编辑策略
- 已安装的 Langfuse SDK 版本与任何手动声明的本地 TypeScript 接口之间的兼容性