import contractJson from '../data/contracts.json';
import {toSymbol} from "@util/kujira";
import {useCallback, useMemo} from "react";

const useContracts = () => {
    const contracts = useMemo(() => contractJson as Contract[], []);
    const contractAddressMap = useMemo(() => {
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