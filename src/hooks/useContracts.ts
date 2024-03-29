import { useCallback, useMemo } from "react";
import useDenoms from "@hooks/useDenoms";

export const markets = [
  {
    address:
      "kujira14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sl4e867",
    owner: "kujira1ghmq7k50rwpsnye39aefngd2k7x9kc2hrqq5xd",
    denoms: {
      base: "ukuji",
      quote:
        "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
    },
    price_precision: {
      decimal_places: 3,
    },
    is_bootstrapping: false,
  },
  {
    address:
      "kujira1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrsqq4jjh",
    owner: "kujira1ghmq7k50rwpsnye39aefngd2k7x9kc2hrqq5xd",
    denoms: {
      base: "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7",
      quote:
        "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
    },
    price_precision: {
      decimal_places: 2,
    },
    decimal_delta: 12,
    is_bootstrapping: false,
  },
  {
    address:
      "kujira1xr3rq8yvd7qplsw5yx90ftsr2zdhg4e9z60h5duusgxpv72hud3sl8nek6",
    owner: "kujira1ghmq7k50rwpsnye39aefngd2k7x9kc2hrqq5xd",
    denoms: {
      base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      quote:
        "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
    },
    price_precision: {
      decimal_places: 3,
    },
    decimal_delta: 0,
    is_bootstrapping: false,
  },
  {
    address:
      "kujira1aakfpghcanxtc45gpqlx8j3rq0zcpyf49qmhm9mdjrfx036h4z5sfmexun",
    owner: "kujira1ghmq7k50rwpsnye39aefngd2k7x9kc2hrqq5xd",
    denoms: {
      base: "ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23",
      quote:
        "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
    },
    price_precision: {
      decimal_places: 3,
    },
    decimal_delta: 0,
    is_bootstrapping: false,
  },
  {
    address:
      "kujira1hulx7cgvpfcvg83wk5h96sedqgn72n026w6nl47uht554xhvj9nsra5j5u",
    owner: "kujira1ghmq7k50rwpsnye39aefngd2k7x9kc2hrqq5xd",
    denoms: {
      base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      quote:
        "ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23",
    },
    price_precision: {
      decimal_places: 3,
    },
    decimal_delta: 0,
    is_bootstrapping: false,
  },
  {
    address:
      "kujira18v47nqmhvejx3vc498pantg8vr435xa0rt6x0m6kzhp6yuqmcp8s4x8j2c",
    owner: "kujira1ghmq7k50rwpsnye39aefngd2k7x9kc2hrqq5xd",
    denoms: {
      base: "ukuji",
      quote:
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    },
    price_precision: {
      decimal_places: 3,
    },
    decimal_delta: 0,
    is_bootstrapping: false,
  },
  {
    address:
      "kujira1z7asfxkwv0t863rllul570eh5pf2zk07k3d86ag4vtghaue37l5s9epdvn",
    owner: "kujira1ghmq7k50rwpsnye39aefngd2k7x9kc2hrqq5xd",
    denoms: {
      base: "ibc/EFF323CC632EC4F747C61BCE238A758EFDB7699C3226565F7C20DA06509D59A5",
      quote:
        "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
    },
    price_precision: {
      decimal_places: 3,
    },
    decimal_delta: 0,
    is_bootstrapping: false,
  },
  {
    address:
      "kujira182nff4ttmvshn6yjlqj5czapfcav9434l2qzz8aahf5pxnyd33tsz30aw6",
    owner: "kujira1ghmq7k50rwpsnye39aefngd2k7x9kc2hrqq5xd",
    denoms: {
      base: "ibc/F3AA7EF362EC5E791FE78A0F4CCC69FEE1F9A7485EB1A8CAB3F6601C00522F10",
      quote:
        "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
    },
    price_precision: {
      decimal_places: 3,
    },
    decimal_delta: 12,
    is_bootstrapping: false,
  },
  {
    address:
      "kujira1fkwjqyfdyktgu5f59jpwhvl23zh8aav7f98ml9quly62jx2sehysqa4unf",
    owner: "kujira1ghmq7k50rwpsnye39aefngd2k7x9kc2hrqq5xd",
    denoms: {
      base: "ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5",
      quote:
        "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F",
    },
    price_precision: {
      decimal_places: 3,
    },
    decimal_delta: 0,
    is_bootstrapping: false,
  },
  {
    address:
      "kujira1yum4v0v5l92jkxn8xpn9mjg7wuldk784ctg424ue8gqvdp88qzlqr2qp2j",
    owner: "kujira1tsekaqv9vmem0zwskmf90gpf0twl6k57e8vdnq",
    denoms: {
      base: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      quote:
        "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
    },
    price_precision: {
      decimal_places: 3,
    },
    decimal_delta: 0,
    is_bootstrapping: false,
  },
  {
    address:
      "kujira1uvqk5vj9vn4gjemrp0myz4ku49aaemulgaqw7pfe0nuvfwp3gukq64r3ws",
    owner: "kujira1tsekaqv9vmem0zwskmf90gpf0twl6k57e8vdnq",
    denoms: {
      base: "ibc/F33B313325B1C99B646B1B786F1EA621E3794D787B90C204C30FE1D4D45970AE",

      quote:
        "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
    },
    price_precision: {
      decimal_places: 3,
    },
    decimal_delta: 0,
    is_bootstrapping: true,
  },
];

const useContracts = () => {
  const configPath =
    "https://raw.githubusercontent.com/kht2199/kujira-config/main/";
  const { toSymbol } = useDenoms();
  const { data: contracts = [] } = { data: markets as any[] };

  // useSWR<Contract[]>(
  //     ['contract/markets.json'],
  //         path => fetch(`${configPath}${path}`)
  //             .then(res => res.json())
  // );
  const contractAddressMap = useMemo(() => {
    if (!contracts) return new Map();
    const map = new Map();
    contracts.forEach((c) => map.set(c.address, c));
    return map;
  }, [contracts]);
  const getMarket = useCallback((contract: Contract) => {
    return `${toSymbol(contract.denoms.base)}/${toSymbol(
      contract.denoms.quote
    )}`;
  }, []);
  return {
    contracts,
    getMarket,
    getContractByAddress: (address: string) => {
      return contractAddressMap.get(address);
    },
    getBaseSymbol: (contract: Contract) => {
      return toSymbol(contract.denoms.base);
    },
    getQuoteSymbol: (contract: Contract) => {
      return toSymbol(contract.denoms.quote);
    },
    getMarketByAddress(address: string) {
      const contract = contractAddressMap.get(address);
      if (!contract) return;
      return getMarket(contract);
    },
  };
};

export default useContracts;
