import {Col, Row} from "antd";
import Markets from "../components/Markets";
import Balances from "../components/content/Balances";
import OrderRequest from "../components/content/OrderRequest";
import PendingOrders from "../components/content/PendingOrders";
import Orders from "../components/content/Orders";
import React from "react";


const TradingPage = () => {
    return (
        <>
            <Row>
                <Col>
                    <Markets />
                </Col>
            </Row>
            <Row>
                <Col className={'panel'} flex={'1'}>
                    <Balances />
                </Col>
                <Col className={'panel'} flex={'2'}>
                    <OrderRequest />
                </Col>
                <Col className={'panel'} flex={'3'}>
                    <PendingOrders />
                </Col>
            </Row>
            <Row>
                <Col className={'panel'} flex={1}>
                    <Orders />
                </Col>
            </Row>
        </>
    );
}

export default TradingPage;