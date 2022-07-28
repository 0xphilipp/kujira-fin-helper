import useSWR from "swr";

const useServers = () => {
    const {data: marketMaking, mutate} = useSWR('/market-making');
    return {
        hostMarketMaking: marketMaking,
        mutate,
    }
}

export default useServers;