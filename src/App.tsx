import React, {useState} from 'react';
import './App.css';
import Header from "./components/Header";
import MetaHead from "./components/meta/MetaHead";
import {Col, Row} from "antd";
import OrderRequest from './components/content/OrderRequest';
import Markets from "./components/Markets";
import useWallet from "@hooks/useWallet";
import {handleErrorNotification} from "@util/utils";
import Balances from "./components/content/Balances";
import PendingOrders from "./components/content/PendingOrders";
import Orders from "./components/content/Orders";
import useOrders from "@hooks/useOrders";

const App = () => {
    const [pendingOrders, setPendingOrders] = useState<OrderRequest[]>([]);
    const {wallet} = useWallet();
    const {postOrders} = useOrders();
    const [changePrice, setChangePrice] = useState<number>(0);

    const onOrderSubmit = async () => {
        if (!wallet || pendingOrders.length === 0) return;
        postOrders(pendingOrders)
            .then(() => setPendingOrders([]))
            .catch(handleErrorNotification);
    }

    return (
        <div className={'body'}>
            <MetaHead/>
            <Header />
            <Row>
                <Col>
                    <Markets onPriceClicked={price => setChangePrice(price)} />
                </Col>
            </Row>

            <Row>
                <Col className={'panel'} flex={'1 250px'}>
                    <Balances />
                </Col>
                <Col className={'panel'} flex={'1 400px'}>
                    <OrderRequest
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
                        onCancel={(uuid: string) => setPendingOrders(old => [...old.filter(o => o.uuid !== uuid)])}
                        pendingOrders={pendingOrders}
                        onOrderSubmit={onOrderSubmit}
                    />
                </Col>
            </Row>
            <Row>
                <Col className={'panel'} flex={1}>
                    <Orders />
                </Col>
            </Row>
        </div>
    )
}

export default App
