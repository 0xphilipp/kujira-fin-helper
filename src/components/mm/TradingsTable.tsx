import {Button, Col, Row, Space, Table} from "antd";
import LongText from "../LongText";
import {TradingDto} from "../../trading/trading";
import {TradingState} from "../../trading/trading-state";
import {useNavigate} from "react-router-dom";
import useContracts from "@hooks/useContracts";
import {handleErrorNotification} from "@util/utils";
import useTradings from "@hooks/useTradings";

const TradingsTable = () => {
    const navigate = useNavigate();
    const {getMarketByAddress, getBaseSymbol, getContractByAddress} = useContracts();
    const {tradings, stop, resume, deleteTrading} = useTradings();
    const onStateChange = (row: TradingDto, stateToStop: boolean) => {
        if (!row.uuid) return;
        if (stateToStop) {
            stop(row.uuid).catch(handleErrorNotification)
        } else {
            resume(row.uuid).catch(handleErrorNotification);
        }
    }
    const onDeleteClicked = (row: TradingDto) => {
        if (!row.uuid) return;
        deleteTrading(row.uuid)
            .catch(handleErrorNotification);
    }
    return (
        <>
            <Row justify={'space-between'}>
                <Col>
                    <h2>Trading</h2>
                </Col>
            </Row>
            <Table
                rowKey={'uuid'}
                size={'small'}
                pagination={false}
                onRow={(record: TradingDto) => ({
                    onClick() {
                        navigate(`/market-making/form/${record.uuid}?account=${record.wallet.account.address}`)
                    }
                })}
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
                            const positives = row.filter(r => +r >= 0);
                            const negatives = row.filter(r => +r < 0)
                            const toDiv = (values: string[]) => <div style={{width: 200}}>{values.map(r => (+r * 100).toFixed(1)).join(' ')}</div>;
                            return (<>
                                {toDiv(negatives)}
                                {toDiv(positives)}
                            </>)
                        },
                    }, {
                        title: 'Actions',
                        fixed: 'right',
                        align: 'center',
                        render: (row: TradingDto) => (
                            <Space>
                                <Button
                                    style={{width: 80}}
                                    type={'primary'}
                                    danger={row.state !== TradingState.STOP}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (row.state === TradingState.CLOSE_FOR_STOP) return;
                                        onStateChange(row, row.state !== TradingState.STOP);
                                    }}>
                                    {
                                        row.state === TradingState.STOP
                                            ? 'Resume' :
                                        row.state === TradingState.CLOSE_FOR_STOP
                                            ? 'Waiting...' : 'Stop'
                                    }
                                </Button>
                                <Button
                                    danger
                                    onClick={e => {
                                        e.stopPropagation();
                                        onDeleteClicked(row);
                                    }}
                                >Delete</Button>
                            </Space>
                        )
                    }
                ]}
                dataSource={tradings}
            />
        </>
    );
}

export default TradingsTable;