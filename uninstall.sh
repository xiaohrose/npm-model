# Check if ts-node is installed globally and uninstall it if found
if npm list -g ts-node &>/dev/null; then
    echo "Uninstalling global ts-node..."
    npm uninstall -g ts-node
    if [ $? -eq 0 ]; then
        echo "ts-node successfully uninstalled"
    else
        echo "Failed to uninstall ts-node" >&2
        exit 1
    fi
else
    echo "ts-node is not installed globally"
fi

# Check if ds-npm is installed globally and get its location
if npm list -g ds-npm &>/dev/null; then
    echo "Found global ds-npm installation"
    DS_NPM_PATH=$(npm root -g)/ds-npm
    echo "Removing ds-npm from $DS_NPM_PATH..."
    rm -rf "$DS_NPM_PATH"
    if [ $? -eq 0 ]; then
        echo "ds-npm successfully removed"
    else
        echo "Failed to remove ds-npm" >&2
        exit 1
    fi
else
    echo "ds-npm is not installed globally"
fi

# Remove KEY variable from ~/.bashrc
if grep -q "export KEY=" ~/.bashrc; then
    echo "Removing KEY variable from ~/.bashrc..."
    sed -i '/export KEY=/d' ~/.bashrc
    if [ $? -eq 0 ]; then
        echo "KEY variable successfully removed from ~/.bashrc"
        source ~/.bashrc
    else
        echo "Failed to remove KEY variable from ~/.bashrc" >&2
        exit 1
    fi
else
    echo "KEY variable not found in ~/.bashrc"
fi
