import kujira from "@util/kujira";
import useSWR from "swr";
import KEY from "./key";
import useContract from "./useContract";
import useContracts from "./useContracts";
import useChainId from "./useChainId";

const useWallet = () => {
    const contracts = useContracts();
    const {setContract} = useContract();
    const {chainId, setChainId} = useChainId();
    const {data: wallet} = useSWR<Wallet | undefined>(
        chainId ? [KEY.WALLET, chainId] : null,
        () => chainId
            ? kujira.connectKeplr(chainId)
            : undefined,
        { revalidateOnFocus: false }
    );

    return {
        wallet,
        disconnect: async () => {
            setContract(undefined);
            return setChainId(undefined);
        },
        connect: async (newChainId: string) => {
            if (!chainId) {
                setContract(contracts[0])
            }
            return setChainId(newChainId);
        },
    }
}

export default useWallet;