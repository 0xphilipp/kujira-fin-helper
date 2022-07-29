import {Button, Col, Form, Input, InputNumber, Row, Select, Space, Tag} from "antd";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {TradingDto} from "../../trading/trading";
import useContracts from "@hooks/useContracts";
import TradingClient from "../../client/trading-client";
import useServers from "@hooks/useServers";
import {handleErrorNotification} from "@util/utils";

const MarketMakingDetailPage = () => {
    let { id } = useParams();
    const {hostMarketMaking} = useServers();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [trading, setTrading] = useState<TradingDto>();
    const [rates, setRates] = useState<number[]>([]);
    const [targetRate, setTargetRate] = useState<number>();
    const [contract, setContract] = useState<Contract>();
    const {getMarket, getBaseSymbol, getContractByAddress} = useContracts();
    useEffect(() => {
        if (!id || !hostMarketMaking) {
            navigate('/market-making');
            return;
        }
        TradingClient.getTrading(hostMarketMaking, id)
            .then((res: TradingDto) => {
                setRates(res.deltaRates);
                setTargetRate(res.targetRate);
                setContract(getContractByAddress(res.contract.address));
                setTrading(res);
            })
            .catch(handleErrorNotification)
    }, []);
    const onModify = async () => {
        const values: TradingDto = await form.validateFields();
        values.targetRate = targetRate;
        values.deltaRates = rates;
        TradingClient.postTrading(hostMarketMaking, values)
            .then(() => navigate('/market-making'))
            .catch(handleErrorNotification);
    }
    if (!trading || !targetRate || !trading.balanceRate || !contract) return <div style={{padding: 10}}>Loading...</div>;
    return (
        <div style={{padding: 10}}>
            <Form
                form={form}
                initialValues={trading}
                style={{padding: 10}}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
            >
                <Form.Item label={'ID'} name={'uuid'} >
                    <Input disabled />
                </Form.Item>
                <Form.Item label={'exchange'} >
                    <Input disabled value={'FIN'} />
                </Form.Item>
                <Form.Item label={'market'} >
                    <Input disabled value={getMarket(contract)} />
                </Form.Item>
                <Form.Item label={'state'} name={'state'}>
                    <Select>
                        <Select.Option value={'INITIALIZE'}>INITIALIZE</Select.Option>
                        <Select.Option value={'ORDER'}>ORDER</Select.Option>
                        <Select.Option disabled value={'ORDER_PREPARED'}>ORDER_PREPARED</Select.Option>
                        <Select.Option disabled value={'ORDER_EMPTY_SIDE_WITH_GAP'}>ORDER_EMPTY_SIDE_WITH_GAP</Select.Option>
                        <Select.Option value={'CLOSE_ORDERS'}>CLOSE_ORDERS</Select.Option>
                        <Select.Option disabled value={'ORDER_CHECK'}>ORDER_CHECK</Select.Option>
                        <Select.Option value={'STOP'}>STOP</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label={'Order Minimum'} name={'orderAmountMin'}
                    rules={[{
                        validator(rule, value) {
                            if (value < 0) return Promise.reject();
                            return Promise.resolve()
                        },
                        message: 'amount must bigger than 0',
                    }]}
                >
                    <InputNumber
                        style={{width: 150}}
                        addonAfter={contract && getBaseSymbol(contract)}
                        controls={false}
                    />
                </Form.Item>
                <Form.Item
                    label={'Target Rate'}
                    validateStatus={Math.abs(trading.balanceRate - +targetRate) > 0.02 ? 'warning' : undefined}
                    help={'If the gap between the two values is large, a lot of sell/buy can occur to close the gap.'}
                    extra={trading.balanceRate && <div>Current Balance Rate is {(trading.balanceRate * 100).toFixed(5)}</div>}
                >
                    <InputNumber
                        value={targetRate * 100}
                        onChange={v => setTargetRate(v / 100)}
                        style={{width: 150}} min={0} max={100} addonAfter={'%'}
                        controls={false}
                    />
                </Form.Item>
                <Form.Item label={'Order Rates'} extra={<Button onClick={() => setRates(trading?.deltaRates)}>Reset</Button>}>
                    <Form.Item>
                        <InputNumber
                            min={-100} step={0.5}
                            defaultValue={0} max={100} style={{textAlign: 'left'}}
                            addonBefore={'ADD'}
                            addonAfter={'%'}
                            precision={1}
                            controls={false}
                            onPressEnter={v => {
                                const rate: number = +(+v.target.value / 100).toFixed(3);
                                if (!rate) return;
                                if (rate <= -1 || rate >= 1) return;
                                setRates(rates => rates ? [rate, ...rates?.filter(r => r !== rate)] : [rate])
                            }}
                        />
                    </Form.Item>
                    <Form.Item>
                        {rates
                            ?.sort((a, b) => a > b ? 1 : -1)
                            ?.map(r => (
                                <Tag
                                    key={r}
                                    closable
                                    onClose={() => setRates(rates => rates?.filter(rate => rate !== r))}
                                >
                                    {(r * 100).toFixed(1)}%
                                </Tag>
                            ))}
                    </Form.Item>
                </Form.Item>
                <Form.Item label={' '} colon={false}>
                    <Space>
                        <Button type={'primary'} onClick={() => onModify()}>Modify</Button>
                        <Button onClick={() => navigate('/market-making')}>Cancel</Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    )
}

export default MarketMakingDetailPage;