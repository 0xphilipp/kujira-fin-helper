import {Button, Form, Input, Table} from "antd";
import LongText from "../components/LongText";
import useSWR from "swr";
import {useNavigate} from "react-router-dom";
import useContracts from "@hooks/useContracts";
import {TradingDto} from "../trading/trading";
import TradingClient from "../client/trading-client";
import {useState} from "react";
import useServers from "@hooks/useServers";
import {handleErrorNotification} from "@util/utils";
import {TradingState} from "../trading/trading-state";

const MarketMakingPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const {hostMarketMaking, mutate} = useServers();
    const [connected, setConnected] = useState<boolean>(!!hostMarketMaking);
    const {getMarketByAddress, getBaseSymbol, getContractByAddress} = useContracts();
    const {data: tradings} = useSWR(['/tradings', connected], () => connected ? TradingClient.getTradings(hostMarketMaking) : [],
        { refreshInterval: 2000, revalidateOnFocus: false, }
    );
    const onConnectServer = async () => {
        const {server} = await form.validateFields();
        TradingClient.getInfo(server)
            .then(() => setConnected(true))
            .then(() => mutate(server))
            .catch(handleErrorNotification);
    }
    const onStateChange = (row: TradingDto, state: TradingState) => {
        if (!hostMarketMaking) return;
        if (state === TradingState.STOP) {
            TradingClient.patchStop(hostMarketMaking, row.uuid)
                .catch(handleErrorNotification);
        } else if (state === TradingState.INITIALIZE) {
            TradingClient.patchResume(hostMarketMaking, row.uuid)
                .catch(handleErrorNotification);
        }
    }
    return (
        <div style={{padding: 10}}>
            <Form form={form}
                  labelCol={{span: 4}}
                  wrapperCol={{span: 12}}
                  colon={false}
            >
                <Form.Item
                    name={'server'}
                    label={'Connect Server'}
                    initialValue={hostMarketMaking || 'http://localhost:3000'}
                    rules={[{
                        required: true,
                        validator(rule, value) {
                            return /^((http|https?:\/\/)|(www.))(?:([a-zA-Z]+)|(\d+\.\d+.\d+.\d+)):\d{4}$/.test(value) ? Promise.resolve() : Promise.reject()
                        }
                    }]}
                >
                    <Input type={'url'} disabled={connected}/>
                </Form.Item>
                <Form.Item label={' '}>
                    <Button disabled={connected} onClick={() => onConnectServer()}>Connect</Button>
                </Form.Item>
            </Form>
            {tradings &&
                <Table
                    rowKey={'uuid'}
                    size={'small'}
                    pagination={false}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick() {
                                navigate(`/market-making/${record.uuid}`)
                            }
                        }
                    }}
                    columns={[
                        {
                            title: 'ID',
                            dataIndex: 'uuid',
                        },
                        {
                            title: 'Address',
                            dataIndex: ['wallet', 'account', 'address'],
                            render: address => <LongText text={address} width={100} placement={'bottomLeft'} />,
                        }, {
                            title: 'Market',
                            width: 100,
                            dataIndex: ['contract', 'address'],
                            render: (address: string) => getMarketByAddress(address),
                        }, {
                            title: 'state',
                            dataIndex: 'state',
                        }, {
                            title: 'Order Min',
                            render(row: TradingDto) {
                                return `${row.orderAmountMin} ${getBaseSymbol(getContractByAddress(row.contract.address))}`
                            }
                        }, {
                            title: 'Target Rate (%)',
                            dataIndex: 'targetRate',
                            render(r: string) {
                                return `${(+r * 100).toFixed(5)}`;
                            }
                        }, {
                            title: 'Rates (%)',
                            dataIndex: 'deltaRates',
                            render(row: string[]) {
                                return <div style={{width: 200}}>{row.map(r => (+r * 100).toFixed(1)).join(',')}</div>
                            },
                        }, {
                            title: 'Actions',
                            render: (row) => (
                                <Button
                                    style={{width: 80}}
                                    type={'primary'}
                                    danger={row.state !== TradingState.STOP}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation()
                                        onStateChange(row, row.state === TradingState.STOP ? TradingState.INITIALIZE : TradingState.STOP);
                                    }}>
                                    {row.state === TradingState.STOP ? 'Resume' : 'Stop'}
                                </Button>
                            )
                        }
                    ]}
                    dataSource={tradings}
                />
            }
        </div>
    )
}

export default MarketMakingPage;