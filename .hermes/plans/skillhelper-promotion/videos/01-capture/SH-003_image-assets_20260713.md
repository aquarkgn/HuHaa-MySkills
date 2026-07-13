# SH-003 图片素材规划

## 已保存的浏览器截图

| 用途 | 文件 |
| --- | --- |
| 官网首屏，可作 SH-002 或 SH-003 开场转场 | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-002_site-hero_16x9_20260713_v01.jpg` |
| 官网 CTA，可作 SH-008 结尾转场 | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-008_site-cta_16x9_20260713_v01.jpg` |

## SH-003 需要从真实录屏中导出的图片帧

| 步骤 | 画面内容 | 建议保存位置 |
| --- | --- | --- |
| 1 | `npm view skillshelper version dist-tags.latest --json` 显示 `0.4.1` | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-003_01_npm-view_20260713_v01.jpg` |
| 2 | `npm install ... skillshelper@latest` 安装完成 | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-003_02_install_20260713_v01.jpg` |
| 3 | `skillshelper --version` 显示 `skillshelper v0.4.1` | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-003_03_version_20260713_v01.jpg` |
| 4 | `scan --json > skills.json 2> scan.log` 命令执行 | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-003_04_scan-redirect_20260713_v01.jpg` |
| 5 | `JSON OK: true / ... item(s)` | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-003_05_json-ok_20260713_v01.jpg` |
| 6 | `scan.log` 中出现 `[scan]` | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-003_06_scan-log_20260713_v01.jpg` |

## 可选截图

| 用途 | 建议保存位置 | 说明 |
| --- | --- | --- |
| GitHub 仓库页 | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-008_github-repo_16x9_20260713_v01.jpg` | 可用于 CTA；不是 SH-003 必需项 |
| npm 包页 | `.hermes/plans/skillhelper-promotion/videos/01-capture/screenshots/SH-008_npm-package_16x9_20260713_v01.jpg` | 不作为必要素材；SH-003 以 `npm view` 命令画面为准 |
