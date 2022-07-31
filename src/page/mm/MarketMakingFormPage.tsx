import {Button, Col, Form, Input, InputNumber, Row, Select, Space, Tag} from "antd";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {TradingAddDto, TradingDto} from "../../trading/trading";
import useContracts from "@hooks/useContracts";
import TradingClient from "../../client/trading-client";
import useServers from "@hooks/useServers";
import {handleErrorNotification, handleResponseErrorNotification} from "@util/utils";
import useWalletBalance from "@hooks/useWalletBalance";
import useContract from "@hooks/useContract";

const MarketMakingFormPage = () => {
    const { id } = useParams();
    const { host } = useServers();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [searchParams] = useSearchParams();
    const account = useMemo(() => searchParams.get('account'), [searchParams]);
    const page = useMemo<'Add' | 'Modify'>(() => id ? 'Modify' : 'Add', []);
    const { contract, setContract } = useContract();
    const [rates, setRates] = useState<number[]>([]);
    const [targetRate, setTargetRate] = useState<number>();
    const {rate} = useWalletBalance(host, account);
    const {contracts, getMarket, getBaseSymbol, getContractByAddress} = useContracts();
    useEffect(() => {
        if (!host || !account) {
            navigate('/market-making');
            return;
        }
        if (page === "Add") {
            setContract(contracts[0])
        } else if (id) {
            TradingClient.getTrading(host, id)
                .then((res: TradingDto) => {
                    setRates(res.deltaRates);
                    setTargetRate(res.targetRate);
                    setContract(getContractByAddress(res.contract.address));
                    form.setFieldsValue(res);
                })
                .catch(handleErrorNotification)
        } else {
            navigate('/market-making');
        }
    }, []);
    useEffect(() => {
        if (rate && !targetRate) {
            form.setFieldsValue({
                targetRate: +(rate * 100).toFixed(5),
            })
        }
    }, [rate]);
    const onSave = async () => {
        const values = await form.validateFields();
        const dto: TradingAddDto = {
            account: values.account,
            deltaRates: rates,
            targetRate: targetRate,
            contract: values.contract.address,
            orderAmountMin: values.orderAmountMin,
        };
        (page === 'Modify' && id
            ? TradingClient.postTrading(host, id, dto)
            : TradingClient.putTrading(host, dto))
            .then(handleResponseErrorNotification)
            .then(() => navigate('/market-making'))
            .catch(handleErrorNotification);
    }
    return (
        <div style={{padding: 10}}>
            <Form
                form={form}
                style={{padding: 10}}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
            >
                <Form.Item label={' '} colon={false}>
                    <Row justify={'end'}>
                        <Col>
                            <Space>
                                <Button type={'primary'} onClick={() => onSave()}>{page}</Button>
                                <Button onClick={() => navigate('/market-making')}>Cancel</Button>
                            </Space>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item label={'exchange'} >
                    <Input disabled value={'FIN'} />
                </Form.Item>
                <Form.Item label={'wallet'} name={'account'} initialValue={account}>
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label={'market'} name={['contract', 'address']}
                    initialValue={contracts[0].address}
                >
                    <Select
                        onChange={address => {
                            const contract = getContractByAddress(address);
                            setContract(contract);
                        }}
                        disabled={page === 'Modify'}
                    >
                        {contracts.map(c => (
                            <Select.Option key={c.address} value={c.address}>{getMarket(c)}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label={'Order Minimum'} name={'orderAmountMin'}
                    initialValue={0}
                    rules={[{
                        validator(rule, value) {
                            if (value < 0) return Promise.reject();
                            return Promise.resolve()
                        },
                        message: 'amount must bigger than 0',
                    }]}
                >
                    <InputNumber
                        min={0}
                        style={{width: 150}}
                        addonAfter={contract && getBaseSymbol(contract)}
                        controls={false}
                    />
                </Form.Item>
                <Form.Item
                    label={'Target Rate'}
                    validateStatus={rate && targetRate && Math.abs(rate - targetRate) > 0.02 ? 'warning' : undefined}
                    help={`If the gap between the two values is large, a lot of sell/buy can occur to close the gap.`}
                    extra={contract && rate && <div>Current Balance Rate is <Button style={{padding: 0}} type={'link'} onClick={() => setTargetRate(rate)}>{(rate * 100).toFixed(5)}%</Button></div>}
                >
                    <InputNumber
                        style={{width: 150}} min={0} max={100} addonAfter={'%'}
                        onChange={v => setTargetRate(+(v / 100).toFixed(5))}
                        value={+((targetRate || 0) * 100).toFixed(5)}
                        controls={false}
                    />
                </Form.Item>
                <Form.Item label={'Order Rates'}>
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
                                if (isNaN(rate)) return;
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
            </Form>
        </div>
    )
}

export default MarketMakingFormPage;