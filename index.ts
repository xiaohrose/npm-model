import { OpenAI } from "openai";
import fs from 'fs';
import path from 'path';

const MODEL_MAP = {
    'c': 'deepseek-chat',
    'r': 'deepseek-reasoner',
    'chat': 'deepseek-chat',
    'reasoner': 'deepseek-reasoner'
}
// 获取命令行参数
const params = process.argv.slice(2);
const modelIndex = params.indexOf('-t');
let model = 'chat';

if (modelIndex >= 0) {
    model = params[modelIndex + 1];
    params.splice(modelIndex, 2);
}

if (!process.env.KEY) {
    console.error('请设置KEY');
    process.exit(1);
}

// 初始化 OpenAI 客户端
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.KEY
});

// 确保目录存在
if (!fs.existsSync(path.join(__dirname, 'chats'))) {
    fs.mkdirSync(path.join(__dirname, 'chats'), { recursive: true });
}

// 将 HISTORY_FILE 的路径修改为相对于当前项目目录
const HISTORY_FILE = path.join(__dirname, 'chats', '.chat_history.json');

const MAX_HISTORY = 3;

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
        if (fs.existsSync(HISTORY_FILE)) {
            const data = fs.readFileSync(HISTORY_FILE, 'utf8');
            const history = JSON.parse(data) as HistoryEntry[];

            // 检查最早的记录是否超过2小时
            const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
            const validHistory = history.filter(entry =>
                entry.timestamp && entry.timestamp > twoHoursAgo
            );

            // 如果有过期的记录，立即更新文件
            if (validHistory.length < history.length) {
                saveHistory(validHistory as OpenAI.Chat.ChatCompletionMessageParam[]);
            }

            return validHistory.slice(-MAX_HISTORY);
        }
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
            if (completion.controller.signal.aborted) {
                console.log('Stream processing aborted!');
                return;
            }


            const content = chunk.choices[0]?.delta?.content;
            if (isHeader && content !== '\n') {
                isHeader = false;
            }
            if (!isHeader && content) {
                process.stdout.write(content);
                !isHeader && content && callback(content);
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

        // 添加用户新消息到历史记录（添加时间戳）
        messageHistory.push({
            role: 'user',
            content: params.join(' '),
            timestamp: Date.now()
        });

        // 保持历史记录在最大长度限制内
        if (messageHistory.length > MAX_HISTORY) {
            messageHistory = messageHistory.slice(-MAX_HISTORY);
        }

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                ...messageHistory
            ],
            model: MODEL_MAP[(model as keyof typeof MODEL_MAP)],
            stream: true
        });

        // 保存助手的回复到历史记录（添加时间戳）
        const assistantMessage: HistoryEntry = {
            role: 'assistant' as const,
            content: '',
            timestamp: Date.now()
        };
        messageHistory.push(assistantMessage);

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