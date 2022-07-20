import React, {useState} from 'react';
import './App.css';
import Header from "./components/Header";
import MetaHead from "./components/meta/MetaHead";
import {Col, Row} from "antd";
import OrderRequest from './components/content/OrderRequest';
import Markets from "./components/Markets";
import Balances from "./components/content/Balances";
import PendingOrders from "./components/content/PendingOrders";
import Orders from "./components/content/Orders";

const App = () => {
    return (
        <div className={'body'}>
            <MetaHead/>
            <Header />
            <Row>
                <Col>
                    <Markets />
                </Col>
            </Row>

            <Row>
                <Col className={'panel'} flex={'1'}>
                    <Balances />
                </Col>
                <Col className={'panel'} flex={'2 350px'}>
                    <OrderRequest />
                </Col>
                <Col className={'panel'} flex={'2 400px'}>
                    <PendingOrders />
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
