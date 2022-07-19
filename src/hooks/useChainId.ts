import useSWR from "swr";

const useChainId = () => {
    const {data: chainId, mutate} = useSWR<string | undefined>(
        '/chainId',
        { revalidateOnFocus: false }
    );
    return {
        chainId,
        setChainId: (id: string | undefined) => mutate(id),
    };
}

export default useChainId;