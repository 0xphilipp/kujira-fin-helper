import useSWR from "swr";
import KEY from "./key";
import {useMemo} from "react";
import useDenoms from "@hooks/useDenoms";

const useContract = () => {
    const {toSymbol} = useDenoms();
    const {data, mutate} = useSWR<Contract | undefined>(
        KEY.CONTRACT,
        { revalidateOnFocus: false }
    );
    const baseSymbol = useMemo(() => data ? toSymbol(data.denoms.base) : null, [data]);
    const quoteSymbol = useMemo(() => data ? toSymbol(data.denoms.quote) : null, [data]);
    return {
        contract: data,
        setContract: (contract: Contract | undefined) => mutate(contract),
        base: data ? data.denoms.base : undefined,
        quote: data ? data.denoms.quote : undefined,
        baseSymbol, quoteSymbol,
    }
}

export default useContract;