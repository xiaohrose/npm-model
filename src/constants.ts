import {getConfigDefaultModel, getConfigModels} from './util'
import {IModelConfig, TModelKey} from '@/types'

// export const MODEL_MAP = {
//     'c': { model: 'deepseek-chat', baseURL: 'https://api.deepseek.com', key: "KEY" },
//     'r': { model: 'deepseek-reasoner', baseURL: 'https://api.deepseek.com', key: "KEY" },
//     'chat': { model: 'deepseek-chat', baseURL: 'https://api.deepseek.com', key: "KEY" },
//     'reasoner': { model: 'deepseek-reasoner', baseURL: 'https://api.deepseek.com', key: "KEY" },
//     'dou': { model: 'ep-20250124104505-6tsdw', baseURL: 'https://ark.cn-beijing.volces.com/api/v3/', key: "DOU_KEY" },
//     'd': { model: 'ep-20250124104505-6tsdw', baseURL: 'https://ark.cn-beijing.volces.com/api/v3/', key: "DOU_KEY" },
//     't': { model: 'hunyuan-turbo', baseURL: 'https://api.hunyuan.cloud.tencent.com/v1', key: "TENCENT_KEY" },
//     'tencent': { model: 'hunyuan-turbo', baseURL: 'https://api.hunyuan.cloud.tencent.com/v1', key: "TENCENT_KEY" },
//     'dr': {
//         model: 'ep-20250208152602-g7tx9', baseURL: 'https://ark.cn-beijing.volces.com/api/v3', key: "CORDER_KEY"
//     },
//     'd3': {
//         model: 'ep-20250208152704-tjht4', baseURL: 'https://ark.cn-beijing.volces.com/api/v3', key: "CORDER_KEY"
//     }
// }

export const MODEL_MAP = getConfigModels();

export function getModelConfig(input?: string) :IModelConfig{

    if (!input) return MODEL_MAP[getConfigDefaultModel() as TModelKey]

    // 首先尝试精确匹配
    if (input in MODEL_MAP) {
        return MODEL_MAP[input as TModelKey];
    }

    // 模糊匹配逻辑
    const possibleKeys = Object.keys(MODEL_MAP).filter(key => 
        key.startsWith(input.trim()) && key !== input
    );

    // 如果有且只有一个匹配项才返回
    if (possibleKeys.length === 1) {
        return MODEL_MAP[possibleKeys[0] as TModelKey];
    }

    return MODEL_MAP[getConfigDefaultModel() as TModelKey];
}
