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
                <Col className={'panel'} flex={'1 250px'}>
                    <Balances />
                </Col>
                <Col className={'panel'} flex={'1 400px'}>
                    <OrderRequest />
                </Col>
            </Row>
            <Row>
                <Col className={'panel'} flex={1}>
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
