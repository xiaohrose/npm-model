import fs from 'fs';
import path from 'path';
import { TModelKey } from '../constants.js';

// 使用 CommonJS 的 __dirname 替代方案
// const locale_dirname = path.dirname(__filename);

interface Config {
    default: TModelKey;
}

interface PackageJson {
    bin: Record<string, string>;
    [key: string]: any;
}

const getConfigPath = (): string => path.join(__dirname, '../../config.json');

export function getConfigDefaultModel(): TModelKey {
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
        // 读取现有配置
        let config: Config = { default: 'chat' };
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            config = JSON.parse(data);
        }

        // 更新default字段
        config.default = model;

        // 写入文件
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error updating config file:', error);
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

export default {
    getConfigDefaultModel,
    setConfigDefaultModel,
    setBinCommandName
};