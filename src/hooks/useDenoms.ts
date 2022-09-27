import useSWR from "swr";
import {useMemo} from "react";

interface DenomJson {
    denom: string;
    symbol: string;
    decimal: number;
}

const useDenoms = () => {
    const configPath = 'https://raw.githubusercontent.com/kht2199/kujira-config/main/';
    const { data: denoms } = useSWR<DenomJson[]>(
        ['denoms.json'],
        path => fetch(`${configPath}${path}`)
            .then(res => res.json())
    );
    const denomsMap = useMemo(() => {
        if (!denoms) return new Map<string, DenomJson>();
        const map = new Map<string, DenomJson>();
        denoms.forEach(d => map.set(d.denom, d));
        return map;
    }, [denoms])
    const toSymbol = (denom: Denom) => {
        if (!denomsMap) return '';
        const dn = denomsMap.get(denom);
        if (dn) {
            return dn.symbol;
        }
        return denom.slice(0, 20) + '...'
    }
    // TODO bind denomsJson type
    const getDecimalDelta = (contracts: Contract[], denom: string) => {
        if (!denoms) return 6;
        return denoms.filter(c => c.denom === denom)
            .map(c => (+c.decimal || 0))[0] || 0
    };
    return {
        denoms,
        denomsMap,
        toSymbol,
        getDecimalDelta,
    };
}

export default useDenoms;
