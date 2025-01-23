
# 检查是否提供了API KEY
if [ -n "$1" ]; then
    # 将KEY添加到环境变量
    if ! grep -q "export KEY=$1" ~/.bashrc; then
        echo "export KEY=$1" >> ~/.bashrc
        echo "API KEY已添加到环境变量"
    fi
    source ~/.bashrc
fi


# 检查是否安装了ts-node
if ! command -v ts-node &> /dev/null; then
    echo "ts-node未安装，正在安装..."
    npm install -g ts-node
    echo "ts-node安装完成"
else
    echo "ts-node已安装"
fi

npm install

npm link

# 检查mc命令是否可用
if command -v mc &> /dev/null; then
    echo "mc命令已成功安装，可以使用mc命令启动"
else
    echo "mc命令安装失败，请检查npm link是否成功"
    exit 1
fi

