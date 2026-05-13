# pi-langfuse

[Pi Coding Agent](https://github.com/earendil-works/pi-coding-agent) 的 Langfuse 可观测性扩展。将跟踪发送到 [Langfuse](https://langfuse.com) 以监控令牌、成本、延迟和工具调用。

## 为什么选择 Langfuse？

Langfuse 为 LLM 应用程序提供开源的可观测性。此扩展允许您以生产级细节**跟踪**、**监控**和**调试**您的 Pi 会话，帮助您准确了解代理的性能、成本以及可能失败的地方。

## 功能

- **分层跟踪**：将用户提示映射到每轮跨度和嵌套工具执行，实现深度可见性。
- **LLM 元数据**：自动记录每轮的模型名称、提供商、令牌使用情况和 API 成本。
- **工具可观测性**：每个工具调用的详细日志，包括参数、结果和错误状态。
- **会话关联**：将同一 Pi 会话中的所有提示分组到单个 Langfuse 会话中。
- **成本跟踪**：记录每代输入/输出/总成本（美元）。
- **令牌使用**：跟踪每轮的输入和输出令牌。

## 快速安装

### 通过 npm（推荐）
```bash
pi install npm:pi-langfuse
```

## 配置

从 [Langfuse Cloud](https://cloud.langfuse.com) → 设置 → API 密钥获取您的密钥。

在扩展目录中创建 `config.json`：

```json
{
  "publicKey": "pk-lf-xxxx",
  "secretKey": "sk-lf-xxxx",
  "host": "https://cloud.langfuse.com"
}
```

对于 npm 安装，扩展位于：
```
~/.pi/agent/npm/@ravan08/pi-langfuse/index.ts
```

## 使用

### 启用跟踪运行 pi

```bash
pi "your prompt"
```

Pi 自动加载扩展。所有会话都将被跟踪到 Langfuse。

## 跟踪模型

```
跟踪（名称："pi-agent"）
├── 会话 ID：<pi-session-id>
├── 元数据：模型、提供商、cwd
└── 跨度（名称："tool:<name>"）
    └── 输入/输出日志

生成（名称："llm-response"）
├── 模型：MiniMax-M2.7
├── 使用：输入/输出令牌
└── 成本：输入/输出/总美元
```

## 跟踪内容

### 跟踪级别
- `input` - 用户提示
- `output` - 助手响应
- `sessionId` - Pi 会话标识符
- `metadata` - 模型、提供商、cwd

### 生成观察（LLM 调用）
- `model` - 模型标识符（例如，"MiniMax-M2.7"）
- `usage` - 令牌计数（输入/输出/总计）
- `costDetails` - 成本细分（美元）

### 跨度观察（工具调用）
- `name` - 工具名称（例如，"tool:bash"）
- `input` - 工具参数（JSON）
- `output` - 工具结果
- `metadata.isError` - 工具是否失败

## Langfuse 仪表板

运行后，在您的 Langfuse 项目中检查：

1. **跟踪** - 所有 pi 代理运行及其 I/O
2. **会话** - 按会话 ID 分组的跟踪
3. **观察** - 工具调用和 LLM 生成
4. **分数** - 评估指标，如工具错误和成功率
5. **模型使用** - 按模型划分的使用情况细分

## 故障排除

**没有跟踪出现？**
- 验证 `config.json` 中的 API 密钥是否正确
- 检查 Langfuse 项目是否活跃
- 确保 API 密钥具有写入权限

**扩展未加载？**
- 运行 `pi list` 检查已安装的包
- 尝试重启 pi

**模型/成本未显示？**
- 并非所有提供商都公开成本信息
- 检查 Langfuse 跟踪 API 获取原始观察数据

## 依赖项

- [langfuse](https://www.npmjs.com/package/langfuse) - Langfuse SDK
- [@earendil-works/pi-coding-agent](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) - Pi 扩展 API

## 许可证

MIT