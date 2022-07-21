import useFirebase from "@hooks/useFirebase";
import useSWR from "swr";
import useWallet from "@hooks/useWallet";
import useContract from "@hooks/useContract";

const useOrderHistory = () => {
    const {wallet} = useWallet();
    const {contract} = useContract();
    // const {addDocuments, getDocuments} = useFirebase();
    const {data: history, mutate} = useSWR(
        wallet && contract ? '/orderHistory' : null,
        // () => contract && wallet
            // ? getDocuments('addresses', wallet.account.address, 'orders')
            //     .catch(e => console.error(e))
            // : undefined,
        { revalidateOnFocus: false, revalidateOnMount: false }
    )
    return {
        history,
        addOrderHistory: async (wallet: Wallet, contract: Contract, orders: OrderHistory[]) => {
            const address = wallet.account.address;
            // return addDocuments(orders, 'addresses', address, 'orders')
            //     .then(() => mutate());
        },
        refreshOrderHistory: () => mutate()
    }
}

export default useOrderHistory;