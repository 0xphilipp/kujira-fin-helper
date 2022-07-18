import useSWR from "swr";
import kujira, {toSymbol} from "@util/kujira";
import {useMemo} from "react";

const useMarketPrice = (wallet: Wallet | undefined, contract: Contract) => {

    const {data = {base: [], quote: []}} = useSWR(wallet ? ['/price', contract] : null,
        () => wallet ? kujira.books(wallet, contract, {limit: 1}) : null,
        { refreshInterval: 2500 }
    );

    const defaultReturn = useMemo(() => ({
        base: 0,
        quote: 0,
        baseSymbol: '',
        quoteSymbol: '',
    }), []);

    if (!data || data.base.length === 0 || data.quote.length === 0) {
        return defaultReturn
    }

    return {
        base: +data.base[0].quote_price * 10 ** (contract.decimal_delta || 0),
        quote: +data.quote[0].quote_price * 10 ** (contract.decimal_delta || 0),
        baseSymbol: toSymbol(contract.denoms.base),
        quoteSymbol: toSymbol(contract.denoms.quote),
    }
}

export default useMarketPrice;