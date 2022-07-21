import kujira from "@util/kujira";
import useSWR from "swr";
import KEY from "./key";
import useContract from "./useContract";
import useContracts from "./useContracts";
import useChainId from "./useChainId";
import {useEffect} from "react";

const useWallet = () => {
    const contracts = useContracts();
    const {setContract} = useContract();
    const {chainId, setChainId} = useChainId();
    const {data: wallet} = useSWR<Wallet | undefined>(
        [KEY.WALLET, chainId],
        () => chainId
            ? kujira.connectKeplr(chainId)
            : undefined,
        { revalidateOnMount: false, revalidateOnFocus: false }
    );

    useEffect(() => {
        if (!wallet) return;
        setContract(contracts[0]);
    }, [wallet])

    return {
        wallet,
        disconnect: async () => {
            setContract(undefined);
            return setChainId(undefined);
        },
        connect: async (newChainId: string) => {
            return setChainId(newChainId);
        },
    }
}

export default useWallet;