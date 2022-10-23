import useSWR from "swr";
import WalletClient from "../client/wallet-client";
import { useMemo } from "react";
import useContract from "@hooks/useContract";
import useMarketPrice from "@hooks/useMarketPrice";
import useDenoms from "@hooks/useDenoms";

const useWalletBalance = (host: string | undefined, wallet: string | null) => {
    const { denomsMap } = useDenoms();
    const { contract, base, quote } = useContract();
    const { price } = useMarketPrice();
    const { data: balances } = useSWR<Balance[] | undefined>([`/wallets/${wallet}/balances`, wallet],
        () => host && wallet ? WalletClient.getBalances(host, wallet) : undefined,
        { revalidateOnMount: false, revalidateOnFocus: false, refreshInterval: 5000 }
    );

    const getBalanceByDenom = (denom: string): number => {
        if (!balances) return 0;
        const denomConfig = denomsMap.get(denom);
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
        return { rate: baseBalance * price / total, baseBalance, quoteBalance, base, quote };
    }, [contract, price, balances, base, quote]);

    return {
        wallet,
        balances,
        getBalanceByDenom,
        rate: rate?.rate,
        baseBalance: rate?.baseBalance,
        quoteBalance: rate?.quoteBalance,
        base: rate?.base,
        quote: rate?.quote
    }
}

export default useWalletBalance;