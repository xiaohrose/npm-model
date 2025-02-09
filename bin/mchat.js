#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// 获取所有命令行参数
const args = process.argv.slice(2);

// 使用child_process将参数传递给dist/index.js
spawn('node', [path.join(__dirname, '../dist/index.js'), ...args], {
    stdio: 'inherit',
    shell: true
});