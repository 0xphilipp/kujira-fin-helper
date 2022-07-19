import useWallet from "./useWallet";
import kujira from "@util/kujira";
import useSWR from "swr";
import KEY from "./key";
import useContracts from "./useContracts";

const useBalances = () => {
    const {wallet} = useWallet();
    const contracts = useContracts();
    const {data: balances, mutate} = useSWR<Balance[] | undefined>(
        [KEY.BALANCES, wallet],
        () => wallet
            ? kujira.getBalances(wallet, contracts)
            : undefined,
        { revalidateOnFocus: false }
    );
    return {
        balances,
        refreshBalances: () => mutate()
    };
}

export default useBalances;