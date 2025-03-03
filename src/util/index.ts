import fs from 'fs';
import path from 'path';
import { spawn } from 'node:child_process'
import { IModelConfig, TModelKey } from '@/types'


interface Config {
    default: TModelKey;
    models: Record<TModelKey, IModelConfig>
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

export function setBinCommandName(newName: string): boolean {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    try {
        // 读取package.json
        const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // 检查bin字段是否存在
        if (!packageJson.bin) {
            throw new Error('No bin field found in package.json');
        }

        // 获取当前命令名称
        const currentCommand = Object.keys(packageJson.bin)[0];
        if (!currentCommand) {
            throw new Error('No command found in bin field');
        }

        // 更新bin字段
        const commandPath = packageJson.bin[currentCommand];
        delete packageJson.bin[currentCommand];
        packageJson.bin[newName] = commandPath;

        // 写入更新后的package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        console.log(`Command name changed from '${currentCommand}' to '${newName}'`);
        return true;
    } catch (error) {
        console.error('Error updating package.json:', error);
        return false;
    }
}

export function getConfigModels(): Record<TModelKey, IModelConfig> {
    try {
        const config: Config = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
        if (config.models) {
            return config.models;
        }
        return {} as Record<TModelKey, IModelConfig>;
    } catch (error) {
        console.error('Error reading config models:', error);
        return {} as Record<TModelKey, IModelConfig>;
    }
}

export function setConfigModels(name: TModelKey, models: IModelConfig): boolean {
    try {
        const configPath = getConfigPath();
        const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        config.models[name] = models;
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
    setBinCommandName,
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
