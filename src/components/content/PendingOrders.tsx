import {Button, Col, Row, Table} from "antd";
import {toSymbol} from "@util/kujira";
import OrderRequestAmount from "../order/OrderRequestAmount";
import OrderRequestPrice from "../order/OrderRequestPrice";

interface PendingOrdersProps {
    pendingOrders: OrderRequest[];
    onCancel: (uuid: string) => void;
    onOrderSubmit: Function;
}
const PendingOrders = ({onOrderSubmit, onCancel, pendingOrders}: PendingOrdersProps) => {
    return (
        <div>
            <Row justify={"space-between"}>
                <Col>
                    <h2>Pending</h2>
                </Col>
                <Col>
                    <Button
                        type={pendingOrders.length > 0 ? 'primary' : 'default'}
                        onClick={() => pendingOrders.length > 0 && onOrderSubmit()}
                    >
                        Submit
                    </Button>
                </Col>
            </Row>
            <Table
                rowKey={'uuid'}
                scroll={{y: 500 }}
                pagination={false}
                columns={[
                    {
                        title: 'Side',
                        dataIndex: 'side',
                    }, {
                        title: 'Price',
                        align: 'right',
                        render(o: OrderRequest) {
                            return <OrderRequestPrice order={o} />;
                        },
                        sorter: (a, b) => +a.price - +b.price,
                    }, {
                        title: 'Amount',
                        align: 'right',
                        render(o: OrderRequest) {
                            return <OrderRequestAmount order={o} />;
                        }
                    }, {
                        title: 'Estimated Return',
                        align: 'right',
                        render(o: OrderRequest) {
                            if (o.side === 'Buy') {
                                return `${+o.amount / +o.price} ${toSymbol(o.contract.denoms.base)}`;
                            } else {
                                return `${+o.amount * +o.price} ${toSymbol(o.contract.denoms.quote)}`;
                            }
                        }
                    }, {
                        align: 'right',
                        render(row: OrderRequest) {
                            return <Button type={'primary'} onClick={() => onCancel(row.uuid)}>X</Button>
                        }
                    }
                ]}
                dataSource={pendingOrders}
            />
        </div>
    )
}

export default PendingOrders;