import useSWR from "swr";
import kujira, {toSymbol} from "@util/kujira";
import {useMemo} from "react";
import useContract from "./useContract";
import {handleErrorNotification} from "@util/utils";

const useMarketPrice = () => {
    const {contract} = useContract();
    const {data = {base: [], quote: []}} = useSWR(
        [contract ? `/price/${contract.address}` : undefined, contract],
        () => contract ? kujira.books(contract).catch(handleErrorNotification) : undefined,
        { refreshInterval: 5000, revalidateOnFocus: false }
    );
    const defaultReturn = useMemo(() => ({
        base: 0,
        quote: 0,
        baseSymbol: '',
        quoteSymbol: '',
        price: 0,
    }), []);

    if (!contract || !data || data.base.length === 0 || data.quote.length === 0) {
        return defaultReturn
    }

    const base = +data.base[0].quote_price * 10 ** (contract.decimal_delta || 0);
    const quote = +data.quote[0].quote_price * 10 ** (contract.decimal_delta || 0);

    return {
        base,
        quote,
        baseSymbol: toSymbol(contract.denoms.base),
        quoteSymbol: toSymbol(contract.denoms.quote),
        price: (base + quote) / 2,
    }
}

export default useMarketPrice;