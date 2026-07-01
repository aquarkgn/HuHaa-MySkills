# HuHaa-MySkills 桌面模式开发计划（框架方案）

**日期**: 2026-07-01
**类型**: 技术方案 / 架构骨架（**暂不实现**）
**技术方向**: 原生 **Swift / SwiftUI**（macOS）
**参考项目**: [Pearcleaner](https://github.com/alienator88/Pearcleaner)（macOS 清理工具，Swift/SwiftUI）
**审查状态**: ⏳ 待人工审查 / 后续排期

---

## 1. 定位与目标

将 HuHaa-MySkills 从当前的 **Node.js + React 网页版** 演进出一个**原生 macOS 桌面应用**，直接读取本地技能库（`~/.hermes/skills`），提供更快的扫描、原生的系统图标、更贴合 macOS 的交互体验。

> 本文档只给出**框架与技术方案骨架**，不含具体实现代码。目的是确定技术路线、模块边界与关键取舍，供后续排期。

### 目标

- 🎯 原生扫描本地 `SKILL.md`，性能优于网页版
- 🎯 用系统原生 API 展示真实工具/编辑器图标（对标 Pearcleaner 图标能力）
- 🎯 提供 Sidebar + List/Grid + 详情面板的原生 UI
- 🎯 与本地技能库实时同步（文件监听）

### 非目标（本期不做）

- ❌ 不做跨平台（仅 macOS）
- ❌ 不做技能编辑/写入（先只读浏览）
- ❌ 不替换现有网页版（两者可并存，共享数据源）

---

## 2. 技术选型

| 层面 | 选型 | 理由（对标 Pearcleaner） |
|------|------|--------------------------|
| 语言 | Swift 5.9+ | 原生、类型安全 |
| UI | SwiftUI | 声明式，快速构建 List/Grid/详情，Pearcleaner 同款 |
| 最低系统 | macOS 13 Ventura+ | 兼顾 SwiftUI 新特性与覆盖率 |
| 工程 | Xcode Project | 对标 Pearcleaner `.xcodeproj` 结构 |
| 状态管理 | `ObservableObject` + `@Published` | 对标 Pearcleaner `AppState.shared` |
| YAML 解析 | [Yams](https://github.com/jpsim/Yams) (SPM) | 解析 SKILL.md frontmatter |
| 文件监听 | `FSEvents` / `DispatchSource` | 技能目录变化实时刷新 |
| 并发 | `DispatchQueue.concurrent` + `DispatchGroup` 或 Swift Concurrency (`async/await`, `TaskGroup`) | 对标 Pearcleaner 并发扫描 |

---

## 3. 工程结构（骨架，对标 Pearcleaner 分层）

```
HuHaaSkillsDesktop/
├── HuHaaSkillsDesktop.xcodeproj
├── App/
│   └── HuHaaSkillsApp.swift          # @main 入口
├── Logic/
│   ├── SkillScanner.swift            # 扫描引擎（对标 Logic.swift + AppInfoFetch.swift）
│   ├── SkillMetadataFetcher.swift    # frontmatter / 时间戳解析（对标 MetadataAppInfoFetcher）
│   ├── IconProvider.swift            # 图标获取 + 预渲染 + 缓存（对标 AppInfoUtils.fetchAppIcon）
│   ├── SkillLocations.swift          # 扫描根目录定义（对标 Locations.swift）
│   └── AppState.swift                # 全局状态（对标 AppState.swift）
├── Models/
│   ├── SkillInfo.swift               # 完整技能模型（对标 AppInfo）
│   └── SkillInfoMini.swift           # 轻量模型（对标 AppInfoMini）
├── Views/
│   ├── ContentView.swift             # 根布局（Sidebar + Detail）
│   ├── SidebarView.swift             # 分类/来源导航
│   ├── SkillListView.swift           # 列表视图（对标 AppListItems）
│   ├── SkillGridView.swift           # 网格视图（对标 GridAppItem）
│   └── SkillDetailView.swift         # 详情面板（frontmatter + 正文）
└── Resources/
    └── Assets.xcassets
```

---

## 4. 核心模块框架

### 4.1 数据模型（对标 `AppInfo` / `AppInfoMini`）

```swift
// 完整模型
struct SkillInfo: Identifiable, Equatable, Hashable {
    let id: UUID
    let path: URL              // SKILL.md 绝对路径
    let name: String
    let description: String
    let category: String?
    let brand: String?         // 图标解析依据
    let source: String?
    let tier: SkillTier?
    let tags: [String]
    let icon: NSImage?         // 预渲染后的图标
    let raw: String            // 完整正文
    let frontmatter: [String: Any]
    let createdAt: Date?
    let updatedAt: Date?
}

// 轻量模型（两阶段加载第一阶段）
struct SkillInfoMini: Identifiable {
    let id: UUID
    let path: URL
    let name: String
    let description: String
    let category: String?
    let brand: String?
    let icon: NSImage?
    func toSkillInfo() -> SkillInfo   // 升级到完整模型
}

enum SkillTier { case tool, directory, other }
```

### 4.2 扫描引擎 `SkillScanner`（对标并发扫描 + 两阶段加载）

**设计要点**（不实现）：

- **递归发现**：从 `SkillLocations.roots`（默认 `~/.hermes/skills`，目录名大小写不敏感）用 `FileManager` 递归找 `SKILL.md`
- **并发分块**：文件列表按 CPU 核数分块，`DispatchQueue(attributes: .concurrent)` + `DispatchGroup`（或 `TaskGroup`）并行解析
- **两阶段**：
  - 阶段 1：产出 `SkillInfoMini` → UI 立即渲染
  - 阶段 2：后台补全 `raw` / 完整 frontmatter / 时间戳 → 升级为 `SkillInfo`
- **内存自动释放**：循环解析中用 `autoreleasepool` 及时释放（对标 Pearcleaner）

```swift
final class SkillScanner {
    func scan(roots: [URL]) async -> [SkillInfoMini]        // 阶段 1（快）
    func upgrade(_ mini: SkillInfoMini) async -> SkillInfo  // 阶段 2（补全）
}
```

### 4.3 图标服务 `IconProvider`（对标 `AppInfoUtils.fetchAppIcon`）

**原生实现优势**：桌面版可直接用 `NSWorkspace`，无需网页版的 `sips`/`mdfind` 迂回。

**设计要点**（不实现）：

- **品牌 → 应用定位**：`brand` → 候选 Bundle ID / 应用名
  - `NSWorkspace.shared.urlForApplication(withBundleIdentifier:)` 直接拿到 `.app` URL
  - 或扫描 `/Applications`、`~/Applications`
- **取图标**：`NSWorkspace.shared.icon(forFile: appPath)`
- **预渲染**：绘制到固定尺寸（如 64×64），提升列表滚动性能（对标 Pearcleaner 的 50×50 预渲染，须在主线程绘制）
- **缓存**：内存 `[brand: NSImage]`；找不到对应 app 时回退 SF Symbols / emoji 占位

```swift
final class IconProvider {
    static let shared = IconProvider()
    func icon(forBrand brand: String, size: CGFloat) -> NSImage   // 命中真实图标
    func fallbackIcon(for skill: SkillInfoMini) -> NSImage        // 降级占位
}
```

### 4.4 状态管理 `AppState`（对标 Pearcleaner）

```swift
final class AppState: ObservableObject {
    static let shared = AppState()
    @Published var skills: [SkillInfo] = []
    @Published var filteredSkills: [SkillInfo] = []
    @Published var selectedSkill: SkillInfo?
    @Published var searchText: String = ""
    @Published var isGridMode: Bool = false
    @Published var isScanning: Bool = false
    @Published var groupBy: GroupOption = .category
}
```

### 4.5 文件监听（实时刷新）

- 用 `FSEventStream` 监听 `~/.hermes/skills`，防抖后触发增量重扫（对标网页版 chokidar + SSE 的原生等价物）

---

## 5. UI 框架（SwiftUI 骨架）

```
ContentView (NavigationSplitView)
├── SidebarView            分类 / 来源 / tier 导航
├── SkillListView / SkillGridView   （可切换）
│     每项：真实图标 + 名称 + 描述 + brand/category 标签
└── SkillDetailView        右侧详情：frontmatter 元数据 + 渲染正文 + 操作（复制/打开）
```

- 图标位：`Image(nsImage: skill.icon ?? fallback)`，圆角处理（列表 30×30 / 网格 48×48，对标 Pearcleaner）
- 搜索/排序/分组：复用 `AppState` 的 `@Published` 驱动

---

## 6. 与现有网页版的关系

| 维度 | 方案 |
|------|------|
| 数据源 | **共享** `~/.hermes/skills`，两版本读同一批 SKILL.md |
| 扫描逻辑 | 桌面版用原生 Swift 重写（不复用 Node scanner），规则对齐 v3.0（R1–R7） |
| 图标逻辑 | 桌面版用 `NSWorkspace` 原生实现，语义等价网页版 R6 |
| 共存 | 两版本可并存；桌面版定位「本地快速浏览」，网页版定位「跨端/分享」 |
| 规则一致性 | 扫描规则以 `SKILL_SCANNING_RULE_v3.0` 为**唯一事实来源**，两端实现须对齐 |

---

## 7. 分阶段路线图（骨架级，暂不排期）

| 阶段 | 内容 | 产出 |
|------|------|------|
| M0 | 建 Xcode 工程 + SPM 依赖（Yams）+ 空窗口 | 可运行外壳 |
| M1 | `SkillScanner` 扫描 + `SkillInfoMini` 列表 | 能列出技能 |
| M2 | `IconProvider` 真实图标 + 预渲染缓存 | 图标展示 |
| M3 | 详情面板 + 搜索/排序/分组 | 基本可用 |
| M4 | 文件监听实时刷新 + 两阶段补全 | 体验完善 |
| M5 | 代码签名 / 沙盒 / 公证 / 分发 | 可分发 |

---

## 8. 风险与开放问题

| 风险 / 问题 | 说明 | 待决 |
|------------|------|------|
| **App Sandbox** | 沙盒下访问 `~/.hermes/skills` 与 `/Applications` 需权限；取应用图标可能受限 | 是否启用沙盒？或用 security-scoped bookmarks |
| **代码签名 / 公证** | 分发需 Apple Developer 账号签名 + 公证 | 分发渠道未定 |
| **图标可用性** | `hermes` / `codex` 等可能无 GUI app → 无真实图标 | 沿用 v3.0 降级链（SF Symbols / emoji） |
| **规则漂移** | 桌面版与网页版扫描规则可能不一致 | 以 v3.0 规则文档为唯一事实来源，双端对齐测试 |
| **维护成本** | 双技术栈（Node + Swift）维护成本翻倍 | 评估是否值得，或长期收敛到单一形态 |
| **数据源路径** | Hermes 目录结构变化会同时影响两端 | 抽象扫描根目录配置 |

---

## 9. 决策待确认

- [ ] 是否接受**双技术栈**（网页版 + 桌面版）长期并存？
- [ ] 桌面版是否需要**沙盒**（影响分发方式与权限模型）？
- [ ] 最低系统版本定 macOS 13 是否合适？
- [ ] 是否需要与网页版共享任何逻辑（如 brand 映射表以 JSON 形式共享）？
- [ ] 分发渠道：直接下载 / Homebrew Cask / Mac App Store？

---

**状态**: ⏳ 待人工审查（框架方案，暂不实现）
**上次更新**: 2026-07-01
**审查人**: （待指定）
