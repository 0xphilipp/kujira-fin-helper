import useSWR from "swr";
import WalletClient from "../client/wallet-client";
import denoms from '../data/denoms.json';
import {useMemo} from "react";
import useContract from "@hooks/useContract";
import useMarketPrice from "@hooks/useMarketPrice";

const useWalletBalance = (host: string, wallet: string | null) => {
    const {contract, base, quote, setContract} = useContract();
    const {price} = useMarketPrice();
    const { data: balances } = useSWR<Balance[] | undefined>([`/wallets/${wallet}/balances`, wallet],
        () => wallet ? WalletClient.getBalances(host, wallet) : undefined,
        { revalidateOnMount: false, revalidateOnFocus: false, refreshInterval: 5000 }
    );

    const getBalanceByDenom = (denom: string): number => {
        if (!balances) return 0;
        const denomConfig = denoms.filter(d => d.denom === denom)[0];
        if (!denomConfig) return 0;
        return balances
            .filter(b => b.denom === denom)
            .map(b => +(b.amount || 0) / 10 ** denomConfig.decimal)[0];
    }

    const rate = useMemo(() => {
        if (!contract || !price || !base || !quote) return undefined;
        const baseBalance = getBalanceByDenom(base);
        const quoteBalance = getBalanceByDenom(quote);
        const total = baseBalance * price + quoteBalance;
        return baseBalance * price / total;
    }, [contract, price, balances, base, quote]);

    return {
        wallet,
        balances,
        getBalanceByDenom,
        rate,
    }
}

export default useWalletBalance;