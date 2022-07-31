import useWallet from "./useWallet";
import kujira from "@util/kujira";
import useSWR from "swr";
import KEY from "./key";

const useBalances = () => {
    const {wallet} = useWallet();
    const {data: balances, mutate} = useSWR<Balance[] | undefined>(
        [KEY.BALANCES, wallet],
        () => wallet
            ? kujira.getBalances(wallet)
            : undefined,
        { revalidateOnMount: false, revalidateOnFocus: false }
    );
    return {
        balances,
        getBalanceAmount: (denom: string) => balances && balances.filter(b => b.denom === denom)[0]?.amount || 0,
        refreshBalances: () => mutate()
    };
}

export default useBalances;