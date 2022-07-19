import {toSymbol} from "@util/kujira";
import {Button, Col, Row, Select} from "antd";
import React, {useEffect, useMemo, useState} from "react";
import useMarketPrice from "../hooks/useMarketPrice";

interface MarketsProps {
    contracts: Contract[];
    contract: Contract;
    wallet: Wallet | undefined;
    onChange: (contract: string) => void;
    onPriceClicked: (price: number) => void;
    balances: Balance[];
}

type Market = 'axlUSDC' | 'ATOM' | 'OSMO';

const markets: Market[] = ['axlUSDC', 'ATOM', 'OSMO'];

const Markets = ({wallet, contract, contracts, balances, onChange, onPriceClicked}: MarketsProps) => {
    const [market, setMarket] = useState<Market | undefined>(undefined);
    const filteredContracts = useMemo(() => {
        if (!wallet) return [];
        return contracts.filter(c => toSymbol(c.denoms.quote) === market);
    }, [contracts, wallet, market]);
    const [bals, setBals] = useState<number[]>([]);
    const [average, setAverage] = useState<number>(0);
    const {base, quote, baseSymbol, quoteSymbol} = useMarketPrice(wallet, contract);
    useEffect(() => {
        if (!base || !quote) return;
        setBals([
            +balances.filter(b => b.denom === contract.denoms.base)[0]?.amount || 0,
            +balances.filter(b => b.denom === contract.denoms.quote)[0]?.amount || 0,
        ]);
        setAverage(+((base + quote) / 2).toFixed(+contract.price_precision.decimal_places))
    }, [balances, market, base, quote])
    useEffect(() => {
        if (filteredContracts.length === 0) return;
        onChange(filteredContracts[0].address);
    }, [market]);
    useEffect(() => {
        setMarket(wallet ? 'axlUSDC' : undefined);
        if (filteredContracts.length === 0 || !wallet) {
            return;
        }
        onChange(filteredContracts[0].address);
    }, [wallet])

    if (!wallet) return <div style={{height: '42px'}}/>;

    return (
        <>
            <Row align={'middle'} gutter={16}>
                <Col>
                    <Select value={market} onChange={t => setMarket(t as any)}
                            style={{width: '110px', textAlign: 'right'}}>
                        {wallet && markets.map(m => (
                            <Select.Option key={m} value={m}>{m}</Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col>
                    <Select value={contract.address} onChange={c => onChange(c)}
                            style={{width: '160px', textAlign: 'right'}}>
                        {wallet && filteredContracts.map(c => (
                            <Select.Option
                                key={c.address}
                                value={c.address}
                                style={{textAlign: 'right'}}
                            >{toSymbol(c.denoms.base)} / {toSymbol(c.denoms.quote)}</Select.Option>
                        ))}
                    </Select>
                </Col>
            </Row>
            <Row align={'middle'} gutter={16} style={{margin: "5px 0 5px"}}>
                <Col>
                    Sell <Button style={{padding: 0}} type={'link'} onClick={() => onPriceClicked(base)}>{base}</Button> {quoteSymbol}
                </Col>
                <Col>
                    Buy <Button style={{padding: 0}} type={'link'} onClick={() => onPriceClicked(quote)}>{quote}</Button> {quoteSymbol}
                </Col>
                <Col>
                    Average <Button style={{padding: 0}} type={'link'} onClick={() => onPriceClicked(average)}>{average}</Button> {quoteSymbol}
                </Col>
            </Row>
            <Row align={'middle'} gutter={16} style={{margin: "0 0 5px"}}>
                <Col>
                    Balances {bals[0]} {baseSymbol} / {bals[1]?.toFixed(contract.price_precision.decimal_places)} {quoteSymbol}
                </Col>
                <Col>
                    Ratio({baseSymbol}/TOTAL) {(average * bals[0] / (average * bals[0] + bals[1]) * 100).toFixed(2)}%
                </Col>
            </Row>
        </>
    );
}

export default Markets;