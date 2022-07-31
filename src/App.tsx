import React from 'react';
import './App.css';
import Header from "./components/Header";
import MetaHead from "./components/meta/MetaHead";
import {BrowserRouter, Route, Routes,} from 'react-router-dom';
import TradingPage from "./page/TradingPage";
import MarketMakingPage from "./page/MarketMakingPage";
import MarketMakingDetailPage from "./page/mm/MarketMakingDetailPage";
import MarketMakingFormPage from "./page/mm/MarketMakingFormPage";

const App = () => {
    return (
        <BrowserRouter>
            <div className={'body'}>
                <MetaHead/>
                <Header />
                <Routes>
                    <Route path="/*" element={<TradingPage />}/>
                    <Route path={'/market-making'} element={<MarketMakingPage />} />
                    <Route path={'/market-making/form/:id'} element={<MarketMakingFormPage />} />
                    <Route path={'/market-making/form'} element={<MarketMakingFormPage />} />
                    <Route path={'/market-making/:id'} element={<MarketMakingDetailPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
