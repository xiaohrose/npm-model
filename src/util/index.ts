import fs from 'fs';
import path from 'path';
import { spawn } from 'node:child_process'
import { IModelConfig, TModelKey } from '@/types'

interface Config {
    default: TModelKey;
    models: IModelConfig[];
}

interface PackageJson {
    bin: Record<string, string>;
    [key: string]: any;
}

const getConfigPath = (): string => path.join(__dirname, '../../config.json');

export function getConfigDefaultModel(): string {
    try {
        const config: Config = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
        return config.default;
    } catch (error) {
        console.error('Error reading config file:', error);
        return 'chat';
    }
}

export function setConfigDefaultModel(model: TModelKey): void {
    const configPath = getConfigPath();
    try {
        const data = fs.readFileSync(configPath, 'utf8');
        let config = JSON.parse(data);

        // 更新default字段
        config.default = model;

        // 写入文件
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error updating config file:', error);
    }
}

export function getCurrentModelName(): string {
    try {
        const config: Config = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
        return config.default;
    } catch (error) {
        console.error('Error reading config file:', error);
        return 'chat';
    }
}

export function getConfigModels(): Record<string, IModelConfig> {
    try {
        const config: Config = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
        if (config.models) {
            // 将数组转换为以name为key的对象
            return config.models.reduce((acc, model) => {
                acc[model.name] = model;
                return acc;
            }, {} as Record<string, IModelConfig>);
        }
        return {};
    } catch (error) {
        console.error('Error reading config models:', error);
        return {};
    }
}

export function setConfigModels(name: TModelKey, modelConfig: IModelConfig): boolean {
    try {
        const configPath = getConfigPath();
        const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // 查找并更新或添加模型配置
        const index = config.models.findIndex(m => m.name === name);
        if (index !== -1) {
            config.models[index] = { ...modelConfig, name };
        } else {
            config.models.push({ ...modelConfig, name });
        }

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error updating config models:', error);
        return false;
    }
}

export default {
    getConfigDefaultModel,
    setConfigDefaultModel,
    getCurrentModelName
};

export function runServerShell(): void {
    try {
        const shellPath = path.join(__dirname, '..', '..', 'shells', 'server.sh');
        if (!fs.existsSync(shellPath)) {
            throw new Error('server.sh not found');
        }

        const child = spawn('sh', [shellPath], {
            stdio: 'inherit',
            shell: true,
            detached: true
        });

        child.unref();

        console.log('Server started successfully');
    } catch (error) {
        console.error('Error running server shell:', error);
    }
}

export function readChats(): Array<{ name: string; date: string; title: string }> {
    const chatDir = path.join(__dirname, '../chats');

    const chatFiles = fs.readdirSync(chatDir).filter(file => file.endsWith('.json')).reverse();

    const chatDetails: Array<{ name: string; date: string; title: string }> = [];

    for (const file of chatFiles) {
        try {
            const fileNameParts = file.replace('.json', '').split('_');
            const date = fileNameParts[0];
            const modelName = fileNameParts[1];

            chatDetails.push({ name: modelName, date, title: file });
        } catch (error: any) {
            console.error(`Error parsing chat file ${file}:`, error.message);
        }
    }

    return chatDetails;
}

export function readChatDataByFile(file: string): Array<{ role: 'user' | 'assistant'; timestamp: number; content: string }> {
    const chatFilePath = path.join(__dirname, `../chats/${file}`);
    try {
        if (fs.existsSync(chatFilePath)) {
            const data = fs.readFileSync(chatFilePath, 'utf8');
            const parsedData = JSON.parse(data) as Array<{ role: 'user' | 'assistant'; timestamp: number; content: string }>;

            // Validate the structure of each entry to ensure it matches the expected format
            const validatedData = parsedData.filter((entry) =>
                typeof entry.role === 'string' &&
                ['user', 'assistant'].includes(entry.role) &&
                typeof entry.timestamp === 'number' &&
                typeof entry.content === 'string'
            );

            return validatedData;
        } else {
            console.error(`File not found: ${chatFilePath}`);
            return [];
        }
    } catch (error: any) {
        console.error(`Error reading chat file ${file}:`, error.message);
        return [];
    }
}
