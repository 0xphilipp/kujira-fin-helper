import useSWR from "swr";
import kujira, {toSymbol} from "@util/kujira";
import {useMemo} from "react";
import useContract from "./useContract";

const useMarketPrice = (wallet: Wallet | undefined) => {

    const {contract} = useContract();

    const {data = {base: [], quote: []}} = useSWR(wallet && contract ? `/price/${contract}` : null,
        () => wallet && contract ? kujira.books(wallet, contract, {limit: 1}) : undefined,
        { refreshInterval: 2500, revalidateOnFocus: false }
    );

    const defaultReturn = useMemo(() => ({
        base: 0,
        quote: 0,
        baseSymbol: '',
        quoteSymbol: '',
    }), []);

    if (!contract || !data || data.base.length === 0 || data.quote.length === 0) {
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