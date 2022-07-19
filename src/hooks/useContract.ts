import useSWR from "swr";
import KEY from "./key";

const useContract = () => {
    const {data, mutate} = useSWR<Contract | undefined>(
        KEY.CONTRACT,
        { revalidateOnFocus: false }
    );
    return {
        contract: data,
        setContract: (contract: Contract | undefined) => mutate(contract),
    }
}

export default useContract;