# Ensis / Save Forge

一个在浏览器本地运行的 Ensis IDLE 存档编辑器。上传的存档不会发送到服务器；页面只在当前标签页中解析 Base64 JSON、修改字段并重新编码下载。

## 功能

- 材料按 `storageCapacityCache` 的自定义倍率写入，默认 **100 倍**。
- 可将 `lastActiveTime` 回退 24 小时至昨天。
- 可补齐源码中确认的 28 种遗物并设为 100。
- 可补齐源码中确认的 17 个地图区域，并将探索次数设为 100 或自定义值。
- 可设置符文目标，例如 `1000000`。
- 严格拒绝空文件、损坏 Base64 和截断 JSON；生成后会在浏览器内回读验证。

## 本地开发

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。生产构建使用 `pnpm build`；GitHub Pages 使用 `.github/workflows/pages.yml` 只构建 `client` 静态产物。

## 隐私

这是一个纯前端工具，没有存档上传接口、数据库或历史文件存储。请仍然保留原始存档备份，并在导入修改版前确认游戏版本兼容性。

## 可复用技能

`skill/ensis-save-editor/` 包含同一套可重复使用的命令行流程，适合代理或本地脚本批量处理存档。
