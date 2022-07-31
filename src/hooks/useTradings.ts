import useSWR from "swr";
import TradingClient from "../client/trading-client";
import useServers from "@hooks/useServers";
import {TradingDto} from "../trading/trading";

const useTradings = () => {
    const {host, connected} = useServers();
    const {data: tradings} = useSWR<TradingDto[]>(['/tradings', connected], () => connected ? TradingClient.getTradings(host) : [],
        { refreshInterval: 5_000, revalidateOnFocus: false, }
    );
    return {
        tradings,
        stop: (uuid: string) => {
            return TradingClient.patchStop(host, uuid)
        },
        resume: (uuid: string) => {
            return TradingClient.patchResume(host, uuid)
        }
    }
}

export default useTradings;