import React, {useEffect, useMemo, useState} from 'react';
import './App.css';
import kujira from "@util/kujira";
import Header from "./components/Header";
import MetaHead from "./components/meta/MetaHead";
import {Col, Row} from "antd";
import Balances from "./components/content/Balances";
import OrderRequest from './components/content/OrderRequest';
import PendingOrders from "./components/content/PendingOrders";
import Orders from "./components/content/Orders";
import Markets from "./components/Markets";
import data from './data/contracts.json';
import {handleErrorNotification} from "@util/utils";

const App = () => {
    const [pendingOrders, setPendingOrders] = useState<OrderRequest[]>([]);
    const contracts = useMemo<Contract[]>(() => data as Contract[], []);
    const [contract, setContract] = useState<Contract>(data[0] as Contract);
    const [wallet, setWallet] = useState<Wallet>();
    const [orders, setOrders] = useState<Order[]>([]);
    const [balances, setBalances] = useState<Balance[]>([]);
    const [changePrice, setChangePrice] = useState<number>(0);
    useEffect(() => {
        if (!wallet) {
            clearAll()
            return;
        }
        onOrdersRefresh().catch(handleErrorNotification);;
        onBalanceRefresh().catch(handleErrorNotification);;
    }, [wallet]);

    useEffect(() => {
        if (!wallet) return;
        onBalanceRefresh().catch(handleErrorNotification);
        onOrdersRefresh().catch(handleErrorNotification);;
    }, [contract]);

    const onOrdersRefresh = () => {
        if (!wallet) return Promise.reject();
        return kujira.getOrders(wallet, contract)
            .then(res => setOrders(res))
            .catch(handleErrorNotification);
    }

    const onBalanceRefresh = async () => {
        if (!wallet || contracts.length === 0) return;
        return kujira.getBalances(wallet, contracts)
            .then(res => setBalances(res))
            .catch(handleErrorNotification);;
    }

    const onConnectWallet = async (chainId: string) => {
        const wallet = await kujira.connectKeplr(chainId);
        setWallet(wallet);
    }

    const onOrderSubmit = async () => {
        if (!wallet || pendingOrders.length === 0) return;
        return kujira.orders(wallet, pendingOrders)
            .then(() => setPendingOrders([]))
            .then(() => onOrdersRefresh())
            .then(() => onBalanceRefresh())
            .catch(handleErrorNotification);
    }

    const onDisconnectWallet = () => setWallet(undefined);

    const clearAll = () => {
        setBalances([]);
        setWallet(undefined);
        setOrders([]);
        setContract(contracts[0]);
        setPendingOrders([]);
    }

    return (
        <div className={'body'}>
            <MetaHead/>
            <Header
                wallet={wallet}
                onDisconnect={onDisconnectWallet}
                onConnect={onConnectWallet}
            />
            <Row>
                <Col>
                    <Markets onChange={(addr) => setContract(contracts.filter(c => c.address === addr)[0])}
                             wallet={wallet}
                             contracts={contracts}
                             contract={contract}
                             balances={balances}
                             onPriceClicked={price => setChangePrice(price)}
                     />
                </Col>
            </Row>
            <Row>
                <Col className={'panel'} flex={'1 250px'}>
                    <Balances balances={balances} onReload={() => onBalanceRefresh() }/>
                </Col>
                <Col className={'panel'} flex={'1 400px'}>
                    <OrderRequest
                        wallet={wallet}
                        contract={contract}
                        balances={balances}
                        onOrderFinished={() => onOrdersRefresh()}
                        addOrders={(orders) => {
                            setPendingOrders((old) => [...old, ...orders]);
                            return Promise.resolve();
                        }}
                        changePrice={changePrice}
                    />
                </Col>
            </Row>
            <Row>
                <Col className={'panel'} flex={1}>
                    <PendingOrders
                        onCancel={uuid => setPendingOrders(old => [...old.filter(o => o.uuid !== uuid)])}
                        pendingOrders={pendingOrders}
                        onOrderSubmit={onOrderSubmit}
                    />
                </Col>
            </Row>
            <Row>
                <Col className={'panel'} flex={1}>
                    <div>
                        <Orders
                            wallet={wallet}
                            orders={orders}
                            contract={contract}
                            onOrderChanged={() => onOrdersRefresh()}/>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default App
