interface ModelConfig {
    name: string;
    baseURL: string;
    key: string | undefined;
}
 
const MODEL_MAP = {
    'chat': { name: 'deepseek-chat', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    'reasoner': { name: 'deepseek-reasoner', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    // 'dou': { name: 'ep-20250124104505-6tsdw', baseURL: 'https://ark.cn-beijing.volces.com/api/v3/', key: process.env.DOU_KEY },
    // 'tencent': { name: 'hunyuan-turbo', baseURL: 'https://api.hunyuan.cloud.tencent.com/v1', key: process.env.TENCENT_KEY }
}

export function getModelConfig(input: string) :ModelConfig{
    // 首先尝试精确匹配
    if (input in MODEL_MAP) {
        return MODEL_MAP[input as keyof typeof MODEL_MAP];
    }

    // 模糊匹配逻辑
    const possibleKeys = Object.keys(MODEL_MAP).filter(key => 
        key.startsWith(input.trim()) && key !== input
    );

    // 如果有且只有一个匹配项才返回
    if (possibleKeys.length === 1) {
        return MODEL_MAP[possibleKeys[0] as keyof typeof MODEL_MAP];
    }

    return MODEL_MAP.chat;
}
