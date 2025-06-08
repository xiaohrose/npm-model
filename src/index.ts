import { spawn } from 'child_process';
import path from 'path';
import { runServerShell, getCurrentModelName, getConfigModels, setConfigModels } from './util';
import { program } from 'commander';
import { isProd } from './util/env'
import fs from 'fs';
import { IModelConfig } from './types';

interface Config {
  default?: string;
  models: IModelConfig[];
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
    const mainPath = path.join(__dirname, 'main.js');
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

// 添加模型配置
program
  .command('add')
  .description('Add a new model configuration')
  .option('-e, --name <name>', 'Model name (key)')
  .option('-m, --model <model>', 'Model identifier')
  .option('-u, --url <url>', 'API URL')
  .option('-k, --key <key>', 'Environment variable name for API key')
  .action((options) => {
    // 检查是否提供了所有必需的参数
    const requiredFields = ['name', 'model', 'url', 'key'];
    const missingFields = requiredFields.filter(field => !options[field]);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields.join(', '));
      console.log('\nUsage example:');
      console.log('xxx add -nm gpt4 -m gpt-4 -u https://api.openai.com/v1 -k OPENAI_KEY');
      return;
    }

    const modelConfig: IModelConfig = {
      name: options.name,
      model: options.model,
      url: options.url,
      key: options.key
    };

    if (setConfigModels(options.name, modelConfig)) {
      console.log('Model configuration added successfully');
      console.log('Added configuration:', modelConfig);
    } else {
      console.error('Failed to add model configuration');
    }
  });

// 删除模型配置
// TODO 这里可以加个简称
program
  .command('delete <model>')
  .description('Delete model configuration by model name')
  .action((name: string) => {
    const configPath = path.join(__dirname, '../config.json');
    try {
      const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const models = config.models;

      // 查找匹配的模型
      const items = models
        .filter((config) => config.name === name)

      if (items.length === 0) {
        console.log(`No model found with name: ${name}`);
        return;
      }

      // 删除匹配的模型
      config.models = models.filter(item => item.name !== name)

      // 如果删除的是当前默认模型，重置默认模型
      if (config.default && items.some(item => item.name === config.default)) {
        const remainingModels = config.models;
        if (remainingModels.length > 0) {
          config.default = remainingModels[0].name;
          console.log(`Default model reset to: ${config.default}`);
        } else {
          delete config.default;
          console.log('No models remaining, default model removed');
        }
      }

      // 更新配置文件
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('Configuration file updated successfully');
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
