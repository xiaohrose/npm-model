# 执行卸载脚本
echo "正在执行卸载脚本..."
if ! ./uninstall.sh; then
    echo "卸载失败，请检查错误信息" >&2
fi

# 清理node_modules目录
echo "正在删除node_modules目录..."
if ! rm -rf node_modules; then
    echo "删除node_modules失败" >&2
    exit 1
fi

# 上传项目到远程服务器
echo "正在上传项目到远程服务器..."
REMOTE_USER="root"
REMOTE_HOST="106.15.137.107"
SOURCE_DIR="../deepseek-npm"
DEST_DIR="~"

if ! scp -r "$SOURCE_DIR" "$REMOTE_USER@$REMOTE_HOST:$DEST_DIR"; then
    echo "上传失败，请检查网络连接和服务器状态" >&2
    exit 1
fi

echo "所有操作成功完成"