import {Coin, coins, DeliverTxResponse, GasPrice, MsgSendEncodeObject} from "@cosmjs/stargate";
import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import * as kujiraClient from "kujira.js";
import {FinClient, registry, tx} from "kujira.js";
import {BookResponse} from "kujira.js/lib/cjs/fin";
import {ExecuteResult, SigningCosmWasmClient} from "@cosmjs/cosmwasm-stargate";
import {MsgSend} from "cosmjs-types/cosmos/bank/v1beta1/tx";
import {OrderResponse} from "kujira.js/src/fin";
import {Buffer} from 'buffer';
import contractsJson from 'data/contracts.json'
import denomsJson from 'data/denoms.json';

const contracts = contractsJson as Contract[];

const denoms = new Map();

denomsJson.forEach(d => denoms.set(d.denom, d));

const getDecimalDelta = (contracts: Contract[], denom: string) => denomsJson.filter(c => c.denom === denom)
    .map(c => (+c.decimal || 0))[0] || 0;

const toOrder = (contract: Contract, o: OrderResponse): Order => {
    let state: OrderState = 'Open';
    if (o.filled_amount !== '0' && o.offer_amount !== '0') {
        state = 'Partial';
    } else if (o.filled_amount !== '0' && o.offer_amount === '0') {
        state = 'Closed';
    }
    const decimal_delta = contract.decimal_delta || 0;
    const side = (o.offer_denom as any).native === contract.denoms.base ? 'Sell' : 'Buy';
    const amount_delta = (contract.decimal_delta || 0) + 6;
    return {
        ...o,
        quote_price: `${+o.quote_price * 10 ** decimal_delta}`,
        offer_amount: `${+o.offer_amount / 10 ** amount_delta}`,
        original_offer_amount: `${+o.original_offer_amount / 10 ** amount_delta}`,
        filled_amount: `${+o.filled_amount / 10 ** amount_delta}`,
        state,
        quote: contract.denoms.quote,
        base: contract.denoms.base,
        side,
    };
}

const getEndpoint = (chainId: string): string => {
    switch(chainId.split('-')[0]) {
        case 'kaiyo':
            return "https://rpc.kaiyo.kujira.setten.io";
        case 'harpoon':
            return "https://rpc.harpoon.kujira.app";
            // return "https://test-rpc-kujira.mintthemoon.xyz";
            // return "https://rpc-kujira.whispernode.com/";
        default:
            throw new Error(chainId);
    }
}

async function sign(endpoint: string) {
    const mnemonic = ''
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: 'kujira' });
    const client: SigningCosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
        endpoint,
        signer,
        {
            registry,
            gasPrice: GasPrice.fromString("0.00125ukuji"),
        }
    );
    const accounts = await signer.getAccounts();
    const wallet: Wallet = {
        client, signer, account: accounts[0]
    }
    return wallet;
}

let account: Wallet | null = null;

export const toSymbol = (denom: Denom) => {
    return denoms.get(denom)?.symbol || denom;
}

const kujira = {
    async connect(): Promise<Wallet> {
        if (!account) account = await sign(getEndpoint('harpoon'));
        return account;
    },
    async connectKeplr(chainId: string): Promise<Wallet> {
        await window.keplr.enable(chainId);
        const signer = window.keplr.getOfflineSigner(chainId);
        const accounts = await signer.getAccounts();
        const client: SigningCosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
            getEndpoint(chainId),
            signer,
            {
                registry,
                gasPrice: GasPrice.fromString("0.00125ukuji"),
            }
        );
        return {
            signer: signer,
            account: accounts[0],
            client,
        };
    },
    async getContractConfig(wallet: Wallet): Promise<Contract[]> {
        return wallet.client.getCodes()
            .then(codes => codes.map(code => wallet.client.getContracts(code.id)))
            .then(res => Promise.all(res))
            .then(arrays => arrays.flat())
            .then(addresses =>
                addresses.map(address => wallet.client.queryContractSmart(address, {config: {}})
                    .then(res => ({
                        address,
                        ...res
                    }))
                )
            )
            .then(res => Promise.all(res))
            .then((contracts: any) => contracts.map((contract: any) => ({
                ...contract,
                denoms: {
                    base: contract.denoms[0].native,
                    quote: contract.denoms[1].native,
                }
            })));
    },
    async getFinMarketPrice(contract: Contract): Promise<BookResponse> {
        const query = btoa(JSON.stringify({"book":{"limit":1, "offset":0}}));
        const url = `https://lcd.kaiyo.kujira.setten.io/cosmwasm/wasm/v1/contract/${contract.address}/smart/${query}`;
        return fetch(url)
            .then(res => res.json())
            .then(res => {
                return res.data;
            });
    },
    async books(contract: Contract): Promise<BookResponse> {
        return this.getFinMarketPrice(contract);
    },
    async orders(wallet: Wallet, orders: OrderRequest[]): Promise<DeliverTxResponse> {
        if (orders.length === 0) return Promise.reject('orders empty');
        const {client, account} = wallet;
        const msgs = orders.map(o => {
            const { contract } = o;
            const { denoms, decimal_delta, price_precision: {decimal_places} } = contract;
            const denom = o.side === 'Buy'
                ? denoms.quote
                : denoms.base;
            let price = decimal_delta
                ? (o.price /= 10 ** decimal_delta).toFixed(decimal_delta + decimal_places)
                : o.price.toFixed((decimal_delta || 0) + decimal_places);
            let amount = o.amount * 10 ** 6;
            if (o.side === 'Sell') {
                amount *= 10 ** (decimal_delta || 0);
            }
            const amountString = amount.toFixed(0);
            const data = {
                sender: account.address,
                contract: contract.address,
                msg: Buffer.from(JSON.stringify({submit_order: {price}})),
                funds: coins(amountString, denom),
            };
            return tx.wasm.msgExecuteContract(data);
        });
        return client.signAndBroadcast(account.address, msgs, 'auto');
    },
    async getBalancesByAddress(address: string): Promise<Balance[]> {
        return fetch(`https://lcd.kaiyo.kujira.setten.io/cosmos/bank/v1beta1/balances/${address}`)
            .then(res => res.json())
            .then(res => res.balances.map((coin: Coin) => ({amount: `${+coin.amount / 10 ** getDecimalDelta(contracts, coin.denom)}`, denom: (coin.denom as Denom)})))
    },
    async getBalances(wallet: Wallet): Promise<Balance[]> {
        return this.getBalancesByAddress(wallet.account.address);
    },
    async ordersCancel(wallet: Wallet, contract: Contract, orders: Order[]): Promise<ExecuteResult> {
        const {client, account} = wallet;
        const finClient: FinClient = new FinClient(client, account.address, contract.address);
        return finClient.retractOrders({ orderIdxs: orders.map(o => `${o.idx}`) });
    },
    async getOrders(wallet: Wallet, contract: Contract, orders: Order[] = []): Promise<Order[]> {
        const {client, account} = wallet;
        const finClient: FinClient = new FinClient(client, account.address, contract.address);
        const MAXIMUM_CONTRACT_LIMIT = 31;
        const responses = await finClient.ordersByUser({
            address: account.address,
            limit: MAXIMUM_CONTRACT_LIMIT,
            startAfter: orders.length > 0 ? orders[orders.length - 1].idx : undefined,
        })
            .then(res => res.orders.map(o => toOrder(contract, o)));
        if (responses.length === MAXIMUM_CONTRACT_LIMIT) {
            return this.getOrders(wallet, contract, [...orders, ...responses])
        }
        return [...orders, ...responses];
    },
    async send(wallet: Wallet, sendTo: string, amount: string, denom: string): Promise<DeliverTxResponse> {
        const {client, account} = wallet;
        const msg: MsgSend = MsgSend.fromPartial({
            fromAddress: account.address,
            toAddress: sendTo,
            amount: coins(amount, denom),
        });
        const msgAny: MsgSendEncodeObject = {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: msg,
        };
        return client.signAndBroadcast(account.address, [msgAny], 'auto', '1');
    },
    async ordersWithdraw(wallet: Wallet, contract: Contract, orders: Order[]) {
        const client = new kujiraClient.FinClient(wallet.client, wallet.account.address, contract.address)
        const withdrawOrdersIndexes = orders
            .filter(o => +o.filled_amount)
            .map(o => o.idx);
        return client.withdrawOrders({ orderIdxs: withdrawOrdersIndexes})
    }
};

export default kujira;