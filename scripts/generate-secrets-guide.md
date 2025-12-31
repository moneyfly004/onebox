# macOS 签名 Secrets 生成指南

## 📋 前置要求

1. **Apple Developer 账号**（$99/年）
   - 访问：https://developer.apple.com
   - 注册并支付年费

2. **Tauri CLI 工具**
   ```bash
   npm install -g @tauri-apps/cli
   # 或
   bun add -g @tauri-apps/cli
   ```

## 🔑 Secrets 生成步骤

### 1. TAURI_PRIVATE_KEY（Tauri 签名私钥）

这是唯一可以自动生成的部分。运行以下命令：

```bash
cd /Users/apple/Downloads/OneBox-main
tauri signer generate -w ~/.tauri/myapp.key
```

这会生成：
- 私钥文件：`~/.tauri/myapp.key`
- 公钥文件：`~/.tauri/myapp.key.pub`

**获取私钥内容**：
```bash
cat ~/.tauri/myapp.key
```

复制整个内容（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`），这就是 `TAURI_PRIVATE_KEY`。

### 2. APPLE_CERTIFICATE（Apple 开发者证书）

#### 步骤 1：创建证书签名请求（CSR）

1. 打开 **钥匙串访问**（Keychain Access）
2. 菜单：**钥匙串访问** → **证书助理** → **从证书颁发机构请求证书**
3. 填写信息：
   - 用户电子邮件：你的 Apple ID 邮箱
   - 常用名称：你的名字或公司名
   - CA 电子邮件地址：留空
   - 选择：**存储到磁盘**
4. 保存 CSR 文件（如 `CertificateSigningRequest.certSigningRequest`）

#### 步骤 2：在 Apple Developer 创建证书

1. 访问：https://developer.apple.com/account/resources/certificates/list
2. 点击 **+** 创建新证书
3. 选择 **Developer ID Application**（用于分发到 App Store 外）
   - 或选择 **Mac App Distribution**（用于 App Store）
4. 上传刚才创建的 CSR 文件
5. 下载证书文件（`.cer` 格式）

#### 步骤 3：安装并导出证书

1. 双击下载的 `.cer` 文件，安装到钥匙串
2. 在钥匙串访问中找到该证书
3. 右键 → **导出** → 选择 **个人信息交换 (.p12)** 格式
4. 设置密码（记住这个密码，这是 `APPLE_CERTIFICATE_PASSWORD`）
5. 保存为 `.p12` 文件

#### 步骤 4：转换为 Base64

```bash
# 将 .p12 文件转换为 Base64
base64 -i your_certificate.p12 | pbcopy
```

复制的内容就是 `APPLE_CERTIFICATE`。

**或者使用脚本**：
```bash
# macOS
base64 -i your_certificate.p12 > certificate_base64.txt
cat certificate_base64.txt
```

### 3. APPLE_CERTIFICATE_PASSWORD

这是你在导出 `.p12` 文件时设置的密码。直接使用即可。

### 4. APPLE_API_KEY 和 APPLE_API_ISSUER（用于公证）

#### 步骤 1：创建 API Key

1. 访问：https://developer.apple.com/account/resources/authkeys/list
2. 点击 **+** 创建新 Key
3. 填写名称（如 "OneBox Notarization"）
4. 勾选 **App Store Connect API**
5. 点击 **生成**
6. **重要**：下载 `.p8` 文件（只能下载一次！）
7. 记录：
   - **Key ID**：这就是 `APPLE_API_KEY`
   - **Issuer ID**：在页面顶部显示，这就是 `APPLE_API_ISSUER`

#### 步骤 2：获取 APPLE_AUTH_KEY

打开下载的 `.p8` 文件，复制全部内容：

```bash
cat ~/Downloads/AuthKey_XXXXXXXXXX.p8
```

复制的内容（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）就是 `APPLE_AUTH_KEY`。

### 5. KEYCHAIN_PASSWORD

这是你的 macOS 用户账户密码，或者你为构建创建的专用密码。

**建议**：创建一个专用的 keychain 密码，不要使用登录密码。

## 📝 设置 GitHub Secrets

1. 访问：https://github.com/moneyfly004/onebox/settings/secrets/actions
2. 点击 **New repository secret**
3. 逐个添加以下 secrets：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `TAURI_PRIVATE_KEY` | 从步骤 1 获取 | Tauri 签名私钥 |
| `APPLE_CERTIFICATE` | 从步骤 2 获取 | Base64 编码的证书 |
| `APPLE_CERTIFICATE_PASSWORD` | 你设置的密码 | P12 证书密码 |
| `APPLE_API_KEY` | 从步骤 4 获取 | Apple API Key ID |
| `APPLE_API_ISSUER` | 从步骤 4 获取 | Apple API Issuer ID |
| `APPLE_AUTH_KEY` | 从步骤 4 获取 | .p8 文件内容 |
| `KEYCHAIN_PASSWORD` | 你的密码 | Keychain 密码 |

## ⚠️ 重要提示

1. **.p8 文件只能下载一次**，请妥善保管
2. **不要将 secrets 提交到代码仓库**
3. **证书有效期**：通常为 1 年，需要定期更新
4. **测试构建**：可以先不设置这些 secrets，构建会成功但应用无法分发

## 🚀 快速检查清单

- [ ] Apple Developer 账号已激活
- [ ] Tauri 私钥已生成
- [ ] Apple 证书已创建并导出为 Base64
- [ ] Apple API Key 已创建并下载 .p8 文件
- [ ] 所有 secrets 已添加到 GitHub

## 📚 参考链接

- [Tauri 签名文档](https://tauri.app/v1/guides/distribution/signing)
- [Apple Developer 证书指南](https://developer.apple.com/support/certificates/)
- [Apple API Key 文档](https://developer.apple.com/documentation/appstoreconnectapi)

