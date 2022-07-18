import {Button, Col, Row, Table, Tabs} from "antd";
import {useEffect, useMemo, useState} from "react";
import kujira from "../../util/kujira";
import {toDateString} from "@util/utils";
import OrderPrice from "../order/OrderPrice";
import OrderAmount from "../order/OrderAmount";

interface OrdersProps {
    wallet: Wallet | undefined,
    orders: Order[];
    contract: Contract;
    onOrderChanged: Function;
}

const Orders = ({wallet, orders, contract, onOrderChanged}: OrdersProps) => {

    const [tab, setTab] = useState('All')

    const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

    useEffect(() => setSelectedOrders([]), [orders, tab]);

    const [filteredOrders, setFilteredOrders] = useState(orders);

    const counts = useMemo(() => ({
        Open: orders.filter(o => o.state === 'Open').length,
        Partial: orders.filter(o => o.state === 'Partial').length,
        Closed: orders.filter(o => o.state === 'Closed').length,
    }), [orders])

    useEffect(() => {
        setFilteredOrders(tab === 'All' ? orders : orders.filter(o => o.state === tab));
    }, [orders, tab]);

    const onWithdrawClicked = () => {
        if (!wallet) return;
        kujira.ordersWithdraw(wallet, contract, orders)
            .then(() => onOrderChanged())
            .catch(console.error)
    }

    const onCancelClicked = () => {
        if (!wallet) return;
        kujira.ordersCancel(wallet, contract, selectedOrders.map(o => `${o.idx}`))
            .then(() => onOrderChanged())
            .catch(console.error)
    }

    return (
        <div>
            <Row justify={"space-between"} align={'middle'}>
                <Col>
                    <Tabs defaultActiveKey="All" onChange={tab => setTab(tab)} activeKey={tab}>
                        <Tabs.TabPane tab={`All(${orders.length})`} key="All"/>
                        {['Open', 'Partial', 'Closed'].map(t => (
                            /*@ts-ignore*/
                            <Tabs.TabPane tab={`${t}${orders.length > 0 ? `(${counts[t]})` : ''}`} key={t} />
                        ))}
                    </Tabs>
                </Col>
                <Col>
                    <Row gutter={8}>
                        <Col>
                            <Button
                                type={orders.filter(o => +o.filled_amount > 0).length > 0  ? 'primary' : 'default'}
                                onClick={() => orders.filter(o => +o.filled_amount > 0).length > 0 && onWithdrawClicked()}
                            >
                                Claim All
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
                rowSelection={{
                    type: 'checkbox',
                    onChange: (_, keys) => setSelectedOrders(keys),
                    selectedRowKeys: selectedOrders.map(o => o.idx) || []
                }}
                pagination={{
                    position: ['bottomCenter']
                }}
                columns={[
                    {title: 'IDX', render(o: Order) { return o.idx}},
                    {title: 'Date', render(o: Order) { return toDateString(o.created_at)}},
                    {
                        title: 'Side',
                        width: 50,
                        render(o: Order) { return o.side},
                        filters: [
                            {text: 'Sell', value: 'Sell'},
                            {text: 'Buy', value: 'Buy'},
                        ],
                        onFilter: (value, row) => row.side === value,
                    },
                    {
                        title: 'Price',
                        align: 'right',
                        render(o: Order) {
                            return <OrderPrice contract={contract} order={o} />
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
