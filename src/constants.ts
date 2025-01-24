
export const MODEL_MAP = {
    'c': { name: 'deepseek-chat', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    'r': { name: 'deepseek-reasoner', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    'chat': { name: 'deepseek-chat', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    'reasoner': { name: 'deepseek-reasoner', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    'dou': { name: 'ep-20250124104505-6tsdw', baseURL: 'https://ark.cn-beijing.volces.com/api/v3/', key: process.env.DOU_KEY },
    'd': { name: 'ep-20250124104505-6tsdw', baseURL: 'https://ark.cn-beijing.volces.com/api/v3/', key: process.env.DOU_KEY },
    't': { name: 'hunyuan-turbo', baseURL: 'https://api.hunyuan.cloud.tencent.com/v1', key: process.env.TENCENT_KEY },
    'tencent': { name: 'hunyuan-turbo', baseURL: 'https://api.hunyuan.cloud.tencent.com/v1', key: process.env.TENCENT_KEY }
}