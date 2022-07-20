import {Button, Card, Checkbox, Col, Descriptions, Divider, Form, InputNumber, Row, Select, Tabs} from "antd";
import {useEffect, useMemo, useState} from "react";
import {v4 as uuidv4} from 'uuid';
import useWallet from "@hooks/useWallet";
import useBalances from "@hooks/useBalances";
import useContract from "@hooks/useContract";
import useOrderRequest from "@hooks/useOrderRequest";
import {handleErrorNotification} from "@util/utils";

interface OrderRequestProps {}

const OrderRequest = ({}: OrderRequestProps) => {
    const {contract, baseSymbol, quoteSymbol, base, quote} = useContract();
    const {wallet} = useWallet();
    const {balances} = useBalances();
    const [form] = Form.useForm();
    const [amount, setAmount] = useState(0);
    const [step, setStep] = useState(1);
    const [orders, setOrders] = useState(1);
    const {addOrders, price, changePrice} = useOrderRequest();
    const [amountOption, setAmountOption] = useState('amount');
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
            values.amount = amountOption === 'amount' ? values.amount : values.amount * values.price;
            await addOrders([values]);
        }
    }
    const [simulationOrders, setSimulationOrders] = useState<OrderRequestSimulation[]>([]);
    useEffect(() => {
        if (!contract) return;
        if (!multiple || price === 0) {
            if (simulationOrders.length !== 0 ) setSimulationOrders([]);
            return;
        }
        const simulations: OrderRequestSimulation[] = [{price, amount: amountOption === 'amount' ? amount : amount * price, side: tab}];
        let prevPrice = price;
        for (let i = 1; i < orders; i++) {
            prevPrice += prevPrice * step / 100 * (tab === 'Buy' ? -1 : 1);
            simulations.push({
                price: +prevPrice.toFixed(contract.price_precision.decimal_places),
                amount: amountOption === 'amount' ? amount : amount * price,
                side: tab
            });
        }
        setSimulationOrders(simulations);
    }, [wallet, multiple, price, amount, tab, orders, step, amountOption])
    return (
        <div>
            <Tabs activeKey={tab} onChange={t => {
                setTab(t as any);
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
                                onChange={price => changePrice(price)}
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
                                addonBefore={<Select style={{width: 110}} value={amountOption} onChange={o => setAmountOption(o)}>
                                    <Select.Option value={'amount'}>Amount</Select.Option>
                                    <Select.Option value={'estm'}>Estimated</Select.Option>
                                </Select>}
                                min={0}
                                style={{width: '100%'}}
                                addonAfter={(
                                    <div style={{width: 55}}>
                                        {tab === 'Buy'
                                            ? (amountOption === 'amount' ? quoteSymbol : baseSymbol)
                                            : (amountOption === 'amount' ? baseSymbol : quoteSymbol)
                                        }
                                    </div>
                                )}
                                controls={false}
                                onChange={value => setAmount(value)}
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
                        <Form layout={'inline'}>
                            <Form.Item label={'Multiple'}>
                                <Checkbox checked={multiple} onChange={() => setMultiple(!multiple)}/>
                            </Form.Item>
                            <Form.Item
                                label={'Price Step'}
                                name={'step'}
                                style={{width: 170}}
                                initialValue={step}
                            >
                                <InputNumber
                                    className={'input-number-no-handler'}
                                    addonAfter={'%'}
                                    min={0.1} max={10} step={0.1}
                                    disabled={!multiple}
                                    onChange={step => setStep(step)}
                                />
                            </Form.Item>
                            <Form.Item
                                label={'Total'}
                                name={'orders'}
                                style={{width: 160}}
                                initialValue={orders}
                            >
                                <InputNumber
                                    className={'input-number-no-handler'}
                                    addonAfter={'Orders'}
                                    min={1} max={50} step={1}
                                    disabled={!multiple}
                                    onChange={orders => setOrders(orders)}
                                />
                            </Form.Item>
                        </Form>
                        <Divider style={{margin: 10}} />
                        {simulationOrders.length > 0 &&
                            <Descriptions style={{overflow: 'scroll'}}>
                                <Descriptions.Item>
                                    {simulationOrders.map(o => `${o.price}(${o.amount}${quoteSymbol})`).join(', ')}
                                </Descriptions.Item>
                            </Descriptions>
                        }
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