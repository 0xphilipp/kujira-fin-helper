import {Button, Col, Row, Table, Tabs} from "antd";
import {useEffect, useMemo, useState} from "react";
import {handleErrorNotification, toDateString} from "@util/utils";
import OrderPrice from "../order/OrderPrice";
import OrderAmount from "../order/OrderAmount";
import useOrders from "@hooks/useOrders";
import useContract from "@hooks/useContract";

interface OrdersProps {
}

const Orders = ({}: OrdersProps) => {
    const {contract} = useContract();
    const {orders, postOrdersWithdraw, postCancelOrder} = useOrders();
    const [tab, setTab] = useState('All')
    const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState(orders);
    const filledOrdersLength = useMemo(() => orders.filter(o => +o.filled_amount > 0).length, [orders]);
    useEffect(() => setSelectedOrders([]), [orders, tab]);

    const counts = useMemo<{Open: number, Partial: number, Closed: number}>(() => ({
        Open: orders.filter(o => o.state === 'Open').length,
        Partial: orders.filter(o => o.state === 'Partial').length,
        Closed: orders.filter(o => o.state === 'Closed').length,
    }), [orders]);

    useEffect(() => {
        setFilteredOrders(tab === 'All' ? orders : orders.filter(o => o.state === tab));
    }, [orders, tab]);

    const onWithdrawClicked = () => {
        postOrdersWithdraw(orders)
            .catch(handleErrorNotification)
    }

    const onCancelClicked = () => {
        postCancelOrder(selectedOrders)
            .catch(handleErrorNotification)
    }

    return (
        <div>
            <Row justify={"space-between"} align={'middle'}>
                <Col>
                    <Tabs defaultActiveKey="All" onChange={tab => setTab(tab)} activeKey={tab}>
                        <Tabs.TabPane tab={`All(${orders.length})`} key="All"/>
                        <Tabs.TabPane tab={`Open${orders.length > 0 ? `(${counts['Open']})` : ''}`} key={'Open'} />
                        <Tabs.TabPane tab={`Partial${orders.length > 0 ? `(${counts['Partial']})` : ''}`} key={'Partial'} />
                        <Tabs.TabPane tab={`Closed${orders.length > 0 ? `(${counts['Closed']})` : ''}`} key={'Closed'} />
                    </Tabs>
                </Col>
                <Col>
                    <Row gutter={8}>
                        <Col>
                            <Button
                                type={filledOrdersLength ? 'primary' : 'default'}
                                onClick={() => filledOrdersLength && onWithdrawClicked()}
                            >
                                Claim All ({filledOrdersLength})
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                type={selectedOrders.length > 0 ? 'primary' : 'default'}
                                onClick={() => selectedOrders.length && onCancelClicked()}
                            >
                                Cancel All ({selectedOrders.length})
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Table
                rowKey={'idx'}
                size={'small'}
                rowSelection={{
                    type: 'checkbox',
                    onChange: (_, keys) => setSelectedOrders(keys),
                    selectedRowKeys: selectedOrders.map(o => o.idx) || []
                }}
                scroll={{y: 500 }}
                pagination={false}
                columns={[
                    {title: 'IDX', render(o: Order) { return o.idx}, width: 100},
                    {title: 'Date', render(o: Order) { return toDateString(o.created_at)}, width: 250},
                    {
                        title: 'Side',
                        width: 100,
                        render(o: Order) { return o.side},
                        filters: [
                            {text: 'Sell', value: 'Sell'},
                            {text: 'Buy', value: 'Buy'},
                        ],
                        onFilter: (value, row) => row.side === value,
                    },
                    {
                        title: 'Price',
                        width: 200,
                        align: 'right',
                        render(o: Order) {
                            return <OrderPrice order={o} />
                        },
                        sorter: (a, b) => +a.quote_price - +b.quote_price,
                    },
                    {
                        title: 'Amount',
                        align: 'right',
                        render(o: Order) {
                            return contract && <OrderAmount amount={+o.original_offer_amount} denom={o.side === 'Buy' ? contract.denoms.quote : contract.denoms.base} />
                        }
                    },
                    {
                        title: 'Unfilled',
                        align: 'right',
                        render(o: Order) {
                            return contract && <OrderAmount amount={+o.offer_amount} denom={o.side === 'Buy' ? contract.denoms.quote : contract.denoms.base} />
                        }
                    },
                    {
                        title: 'Filled',
                        align: 'right',
                        render(o: Order) {
                            return contract && <OrderAmount amount={+o.filled_amount} denom={o.side === 'Buy' ? contract.denoms.base : contract.denoms.quote} />
                        }
                    },
                ]}
                dataSource={filteredOrders}
            />
        </div>
    )
}

export default Orders;
