# 检查是否安装了node
if ! command -v node &> /dev/null; then
    echo "Node.js未安装，正在安装..."
    
    # 使用nvm安装node（如果nvm可用）
    if command -v nvm &> /dev/null; then
        nvm install --lts
    else
        # 如果没有nvm，使用系统包管理器
        if command -v apt-get &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v yum &> /dev/null; then
            curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo -E bash -
            sudo yum install -y nodejs
        elif command -v brew &> /dev/null; then
            brew install node
        else
            echo "无法自动安装Node.js，请手动安装Node.js LTS版本"
            exit 1
        fi
    fi
    
    echo "Node.js安装完成"
else
    echo "Node.js已安装"
fi

# 检查是否安装了mp-mc
if ! npm list -g | grep -q "mp-mc"; then
    echo "mp-mc未安装，正在安装..."
    npm install -g mp-mc
    echo "mp-mc安装完成"
else
    echo "mp-mc已安装"
fi


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

