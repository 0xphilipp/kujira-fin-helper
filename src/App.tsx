import React from 'react';
import './App.css';
import Header from "./components/Header";
import MetaHead from "./components/meta/MetaHead";
import {Col, Row} from "antd";
import OrderRequest from './components/content/OrderRequest';
import Markets from "./components/Markets";
import Balances from "./components/content/Balances";
import PendingOrders from "./components/content/PendingOrders";
import Orders from "./components/content/Orders";
import {
    BrowserRouter,
    Route,
    Routes,
} from 'react-router-dom';
import TradingPage from "./page/TradingPage";
import MarketMakingPage from "./page/MarketMakingPage";
import MarketMakingDetailPage from "./page/mm/MarketMakingDetailPage";

const App = () => {
    return (
        <BrowserRouter>
            <div className={'body'}>
                <MetaHead/>
                <Header />
                <Routes>
                    <Route path="/*" element={<TradingPage />}/>
                    <Route path={'/market-making'} element={<MarketMakingPage />} />
                    <Route path={'/market-making/:id'} element={<MarketMakingDetailPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
