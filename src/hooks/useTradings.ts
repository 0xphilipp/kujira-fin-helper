import useSWR from "swr";
import TradingClient from "../client/trading-client";
import useServers from "@hooks/useServers";
import {TradingDto} from "../trading/trading";

const useTradings = () => {
    const {host, connected} = useServers();
    const {data: tradings, mutate} = useSWR<TradingDto[]>(['/tradings', connected], () => connected ? TradingClient.getTradings(host) : [],
        { refreshInterval: 5_000, revalidateOnFocus: false, }
    );
    return {
        tradings,
        stop: async (uuid: string) => {
            if (!host) return Promise.reject();
            return TradingClient.patchStop(host, uuid)
        },
        resume: async (uuid: string) => {
            if (!host) return Promise.reject();
            return TradingClient.patchResume(host, uuid)
        },
        deleteTrading: async (uuid: string) => {
            if (!host) return Promise.reject();
            return TradingClient.delete(host, uuid)
                .then(() => mutate())
        },
    }
}

export default useTradings;