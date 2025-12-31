#!/bin/bash
# 生成 Tauri 签名密钥对

echo "生成 Tauri 签名密钥对..."

# 创建 .tauri 目录
mkdir -p ~/.tauri

# 生成密钥对
tauri signer generate -w ~/.tauri/onebox.key

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 密钥对生成成功！"
    echo ""
    echo "私钥位置: ~/.tauri/onebox.key"
    echo "公钥位置: ~/.tauri/onebox.key.pub"
    echo ""
    echo "请将私钥内容添加到 GitHub Secrets:"
    echo "名称: TAURI_SIGNING_PRIVATE_KEY"
    echo ""
    echo "私钥内容:"
    cat ~/.tauri/onebox.key
    echo ""
    echo ""
    echo "公钥内容（已自动更新到 tauri.conf.json）:"
    cat ~/.tauri/onebox.key.pub
else
    echo "❌ 密钥生成失败，请确保已安装 Tauri CLI:"
    echo "   npm install -g @tauri-apps/cli"
    echo "   或"
    echo "   bun add -g @tauri-apps/cli"
fi

