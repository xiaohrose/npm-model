import { getConfigDefaultModel, getConfigModels } from './util'
import { IModelConfig, TModelKey } from '@/types'

export const MODEL_MAP = getConfigModels();
export function getModelConfig(input?: string): IModelConfig {

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
