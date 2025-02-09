"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_MAP = void 0;
exports.getModelConfig = getModelConfig;
const index_js_1 = require("./util/index.js");
exports.MODEL_MAP = {
    'c': { name: 'deepseek-chat', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    'r': { name: 'deepseek-reasoner', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    'chat': { name: 'deepseek-chat', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    'reasoner': { name: 'deepseek-reasoner', baseURL: 'https://api.deepseek.com', key: process.env.KEY },
    'dou': { name: 'ep-20250124104505-6tsdw', baseURL: 'https://ark.cn-beijing.volces.com/api/v3/', key: process.env.DOU_KEY },
    'd': { name: 'ep-20250124104505-6tsdw', baseURL: 'https://ark.cn-beijing.volces.com/api/v3/', key: process.env.DOU_KEY },
    't': { name: 'hunyuan-turbo', baseURL: 'https://api.hunyuan.cloud.tencent.com/v1', key: process.env.TENCENT_KEY },
    'tencent': { name: 'hunyuan-turbo', baseURL: 'https://api.hunyuan.cloud.tencent.com/v1', key: process.env.TENCENT_KEY },
    'dr': {
        name: 'ep-20250208152602-g7tx9', baseURL: 'https://ark.cn-beijing.volces.com/api/v3', key: process.env.CORDER_KEY
    },
    'd3': {
        name: 'ep-20250208152704-tjht4', baseURL: 'https://ark.cn-beijing.volces.com/api/v3', key: process.env.CORDER_KEY
    }
};
function getModelConfig(input) {
    if (!input)
        return exports.MODEL_MAP[(0, index_js_1.getConfigDefaultModel)()];
    // 首先尝试精确匹配
    if (input in exports.MODEL_MAP) {
        return exports.MODEL_MAP[input];
    }
    // 模糊匹配逻辑
    const possibleKeys = Object.keys(exports.MODEL_MAP).filter(key => key.startsWith(input.trim()) && key !== input);
    // 如果有且只有一个匹配项才返回
    if (possibleKeys.length === 1) {
        return exports.MODEL_MAP[possibleKeys[0]];
    }
    return exports.MODEL_MAP[(0, index_js_1.getConfigDefaultModel)()];
}
