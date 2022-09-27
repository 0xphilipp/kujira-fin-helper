import {useCallback, useMemo} from "react";
import useSWR from "swr";
import useDenoms from "@hooks/useDenoms";

const useContracts = () => {
    const configPath = 'https://raw.githubusercontent.com/kht2199/kujira-config/main/';
    const {toSymbol} = useDenoms();
    const { data: contracts = [] } = useSWR<Contract[]>(
        ['contract/markets.json'],
            path => fetch(`${configPath}${path}`)
                .then(res => res.json())
    );
    const contractAddressMap = useMemo(() => {
        if (!contracts) return new Map();
        const map = new Map();
        contracts.forEach(c => map.set(c.address, c));
        return map;
    }, [contracts]);
    const getMarket = useCallback((contract: Contract) => {
        return `${toSymbol(contract.denoms.base)}/${toSymbol(contract.denoms.quote)}`
    }, []);
    return {
        contracts,
        getMarket,
        getContractByAddress: (address: string) => {
            return contractAddressMap.get(address);
        },
        getBaseSymbol: (contract: Contract) => {
            return toSymbol(contract.denoms.base)
        },
        getQuoteSymbol: (contract: Contract) => {
            return toSymbol(contract.denoms.quote)
        },
        getMarketByAddress(address: string) {
            const contract = contractAddressMap.get(address);
            if (!contract) return;
            return getMarket(contract);
        },
    }
}

export default useContracts;