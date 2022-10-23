import { TradingState } from "./trading-state";

export interface TradingDto {
    uuid?: string;
    state: TradingState;
    wallet: Wallet;
    contract: Contract;
    deltaRates: number[];
    targetRate: number;
    orderAmountMin: number;
    type: TradingType;
    min: number;
    max: number;
}

export enum TradingType {
    default = "default",
    dynamic = "dynamic",
    grid = "grid",
}

export interface TradingAddDto {
    account: string;
    contract: string;
    deltaRates: number[];
    targetRate: number | undefined;
    orderAmountMin: number;
    type: TradingType;
    min: number;
    max: number;
}
