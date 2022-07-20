import useSWR from "swr";
import KEY from "@hooks/key";
import {handleErrorNotification} from "@util/utils";
import useWallet from "@hooks/useWallet";
import useContract from "@hooks/useContract";
import kujira from "@util/kujira";
import useBalances from "@hooks/useBalances";
import {useMemo} from "react";

const useOrderRequest = () => {
    const {wallet} = useWallet();
    const {refreshBalances} = useBalances();
    const {contract, baseSymbol, quoteSymbol} = useContract();
    const {data: price = 0, mutate: mutatePrice} = useSWR<number>(
        KEY.ORDER_REQUEST_PRICE,
        { revalidateOnMount: false, revalidateOnFocus: false}
    )
    const {data: orders = [], mutate} = useSWR<OrderRequest[]>(
        KEY.PENDING_ORDERS,
        { revalidateOnMount: false, revalidateOnFocus: false})
    const totalRequiredAmount: {[denom: string]: number} = useMemo(() => {
        if (!baseSymbol || !quoteSymbol) return {};
        return orders
            .reduce((acc, o) => {
                const denom = o.side === 'Buy' ? quoteSymbol : baseSymbol;
                acc[denom] += o.amount;
                return acc;
            }, {
                [baseSymbol]: 0,
                [quoteSymbol]: 0,
            });
    }, [orders]);
    return {
        price, changePrice: (price: number) => mutatePrice(price),
        orders,
        async addOrders(newOrders: OrderRequest[]) {
            if (!contract) return;
            mutate([...orders, ...newOrders])
        },
        async postOrder() {
            if (!wallet || orders.length === 0) return;
            kujira.orders(wallet, orders)
                .then(() => mutate([]))
                .then(() => refreshBalances())
                .catch(handleErrorNotification);
        },
        cancelOrder(uuid: string) {
            mutate([...orders.filter(o => o.uuid !== uuid)]);
        },
        totalRequiredAmount,
        clearAll() {
            if (orders.length === 0) return;
            mutate([]);
        },
    }
}

export default useOrderRequest;