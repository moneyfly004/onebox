# GitHub 同步和构建指南

## 📋 前置准备

### 1. 初始化 Git 仓库（如果还没有）

```bash
cd /Users/apple/Downloads/OneBox-main
git init
git add .
git commit -m "Initial commit: Add authentication and subscription features"
```

### 2. 添加远程仓库

```bash
git remote add origin https://github.com/moneyfly004/onebox.git
# 或者使用 SSH
# git remote add origin git@github.com:moneyfly004/onebox.git
```

### 3. 推送到 GitHub

```bash
git branch -M main
git push -u origin main
```

## 🔑 Token 设置说明

### **GITHUB_TOKEN（自动提供，无需设置）**

GitHub Actions 会自动提供 `GITHUB_TOKEN`，**你不需要手动设置**。这个 token 有足够的权限来：
- 创建 Release
- 上传构建产物
- 创建 Tag

### **可选：macOS 签名和公证（仅 macOS 需要）**

如果你需要为 macOS 应用签名和公证，需要设置以下 Secrets：

1. 进入仓库：`https://github.com/moneyfly004/onebox/settings/secrets/actions`
2. 添加以下 Secrets（仅 macOS 需要）：

```
TAURI_PRIVATE_KEY          # Tauri 签名私钥
APPLE_CERTIFICATE          # Apple 开发者证书（Base64 编码）
APPLE_CERTIFICATE_PASSWORD # 证书密码
APPLE_API_KEY              # Apple API Key ID
APPLE_API_ISSUER           # Apple API Issuer ID
APPLE_AUTH_KEY             # Apple API Key 内容（.p8 文件内容）
KEYCHAIN_PASSWORD          # Keychain 密码
```

**注意**：如果只是测试构建，或者只构建 Windows/Linux 版本，**不需要设置这些 secrets**。

## 🚀 构建方式

### 方式 1：使用 GitHub Actions（推荐）

项目已经配置好了 GitHub Actions 工作流：

#### **手动构建（最简单）**

1. 进入 Actions 页面：`https://github.com/moneyfly004/onebox/actions`
2. 选择 "Manual Build" 工作流
3. 点击 "Run workflow"
4. 选择分支（通常是 `main`）
5. 点击 "Run workflow" 按钮

#### **自动构建**

- **Stable Release**: 当 `src-tauri/tauri.conf.json` 文件更改并推送到 `main` 分支时自动触发
- **Dev Release**: 当 `src-tauri/tauri.conf.json` 文件更改并推送到 `feature/dev` 分支时自动触发

### 方式 2：本地构建

```bash
# 安装依赖
bun install

# 下载二进制文件
bun run scripts/download-binaries.ts

# 构建
bun run tauri build
```

## ✅ 构建成功检查清单

### 基本构建（Windows/Linux）
- ✅ **不需要任何 Token** - `GITHUB_TOKEN` 自动提供
- ✅ 代码已同步到 GitHub
- ✅ GitHub Actions 工作流已配置
- ✅ 依赖已安装（Bun、Node.js、Rust）

### macOS 构建（需要签名）
- ⚠️ 需要设置 Apple 相关的 Secrets（见上方）
- ⚠️ 如果没有设置，构建会失败或应用无法分发

## 🔍 构建状态检查

构建完成后，可以在以下位置查看：

1. **Actions 页面**: `https://github.com/moneyfly004/onebox/actions`
2. **Releases 页面**: `https://github.com/moneyfly004/onebox/releases`

## 📝 注意事项

1. **首次构建可能需要较长时间**（下载依赖、编译等）
2. **Windows/Linux 构建不需要任何 Token**
3. **macOS 构建需要 Apple 开发者账号**（如果要做签名）
4. **构建产物会自动上传到 Releases**

## 🐛 常见问题

### Q: 构建失败怎么办？
A: 检查 Actions 日志，通常是因为：
- 依赖安装失败
- 代码编译错误
- 缺少必要的 secrets（仅 macOS）

### Q: 可以只构建某个平台吗？
A: 可以修改 `.github/workflows/*.yml` 文件，删除不需要的平台配置。

### Q: 如何修改构建配置？
A: 编辑 `src-tauri/tauri.conf.json` 文件。

## 🎯 快速开始

```bash
# 1. 初始化并推送代码
cd /Users/apple/Downloads/OneBox-main
git init
git add .
git commit -m "Add authentication features"
git remote add origin https://github.com/moneyfly004/onebox.git
git push -u origin main

# 2. 在 GitHub 上触发构建
# 访问: https://github.com/moneyfly004/onebox/actions
# 选择 "Manual Build" -> "Run workflow"
```

**总结**：对于 Windows/Linux 构建，**不需要设置任何 Token**，GitHub 会自动提供 `GITHUB_TOKEN`。

