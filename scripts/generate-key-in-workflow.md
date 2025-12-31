# 在 GitHub Actions 中自动生成签名密钥

由于 Tauri 检测到 `pubkey` 配置，需要提供对应的私钥。有两个解决方案：

## 方案 1：在工作流中自动生成密钥（推荐）

修改工作流，在构建前自动生成密钥对。

## 方案 2：手动生成并添加到 Secrets

1. 运行脚本生成密钥：
   ```bash
   bash scripts/generate-signing-key.sh
   ```

2. 将输出的私钥添加到 GitHub Secrets：
   - 名称：`TAURI_SIGNING_PRIVATE_KEY`
   - 值：脚本输出的私钥内容

3. 更新 `tauri.conf.json` 中的 `pubkey` 为脚本输出的公钥

## 方案 3：临时移除 pubkey（不推荐）

如果不需要更新器签名验证，可以临时移除 `pubkey` 配置。

