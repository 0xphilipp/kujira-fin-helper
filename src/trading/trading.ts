import {TradingBalance} from "./trading-balance";
import {TradingState} from "./trading-state";

export interface TradingDto {
    uuid: string;
    state: TradingState;
    balance: TradingBalance;
    balanceRate: number | undefined;
    wallet: Wallet;
    contract: Contract;
    deltaRates: number[];
    targetRate: number | undefined;
    orderAmountMin: number;
}
