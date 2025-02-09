"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigDefaultModel = getConfigDefaultModel;
exports.setConfigDefaultModel = setConfigDefaultModel;
exports.setBinCommandName = setBinCommandName;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getConfigPath = () => path_1.default.join(__dirname, '../../config.json');
function getConfigDefaultModel() {
    try {
        const config = JSON.parse(fs_1.default.readFileSync(getConfigPath(), 'utf8'));
        return config.default;
    }
    catch (error) {
        console.error('Error reading config file:', error);
        return 'chat';
    }
}
function setConfigDefaultModel(model) {
    const configPath = getConfigPath();
    try {
        // 读取现有配置
        let config = { default: 'chat' };
        if (fs_1.default.existsSync(configPath)) {
            const data = fs_1.default.readFileSync(configPath, 'utf8');
            config = JSON.parse(data);
        }
        // 更新default字段
        config.default = model;
        // 写入文件
        fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
    catch (error) {
        console.error('Error updating config file:', error);
    }
}
function setBinCommandName(newName) {
    const packageJsonPath = path_1.default.join(__dirname, '../../package.json');
    try {
        // 读取package.json
        const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf8'));
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
        fs_1.default.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`Command name changed from '${currentCommand}' to '${newName}'`);
        return true;
    }
    catch (error) {
        console.error('Error updating package.json:', error);
        return false;
    }
}
exports.default = {
    getConfigDefaultModel,
    setConfigDefaultModel,
    setBinCommandName
};
