#!/usr/bin/env node
"use strict";

const { spawn } = require('child_process');
const path = require('path');
const { setConfigDefaultModel, setBinCommandName } = require('../dist/util');
const { program } = require('commander');
const { MODEL_MAP } = require('../dist/constants.js');

// 设置基本命令和版本
program
  .name('mchat')
  .version('1.0.0')
  .description('AI Chat CLI Tool');

// 添加默认命令（聊天模式）
program
  .argument('[content...]', 'The content to chat with')
  .option('-t, --type <type>', 'Specify model type (chat/reasoner)')
  .option('-n, --history <number>', 'Number of history messages to keep', '1')
  .description('Start chat mode (default command)')
  .action((content , options) => {
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
    spawn('node', [path.join(__dirname, '../dist/index.js'), ...args], {
      stdio: 'inherit',
      shell: true
    });
  });

// 添加模型配置命令
program
  .command('set-model <model>')
  .description('Set default model type')
  .action((model) => {
    const validModels = Object.keys(MODEL_MAP);
    
    if (validModels.includes(model)) {
      setConfigDefaultModel(model);
      console.log(`Default model set to: ${model}`);
    } else {
      console.error(`Invalid model type. Valid options are: ${validModels.join(', ')}`);
    }
  });

// 添加其他命令示例
program
  .command('config')
  .description('Configure settings')
  .action(() => {
    console.log('Config command triggered');
    // 这里可以添加配置相关逻辑
  });

program
  .command('rename <newName>')
  .description('Change the command name')
  .action((newName) => {
    console.log(`Command name changed to: ${newName}`);
    setBinCommandName(newName);
  });

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}