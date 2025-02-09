import { TModelKey } from '../constants.js';
export declare function getConfigDefaultModel(): TModelKey;
export declare function setConfigDefaultModel(model: TModelKey): void;
export declare function setBinCommandName(newName: string): boolean;
declare const _default: {
    getConfigDefaultModel: typeof getConfigDefaultModel;
    setConfigDefaultModel: typeof setConfigDefaultModel;
    setBinCommandName: typeof setBinCommandName;
};
export default _default;
