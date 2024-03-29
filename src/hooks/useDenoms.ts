import { useMemo } from "react";

interface DenomJson {
  denom: string;
  symbol: string;
  decimal: number;
}

export const denomsData = [
  {
    denom:
      "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
    symbol: "wETH",
    decimal: 18,
  },
  {
    denom:
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    symbol: "ATOM",
    decimal: 6,
  },
  {
    denom:
      "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
    symbol: "axlUSDC",
    decimal: 6,
  },
  {
    denom:
      "ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23",
    symbol: "OSMO",
    decimal: 6,
  },
  {
    denom:
      "ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5",
    symbol: "SCRT",
    decimal: 6,
  },
  {
    denom:
      "ibc/DA59C009A0B3B95E0549E6BF7B075C8239285989FF457A8EDDBB56F10B2A6986",
    symbol: "LUNA",
    decimal: 6,
  },
  {
    denom:
      "ibc/EFF323CC632EC4F747C61BCE238A758EFDB7699C3226565F7C20DA06509D59A5",
    symbol: "JUNO",
    decimal: 6,
  },
  {
    denom:
      "ibc/F3AA7EF362EC5E791FE78A0F4CCC69FEE1F9A7485EB1A8CAB3F6601C00522F10",
    symbol: "EVMOS",
    decimal: 18,
  },
  {
    denom: "ukuji",
    symbol: "KUJI",
    decimal: 6,
  },
  {
    denom:
      "ibc/004EBF085BBED1029326D56BE8A2E67C08CECE670A94AC1947DF413EF5130EB2",
    symbol: "wAVAX",
    decimal: 18,
  },
  {
    denom:
      "ibc/3607EB5B5E64DD1C0E12E07F077FF470D5BC4706AFCBC98FE1BA960E5AE4CE07",
    symbol: "CMDX",
    decimal: 6,
  },
  {
    denom:
      "ibc/4F393C3FCA4190C0A6756CE7F6D897D5D1BE57D6CCB80D0BC87393566A7B6602",
    symbol: "STARS",
    decimal: 6,
  },
  {
    denom:
      "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
    symbol: "USK",
    decimal: 6,
  },
  {
    denom:
      "factory/kujira168pnd5cyadhppfxvug4gchd52vuau5vkletxtfld7hdavwtgcu9sjem6z5/bKUJIaxlUSDC",
    symbol: "bKUJIaxlUSDC",
    decimal: 6,
  },
  {
    denom:
      "ibc/8318B7E036E50C0CF799848F23ED84778AAA8749D9C0BCD4FF3F4AF73C53387F",
    symbol: "LOOP",
    decimal: 6,
  },
  {
    denom:
      "ibc/F2331645B9683116188EF36FC04A809C28BD36B54555E8705A37146D0182F045",
    symbol: "axlUSDT",
    decimal: 6,
  },
  {
    denom:
      "ibc/F33B313325B1C99B646B1B786F1EA621E3794D787B90C204C30FE1D4D45970AE",
    symbol: "ampLUNA",
    decimal: 6,
  },
];

const useDenoms = () => {
  const configPath =
    "https://raw.githubusercontent.com/kht2199/kujira-config/main/";
  const { data: denoms } = { data: denomsData as any[] };
  // useSWR<DenomJson[]>(
  //     ['denoms.json'],
  //     path => fetch(`${configPath}${path}`)
  //         .then(res => res.json())
  // );
  const denomsMap = useMemo(() => {
    if (!denoms) return new Map<string, DenomJson>();
    const map = new Map<string, DenomJson>();
    denoms.forEach((d) => map.set(d.denom, d));
    return map;
  }, [denoms]);
  const toSymbol = (denom: Denom) => {
    if (!denomsMap) return "";
    const dn = denomsMap.get(denom);
    if (dn) {
      return dn.symbol;
    }
    return denom.slice(0, 20) + "...";
  };
  // TODO bind denomsJson type
  const getDecimalDelta = (contracts: Contract[], denom: string) => {
    if (!denoms) return 6;
    return (
      denoms.filter((c) => c.denom === denom).map((c) => +c.decimal || 0)[0] ||
      0
    );
  };
  return {
    denoms,
    denomsMap,
    toSymbol,
    getDecimalDelta,
  };
};

export default useDenoms;
