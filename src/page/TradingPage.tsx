import {Col, Row} from "antd";
import Markets from "../components/Markets";
import Balances from "../components/content/Balances";
import Orders from "../components/content/Orders";
import React from "react";
import {Route, Routes,} from 'react-router-dom';


const TradingPage = () => {
    return (
        <>
            <Routes>
                <Route path={"/orders"} element={
                    <Row>
                        <Col>
                            <Markets />
                        </Col>
                    </Row>
                }/>
            </Routes>
            <Row justify={'center'}>
                <Col>
                    <Routes>
                        <Route path={"/balances"} element={<Balances />}/>
                        <Route path={"/orders"} element={<Orders />}/>
                    </Routes>
                </Col>
            </Row>
        </>
    );
}

export default TradingPage;