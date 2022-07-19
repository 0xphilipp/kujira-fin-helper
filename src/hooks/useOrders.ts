import useSWR from "swr";
import KEY from "./key";
import kujira from "@util/kujira";
import useWallet from "./useWallet";
import useContract from "./useContract";
import useBalances from "@hooks/useBalances";
import {useEffect} from "react";

const useOrders = () => {
    const {contract} = useContract();
    const {wallet} = useWallet();
    const {refreshBalances} = useBalances();
    const isValidState = contract && wallet;
    const {data: orders, mutate} = useSWR<Order[] | undefined>(isValidState ? KEY.ORDERS : null,
        () => isValidState
            ? kujira.getOrders(wallet, contract)
            : undefined,
        { revalidateOnFocus: false }
    )
    useEffect(() => {
        refreshBalances();
    }, [orders])
    return {
        orders: orders || [],
        refreshOrders: () => mutate(),
        postOrders: (pendingOrders: OrderRequest[]) => {
            if (!wallet) return Promise.reject();
            return kujira.orders(wallet, pendingOrders)
                .then(() => mutate())
        },
        postOrdersWithdraw: async (orders: Order[]) => {
            if (!wallet || !contract) return Promise.reject();
            return kujira.ordersWithdraw(wallet, contract, orders)
                .then(() => mutate())
        },
        postCancelOrder: async (orders: Order[]) => {
            if (!wallet || !contract) return Promise.reject();
            return kujira.ordersCancel(wallet, contract, orders.map(o => `${o.idx}`))
                .then(() => mutate())
        }
    };
}

export default useOrders;