import {Button, Card, Checkbox, Col, Descriptions, Form, InputNumber, Row, Tabs} from "antd";
import {useEffect, useMemo, useState} from "react";
import {v4 as uuidv4} from 'uuid';
import {toSymbol} from "@util/kujira";
import useWallet from "@hooks/useWallet";
import useBalances from "@hooks/useBalances";
import useContract from "@hooks/useContract";
import useOrderRequest from "@hooks/useOrderRequest";
import {handleErrorNotification} from "@util/utils";

interface OrderRequestProps {}

const OrderRequest = ({}: OrderRequestProps) => {
    const {contract} = useContract();
    const {wallet} = useWallet();
    const {balances} = useBalances();
    const [form] = Form.useForm();
    const [formOption] = Form.useForm();
    const [simulationState, changeSimulationState] = useState({});
    const {addOrders, price} = useOrderRequest();
    const {base, quote, baseSymbol, quoteSymbol} = contract ? {
        base: contract.denoms.base,
        quote: contract.denoms.quote,
        baseSymbol: toSymbol(contract.denoms.base),
        quoteSymbol: toSymbol(contract.denoms.quote),
    } : {baseSymbol: undefined, quoteSymbol: undefined, base: undefined, quote: undefined};
    const [multiple, setMultiple] = useState(false);
    const bals = useMemo(() => {
        if (!balances) return [0, 0];
        return [
            balances.filter(b => b.denom === base)[0]?.amount || 0,
            balances.filter(b => b.denom === quote)[0]?.amount || 0,
        ]
    }, [balances, contract, base, quote]);
    const [tab, setTab] = useState<OrderSide>('Buy');
    useEffect(() => {
        formOption.setFieldsValue({
            step: multiple ? 1 : undefined,
            orders: multiple ? 1 : undefined,
        });
        setSimulationOrders([]);
    }, [multiple])
    useEffect(() => {
        form.setFieldsValue({price});
    }, [price]);
    const onOrder = async () => {
        if (!wallet || !contract || !base) return;
        const values: OrderRequest = await form.validateFields()
        if (multiple) {
            addOrders(simulationOrders.map(o => ({
                uuid: uuidv4(),
                contract: contract,
                side: o.side,
                price: o.price,
                amount: o.amount
            })))
                .catch(handleErrorNotification);
        } else {
            values.contract = contract;
            values.side = tab;
            values.uuid = uuidv4();
            values.price = +values.price;
            values.amount = +values.amount;
            await addOrders([values]);
        }
    }
    const [simulationOrders, setSimulationOrders] = useState<OrderRequestSimulation[]>([]);
    useEffect(() => {
        if (!contract) return;
        const price = form.getFieldValue('price');
        const amount = form.getFieldValue('amount');
        if (!multiple || price === 0) {
            setSimulationOrders([]);
            return;
        }
        formOption.validateFields().then(({step, orders}) => {
            const simulations: OrderRequestSimulation[] = [{price, amount, side: tab}];
            let prevPrice = price;
            for (let i = 1; i < orders; i++) {
                prevPrice += prevPrice * step / 100 * (tab === 'Buy' ? -1 : 1);
                simulations.push({
                    price: prevPrice.toFixed(contract.price_precision.decimal_places),
                    amount: amount || 0,
                    side: tab
                });
            }
            setSimulationOrders(simulations);
        })
    }, [simulationState])
    return (
        <div>
            <Tabs activeKey={tab} onChange={t => {
                setTab(t as any);
                changeSimulationState({});
            }}>
                <Tabs.TabPane tab={'Buy'} key={'Buy'}/>
                <Tabs.TabPane tab={'Sell'} key={'Sell'}/>
            </Tabs>
            <Row gutter={[8, 8]}>
                <Col span={24}>
                    <Form
                        form={form}
                        colon={false}
                    >
                        <Form.Item name={'price'} initialValue={price}>
                            <InputNumber
                                addonBefore={<div style={{width: 50}}>Price</div>}
                                min={0}
                                style={{width: '100%'}}
                                addonAfter={<div style={{width: 55}}>{quoteSymbol}</div>}
                                controls={false}
                                onChange={() => changeSimulationState({})}
                                step={10 ** (-1 * (contract?.price_precision.decimal_places || 3))}
                            />
                        </Form.Item>
                        <Form.Item name={'amount'} initialValue={0}
                                   rules={[
                                       {
                                           required: true,
                                           message: 'amount must greater than 0',
                                           validator: (_, v) => v <= 0 ? Promise.reject() : Promise.resolve()
                                       }
                                   ]}
                        >
                            <InputNumber
                                addonBefore={<div style={{width: 50}}>Amount</div>}
                                min={0}
                                style={{width: '100%'}}
                                addonAfter={<div style={{width: 55}}>{tab === 'Buy' ? quoteSymbol : baseSymbol}</div>}
                                controls={false}
                                onChange={() => changeSimulationState({})}
                            />
                        </Form.Item>
                    </Form>
                </Col>
                <Col span={24}>
                    <Row justify={"space-between"}>
                        <Col>Available</Col>
                        <Col>
                            {tab === 'Buy'
                                ? quoteSymbol ? `${bals[1]} ${quoteSymbol}` : null
                                : baseSymbol ? `${bals[0]} ${baseSymbol}` : null
                            }
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Card bodyStyle={{padding: 8}}>
                        <Form layout={'inline'} form={formOption}>
                            <Form.Item label={'Multiple'}>
                                <Checkbox checked={multiple} onChange={() => setMultiple(!multiple)}/>
                            </Form.Item>
                            <Form.Item
                                label={'Price Step'}
                                name={'step'}
                                style={{width: 170}}
                            >
                                <InputNumber
                                    className={'input-number-no-handler'}
                                    addonAfter={'%'}
                                    min={0.1} max={10} step={0.1}
                                    disabled={!multiple}
                                    onChange={() => changeSimulationState({})}
                                />
                            </Form.Item>
                            <Form.Item
                                label={'Total'}
                                name={'orders'}
                                style={{width: 160}}
                            >
                                <InputNumber
                                    className={'input-number-no-handler'}
                                    addonAfter={'Orders'}
                                    min={1} max={50} step={1}
                                    disabled={!multiple}
                                    onChange={() => changeSimulationState({})}
                                />
                            </Form.Item>
                        </Form>
                        {simulationOrders.length > 0 && <Card bodyStyle={{padding: 4, overflow: 'scroll'}}>
                            <Descriptions>
                                <Descriptions.Item>
                                    {simulationOrders.map(o => `${o.price}(${o.amount})`).join(', ')}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>}
                    </Card>
                </Col>
                <Col span={24}>
                    <Button
                        className={tab === 'Buy' ? 'buttonBuy' : 'buttonSell'}
                        onClick={() => onOrder()}>
                        {tab}
                    </Button>
                </Col>
            </Row>
        </div>
    )
}

export default OrderRequest;