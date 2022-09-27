import useWallet from "./useWallet";
import kujira from "@util/kujira";
import useSWR from "swr";
import KEY from "./key";
import useDenoms from "@hooks/useDenoms";
import useContracts from "@hooks/useContracts";

const useBalances = () => {
    const {wallet} = useWallet();
    const {contracts} = useContracts();
    const {getDecimalDelta} = useDenoms();
    const {data: balances, mutate} = useSWR<Balance[] | undefined>(
        [KEY.BALANCES, wallet, contracts],
        async () => wallet && contracts
            ? await kujira.getBalances(wallet, contracts, getDecimalDelta)
            : undefined,
        { revalidateOnMount: false, revalidateOnFocus: false }
    );
    return {
        balances,
        refreshBalances: () => mutate()
    };
}

export default useBalances;