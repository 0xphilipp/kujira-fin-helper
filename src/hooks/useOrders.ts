import useSWR from "swr";
import KEY from "./key";
import kujira from "@util/kujira";
import useWallet from "./useWallet";
import useContract from "./useContract";
import useBalances from "@hooks/useBalances";
import {useEffect, useState} from "react";

const useOrders = () => {
    const [defaultOrders] = useState([]);
    const {contract} = useContract();
    const {wallet} = useWallet();
    const {refreshBalances} = useBalances();
    const isValidState = contract && wallet;
    const {data: orders = defaultOrders, mutate} = useSWR<Order[] | undefined>(isValidState ? KEY.ORDERS : null,
        () => isValidState
            ? kujira.getOrders(wallet, contract)
            : defaultOrders,
        { revalidateOnFocus: false }
    )
    useEffect(() => {
        refreshBalances();
    }, [orders])
    return {
        orders,
        refreshOrders: () => mutate(),
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