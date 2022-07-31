import useSWR from "swr";
import useServers from "@hooks/useServers";

const useWallets = () => {
    const {host} = useServers();
    const {data} = useSWR<Wallet[]>(['/wallets', host], () => fetch(host + '/wallets')
        .then(res => res.json()),
        { revalidateOnFocus: false });
    if (!data) return {
        wallets: undefined,
    }
    return {
        wallets: data,
    }
}

export default useWallets;