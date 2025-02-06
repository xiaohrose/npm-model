#!/usr/bin/env node
"use strict";

const { spawn } = require('child_process');
const path = require('path');
const { program } = require('commander');

// 设置基本命令和版本
program
  .name('mchat')
  .version('1.0.0')
  .description('AI Chat CLI Tool');

// 添加默认命令（聊天模式）
program
  .command('chat')
  .description('Start chat mode')
  .argument('[content...]', 'The content to chat with')
  .option('-t, --type <type>', 'Specify model type (chat/reasoner)')
  .option('-n, --history <number>', 'Number of history messages to keep', '1')
  .action((content, options) => {
    const args = [];
    if (content) {
      args.push(...content);
    }
    if (options.type) {
      args.push('-t', options.type);
    }
    if (options.history) {
      args.push('-n', options.history);
    }
    spawn('ts-node', [path.join(__dirname, '../src/index.ts'), ...args], {
      stdio: 'inherit',
      shell: true
    });
  });

// 添加其他命令示例
program
  .command('config')
  .description('Configure settings')
  .action(() => {
    console.log('Config command triggered');
    // 这里可以添加配置相关逻辑
  });

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}