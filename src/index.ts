import { spawn } from 'child_process';
import path from 'path';
import { setConfigDefaultModel, runServerShell, getCurrentModelName, getConfigModels } from './util';
import { program } from 'commander';
import { MODEL_MAP } from './constants';
import { TModelKey } from './types';
import { isProd } from './util/env'

interface ChatOptions {
  type?: string;
  history?: string;
}

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
  .action((content: string[], options: ChatOptions) => {
    // 如果没有提供任何内容，显示帮助信息
    if (!content.length) {
      program.outputHelp();
      return;
    }

    const args: string[] = [];
    if (content) {
      args.push(...content);
    }
    if (options.type) {
      args.push('-t', options.type);
    }
    if (options.history) {
      args.push('-n', options.history);
    }

    const command = isProd ? 'node' : 'ts-node';
    const mainPath = isProd ? path.join(__dirname, 'main.js') : path.join(__dirname, '..', 'src', 'main.ts');
    spawn(command, [mainPath, ...args], {
      stdio: 'inherit',
      shell: true
    });
  });

// 添加模型配置命令
program
  .command('set-model <model>')
  .description('Set default model type')
  .action((model: string) => {
    const validModels = Object.keys(MODEL_MAP);

    if (validModels.includes(model)) {
      setConfigDefaultModel(model as TModelKey);
      console.log(`Default model set to: ${model}`);
    } else {
      console.error(`Invalid model type. Valid options are: ${validModels.join(', ')}`);
    }
  });

program
  .command('show')
  .description('Show current default model name')
  .action(() => {
    const modelName = getCurrentModelName();
    console.log(`Current default model: ${modelName}`);
  });

// 添加其他命令示例
program
  .command('config')
  .description('Configure settings')
  .action(() => {
    console.log('Config command triggered');
    // TODO 这里可以添加配置相关逻辑
  });

program
  .command('start-client')
  .description('Start both server and client applications')
  .action((options) => {
    console.log(`Starting client and server on ${options.host}:${options.port}`);
    runServerShell();
  });

// mc list， 展示config中模型
program
  .command('list')
  .description('List all available models and their configurations')
  .action(() => {
    const models = getConfigModels();
    const tableData = Object.entries(models).map(([key, config]) => ({
      Key: key,
      Model: config.model
    }));

    console.log('\nAvailable Models:');
    console.table(tableData);
  });

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
