import useSWR from "swr";

const useServers = () => {
    const {data: host, mutate} = useSWR('/market-making');
    return {
        host,
        mutate,
        connected: !!host,
    }
}

export default useServers;