import { OpenAI } from "openai";
interface HistoryEntry {
    role: 'system' | 'user' | 'assistant';
    content: string;
    name?: string;
    timestamp?: number;
}
export declare function loadHistory(): HistoryEntry[];
export declare function saveHistory(history: OpenAI.Chat.ChatCompletionMessageParam[]): void;
export declare function handleStreamResponse(completion: any, callback: (content: string) => void): Promise<void>;
export declare function main(): Promise<void>;
export {};
