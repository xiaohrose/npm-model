interface ModelConfig {
    name: string;
    baseURL: string;
    key: string | undefined;
}
export declare const MODEL_MAP: {
    c: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
    r: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
    chat: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
    reasoner: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
    dou: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
    d: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
    t: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
    tencent: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
    dr: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
    d3: {
        name: string;
        baseURL: string;
        key: string | undefined;
    };
};
export type TModelKey = keyof typeof MODEL_MAP;
export declare function getModelConfig(input?: string): ModelConfig;
export {};
