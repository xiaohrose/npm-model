export interface IModelConfig {
    name: string;
    model: string;
    url: string;
    key: string | undefined;
}

export type TModelKey = 'c' | 'r' | 'chat' | 'reasoner' | 'dou' | 'd' | 't' | 'tencent' | 'dr' | 'd3';