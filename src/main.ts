import { OpenAI } from "openai";
import fs from 'fs';
import path from 'path';
import { getModelConfig } from './constants'

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

const currentModel = getModelConfig(model);

if (!currentModel.key || !currentModel.url) {
    console.error('no model');
    process.exit(1)
}

// 初始化 OpenAI 客户端
const openai = new OpenAI({
    baseURL: currentModel.url,
    apiKey: process.env[currentModel.key]
});

// 确保目录存在
if (!fs.existsSync(path.join(__dirname, 'chats'))) {
    fs.mkdirSync(path.join(__dirname, 'chats'), { recursive: true });
}

// 将 HISTORY_FILE 的路径修改为相对于当前项目目录，并在文件名中加入模型信息
const HISTORY_FILE = path.join(__dirname, 'chats', `${new Date().toISOString().split('T')[0]}_${currentModel.model}_chat_history.json`);

// 添加接口定义
interface HistoryEntry {
    role: 'system' | 'user' | 'assistant';
    content: string;
    name?: string;
    timestamp?: number;
}

// 读取历史记录
export function loadHistory(): HistoryEntry[] {
    try {
        if (!fs.existsSync(HISTORY_FILE)) {
            // 如果文件不存在，创建空数组并保存
            saveHistory([]);
            return [];
        }

        const data = fs.readFileSync(HISTORY_FILE, 'utf8');
        let history: HistoryEntry[] = [];
        try {
            history = JSON.parse(data) as HistoryEntry[];
        } catch (error) {
            console.error('Error parsing history:', error);
        }
        return history;
    } catch (error) {
        console.error('Error loading history:', error);
    }
    return [];
}

// 保存历史记录
export function saveHistory(history: OpenAI.Chat.ChatCompletionMessageParam[]) {
    try {
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

// 定义消息处理函数
export async function handleStreamResponse(completion: any, callback: (content: string) => void) {
    let isHeader = true;
    try {
        for await (const chunk of completion.iterator()) {
            // 检查是否中止
            if (completion.controller.signal.aborted) {
                console.log('Stream processing aborted!');
                return;
            }

            const content = chunk.choices[0]?.delta?.content;

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
            if (chunk.choices[0]?.finish_reason === 'stop') {
                process.stdout.write('\n');
                break; // 明确结束循环
            }
        }
    } catch (error) {
        console.error('Error processing stream:', error);
    }
}

export async function main() {
    try {
        // 加载历史记录
        let messageHistory = loadHistory();

        // 保持历史记录在最大长度限制内
        const latestMessageHistory = MAX_HISTORY !== 1 ? messageHistory.slice(-(MAX_HISTORY * 2)) : [];

        const userMessage: HistoryEntry = {
            role: 'user' as const,
            content: params.join(' '),
            timestamp: Date.now()
        }
        // 添加用户新消息到历史记录（添加时间戳）
        latestMessageHistory.push(userMessage);

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                ...latestMessageHistory
            ],
            model: currentModel.model,
            stream: true
        });

        // 保存助手的回复到历史记录（添加时间戳）
        const assistantMessage: HistoryEntry = {
            role: 'assistant' as const,
            content: '',
            timestamp: Date.now()
        };
        messageHistory.push(userMessage, assistantMessage);

        // 修改handleStreamResponse来累积响应内容
        await handleStreamResponse(completion, (content: string) => {
            assistantMessage.content += content;
        });

        // 保存更新后的历史记录
        saveHistory(messageHistory);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();