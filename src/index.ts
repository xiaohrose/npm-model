import { spawn } from 'child_process';
import path from 'path';
import { runServerShell, getCurrentModelName, getConfigModels } from './util';
import { program } from 'commander';
import { isProd } from './util/env'
import fs from 'fs';
import { IModelConfig } from './types';

interface Config {
  default?: string;
  models: Record<string, IModelConfig>;
}

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
  .command('start')
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

// 删除模型配置
program
  .command('delete <model>')
  .description('Delete model configuration by model name')
  .action((model: string) => {
    const configPath = path.join(__dirname, '../config.json');
    try {
      const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const models = config.models;

      // 查找匹配的模型
      const keysToDelete = Object.entries(models)
        .filter(([_, config]) => config.model === model)
        .map(([key]) => key);

      if (keysToDelete.length === 0) {
        console.log(`No model found with name: ${model}`);
        return;
      }

      // 删除匹配的模型
      keysToDelete.forEach(key => {
        delete models[key];
        console.log(`Deleted model configuration for key: ${key}`);
      });

      console.log(config, '23');


      // // 如果删除的是当前默认模型，重置默认模型
      // if (config.default && keysToDelete.includes(config.default)) {
      //   const remainingModels = Object.keys(models);
      //   if (remainingModels.length > 0) {
      //     config.default = remainingModels[0];
      //     console.log(`Default model reset to: ${config.default}`);
      //   } else {
      //     delete config.default;
      //     console.log('No models remaining, default model removed');
      //   }
      // }

      // // 更新配置文件
      // fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      // console.log('Configuration file updated successfully');
    } catch (error) {
      console.error('Error updating configuration:', error);
    }
  });

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
