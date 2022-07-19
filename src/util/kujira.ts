import {Coin, coins, DeliverTxResponse, GasPrice, MsgSendEncodeObject} from "@cosmjs/stargate";
import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import {FinClient, registry, tx} from "kujira.js";
import {BookResponse} from "kujira.js/lib/cjs/fin";
import {ExecuteResult, SigningCosmWasmClient} from "@cosmjs/cosmwasm-stargate";
import {MsgSend} from "cosmjs-types/cosmos/bank/v1beta1/tx";
import {OrderResponse, Uint128} from "kujira.js/src/fin";
import {Buffer} from 'buffer';
import * as kujiraClient from "kujira.js";

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
    switch (denom) {
        case 'ukuji':
            return 'KUJI';
        case 'factory/kujira1ltvwg69sw3c5z99c6rr08hal7v0kdzfxz07yj5/demo':
            return 'DEMO';
        case 'ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F':
            return 'axlUSDC';
        case 'ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7':
            return 'wETH';
        case 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2':
            return 'ATOM';
        case 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23':
            return 'OSMO';
        case 'ibc/EFF323CC632EC4F747C61BCE238A758EFDB7699C3226565F7C20DA06509D59A5':
            return 'JUNO';
        case 'ibc/F3AA7EF362EC5E791FE78A0F4CCC69FEE1F9A7485EB1A8CAB3F6601C00522F10':
            return 'EVMOS';
        case 'ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5':
            return 'SCRT';
        default:
            return denom;
    }
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
    async books(wallet: Wallet, contract: Contract, {limit, offset = 0}: {limit: number, offset?: number}): Promise<BookResponse> {
        const {account, client} = wallet;
        const finClient: FinClient = new FinClient(client, account.address, contract.address);
        return finClient.book({ limit, offset });
    },
    async orders(wallet: Wallet, orders: OrderRequest[]): Promise<DeliverTxResponse> {
        if (orders.length === 0) return Promise.reject('orders empty');
        const {client, account} = wallet;
        const msgs = orders.map(o => {
            const denom = o.side === 'Buy'
                ? o.contract.denoms.quote
                : o.contract.denoms.base;
            let price = o.contract.decimal_delta
                ? (o.price /= 10 ** o.contract.decimal_delta).toFixed(o.contract.decimal_delta)
                : `${o.price}`;
            let amount = o.amount * 10 ** 6;
            if (o.side === 'Sell') {
                amount *= 10 ** (o.contract.decimal_delta || 0);
            }
            const data = {
                sender: account.address,
                contract: o.contract.address,
                msg: Buffer.from(JSON.stringify({submit_order: {price}})),
                funds: coins(amount, denom),
            };
            return tx.wasm.msgExecuteContract(data);
        });
        return client.signAndBroadcast(account.address, msgs, 'auto');
    },
    async getBalances(wallet: Wallet, contracts: Contract[]): Promise<Balance[]> {
        const {account} = wallet;
        const getDecimalDelta = (denom: string) => contracts.filter(c => c.denoms.base === denom)
            .map(c => (+c.decimal_delta || 0))[0] || 0;
        return fetch(`https://lcd.kaiyo.kujira.setten.io/cosmos/bank/v1beta1/balances/${account.address}`)
            .then(res => res.json())
            .then(res => res.balances.map((coin: Coin) => ({amount: `${+coin.amount / 10 ** (6 + getDecimalDelta(coin.denom))}`, denom: (coin.denom as Denom)})))
    },
    async ordersCancel(wallet: Wallet, contract: Contract, ordersIdx: Uint128[]): Promise<ExecuteResult> {
        const {client, account} = wallet;
        const finClient: FinClient = new FinClient(client, account.address, contract.address);
        return finClient.retractOrders({ orderIdxs: ordersIdx });
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