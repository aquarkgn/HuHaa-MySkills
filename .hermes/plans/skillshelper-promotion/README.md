# SkillsHelper 推广资料库

这里是 **呼哈哈-技能助手**唯一的推广运营工作区。它与产品代码分离：代码和官网放在 `packages/`，推广策略、镜头清单、发布复盘和视频文件索引都放在本目录。

## 品牌口径

- 对外名称：**呼哈哈-技能助手**。
- 一句话：**把散落在本机、编辑器、插件与 MCP 配置中的 AI 能力，整理成一个可搜索、可理解、可持续维护的工作台。**
- 英文一句话：**A local workspace for discovering, organizing, and understanding AI workflow capabilities.**
- 技术身份：仓库与英文名统一为 `SkillsHelper`；npm 包名和 CLI 命令使用 `skillshelper`。
- 内容原则：真实录屏、真实命令、真实数据优先；AI 只用于脚本、配音、字幕、封面和过渡包装，并在平台要求时标识。

## 文件导航

| 文件/目录 | 单一职责 | 更新时机 |
| --- | --- | --- |
| [镜头资产管理规范.md](./镜头资产管理规范.md) | 镜头管理软件 MVP、状态流转、命名和存储边界 | 工作流变化时 |
| [assets/shot-catalog.yaml](./assets/shot-catalog.yaml) | 每个镜头的唯一事实来源与录制标准 | 录制前、版本发布后 |
| [campaigns/2026-Q3-推广计划.md](./campaigns/2026-Q3-推广计划.md) | 三平台内容矩阵、8 镜头母版、发布节奏 | 每周复盘后 |
| [videos/](./videos/) | 原始录屏、精选片段、剪辑工程和导出文件的本地管理入口 | 录制、剪辑、导出时 |
| `metrics/` | 每周平台数据和仓库转化记录 | 发布后 48 小时、7 天 |
| `archive/` | 已废弃口径与历史方案的说明 | 方案替换时 |

## 目录边界

```text
仓库（Git 版本化）
└── .hermes/plans/skillshelper-promotion/
    ├── assets/                 # YAML 清单、字幕稿、封面文案，不放二进制素材
    ├── campaigns/              # 平台计划与发布记录
    ├── metrics/                # CSV/Markdown 指标快照
    ├── videos/                 # 视频资产工作区；大视频默认被 .gitignore 排除
    └── archive/                # 历史口径的索引，不覆盖原始证据

视频资产工作区（仓库内管理，二进制大文件默认不提交）
└── .hermes/plans/skillshelper-promotion/videos/
    ├── 01-capture/             # 原始录屏
    ├── 02-selects/             # 精选镜头
    ├── 03-edit/                # 剪辑工程
    ├── 04-export/              # 平台导出文件
    └── 05-cover/               # 封面源文件与导出图
```

旧版研究资料仍保留在 `docs/调研报告/` 作为调研证据，不再作为发布口径。发布前以本目录的镜头清单和当次运行结果为准。
