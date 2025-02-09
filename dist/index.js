"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadHistory = loadHistory;
exports.saveHistory = saveHistory;
exports.handleStreamResponse = handleStreamResponse;
exports.main = main;
const openai_1 = require("openai");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
// 获取命令行参数
const params = process.argv.slice(2);
const modelIndex = params.indexOf('-t');
let model, MAX_HISTORY = 1;
if (params.length === 0) {
    console.error('no content');
    process.exit(1);
}
if (!process.env.KEY) {
    console.error('no KEY');
    process.exit(1);
}
if (modelIndex >= 0) {
    model = params[modelIndex + 1];
    params.splice(modelIndex, 2);
}
const historyCountIndex = params.indexOf('-n');
if (historyCountIndex >= 0) {
    MAX_HISTORY = parseInt(params[historyCountIndex + 1]);
    params.splice(historyCountIndex, 2);
}
const currentModel = (0, constants_1.getModelConfig)(model);
if (!currentModel.key || !currentModel.baseURL) {
    console.error('no model');
    process.exit(1);
}
// 初始化 OpenAI 客户端
const openai = new openai_1.OpenAI({
    baseURL: currentModel.baseURL,
    apiKey: currentModel.key
});
// 确保目录存在
if (!fs_1.default.existsSync(path_1.default.join(__dirname, 'chats'))) {
    fs_1.default.mkdirSync(path_1.default.join(__dirname, 'chats'), { recursive: true });
}
// 将 HISTORY_FILE 的路径修改为相对于当前项目目录，并在文件名中加入模型信息
const HISTORY_FILE = path_1.default.join(__dirname, 'chats', `${new Date().toISOString().split('T')[0]}_${currentModel.name}_chat_history.json`);
// 读取历史记录
function loadHistory() {
    try {
        if (!fs_1.default.existsSync(HISTORY_FILE)) {
            // 如果文件不存在，创建空数组并保存
            saveHistory([]);
            return [];
        }
        const data = fs_1.default.readFileSync(HISTORY_FILE, 'utf8');
        let history = [];
        try {
            history = JSON.parse(data);
        }
        catch (error) {
            console.error('Error parsing history:', error);
        }
        return history;
    }
    catch (error) {
        console.error('Error loading history:', error);
    }
    return [];
}
// 保存历史记录
function saveHistory(history) {
    try {
        fs_1.default.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    }
    catch (error) {
        console.error('Error saving history:', error);
    }
}
// 定义消息处理函数
function handleStreamResponse(completion, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e, _f;
        let isHeader = true;
        try {
            try {
                for (var _g = true, _h = __asyncValues(completion.iterator()), _j; _j = yield _h.next(), _a = _j.done, !_a; _g = true) {
                    _c = _j.value;
                    _g = false;
                    const chunk = _c;
                    // 检查是否中止
                    if (completion.controller.signal.aborted) {
                        console.log('Stream processing aborted!');
                        return;
                    }
                    const content = (_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content;
                    // 处理头部换行
                    if (isHeader) {
                        if (content !== '\n') {
                            isHeader = false;
                            process.stdout.write('\n');
                        }
                        continue;
                    }
                    // 处理内容输出
                    if (content) {
                        process.stdout.write(content);
                        callback(content);
                    }
                    // 处理结束标记
                    if (((_f = chunk.choices[0]) === null || _f === void 0 ? void 0 : _f.finish_reason) === 'stop') {
                        process.stdout.write('\n');
                        break; // 明确结束循环
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_g && !_a && (_b = _h.return)) yield _b.call(_h);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (error) {
            console.error('Error processing stream:', error);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 加载历史记录
            let messageHistory = loadHistory();
            // 保持历史记录在最大长度限制内
            const latestMessageHistory = MAX_HISTORY !== 1 ? messageHistory.slice(-(MAX_HISTORY * 2)) : [];
            const userMessage = {
                role: 'user',
                content: params.join(' '),
                timestamp: Date.now()
            };
            // 添加用户新消息到历史记录（添加时间戳）
            latestMessageHistory.push(userMessage);
            const completion = yield openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    ...latestMessageHistory
                ],
                model: currentModel.name,
                stream: true
            });
            // 保存助手的回复到历史记录（添加时间戳）
            const assistantMessage = {
                role: 'assistant',
                content: '',
                timestamp: Date.now()
            };
            messageHistory.push(userMessage, assistantMessage);
            // 修改handleStreamResponse来累积响应内容
            yield handleStreamResponse(completion, (content) => {
                assistantMessage.content += content;
            });
            // 保存更新后的历史记录
            saveHistory(messageHistory);
        }
        catch (error) {
            console.error('Error in main:', error);
        }
    });
}
main();
