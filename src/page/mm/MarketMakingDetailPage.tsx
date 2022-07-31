import {Button, Col, Form, Input, InputNumber, Row, Space, Tag} from "antd";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {TradingDto} from "../../trading/trading";
import useContracts from "@hooks/useContracts";
import TradingClient from "../../client/trading-client";
import useServers from "@hooks/useServers";
import {handleErrorNotification} from "@util/utils";

const MarketMakingDetailPage = () => {
    let { id } = useParams();
    const {host} = useServers();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [trading, setTrading] = useState<TradingDto>();
    const [rates, setRates] = useState<number[]>([]);
    const [targetRate, setTargetRate] = useState<number>();
    const [contract, setContract] = useState<Contract>();
    const {getMarket, getBaseSymbol, getContractByAddress} = useContracts();
    useEffect(() => {
        if (!id || !host) {
            navigate('/market-making');
            return;
        }
        TradingClient.getTrading(host, id)
            .then((res: TradingDto) => {
                setRates(res.deltaRates);
                setTargetRate(res.targetRate);
                setContract(getContractByAddress(res.contract.address));
                setTrading(res);
            })
            .catch(handleErrorNotification);
    }, []);
    if (!trading || !targetRate || !contract) return <div style={{padding: 10}}>Loading...</div>;
    return (
        <div style={{padding: 10}}>
            <Form
                form={form}
                initialValues={trading}
                style={{padding: 10}}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 16 }}
            >
                <Form.Item label={' '} colon={false}>
                    <Row justify={'end'}>
                        <Col>
                            <Space>
                                <Button type={'primary'} onClick={() => navigate(`/market-making/form/${id}`)}>Modify</Button>
                                <Button onClick={() => navigate('/market-making')}>Cancel</Button>
                            </Space>
                        </Col>
                    </Row>
                </Form.Item>
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
                    <Input disabled />
                </Form.Item>
                <Form.Item
                    label={'Order Minimum'} name={'orderAmountMin'}
                >
                    <InputNumber
                        disabled
                        style={{width: 150}}
                        addonAfter={contract && getBaseSymbol(contract)}
                        controls={false}
                    />
                </Form.Item>
                <Form.Item
                    label={'Target Rate'}
                    help={'If the gap between the two values is large, a lot of sell/buy can occur to close the gap.'}
                >
                    <InputNumber
                        disabled
                        value={targetRate * 100}
                        style={{width: 150}} min={0} max={100} addonAfter={'%'}
                        controls={false}
                    />
                </Form.Item>
                <Form.Item label={'Order Rates'}>
                    <Form.Item>
                        <InputNumber
                            disabled
                            min={-100} step={0.5}
                            defaultValue={0} max={100} style={{textAlign: 'left'}}
                            addonBefore={'ADD'}
                            addonAfter={'%'}
                            precision={1}
                            controls={false}
                        />
                    </Form.Item>
                    <Form.Item>
                        {rates
                            ?.sort((a, b) => a > b ? 1 : -1)
                            ?.map(r => (
                                <Tag key={r}>
                                    {(r * 100).toFixed(1)}%
                                </Tag>
                            ))}
                    </Form.Item>
                </Form.Item>
            </Form>
        </div>
    )
}

export default MarketMakingDetailPage;