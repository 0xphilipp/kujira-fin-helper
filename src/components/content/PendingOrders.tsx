import {Button, Col, Row, Table, Typography} from "antd";
import {toSymbol} from "@util/kujira";
import OrderRequestAmount from "../order/OrderRequestAmount";
import OrderRequestPrice from "../order/OrderRequestPrice";
import useOrderRequest from "@hooks/useOrderRequest";
import useContract from "@hooks/useContract";
import useBalances from "@hooks/useBalances";
import {useMemo} from "react";

interface PendingOrdersProps {
}
const PendingOrders = ({}: PendingOrdersProps) => {
    const {baseSymbol, quoteSymbol, base, quote} = useContract();
    const {getBalanceAmount} = useBalances();
    const {orders, postOrder, cancelOrder, totalRequiredAmount, clearAll} = useOrderRequest();
    const overBuyAmount = useMemo(() => baseSymbol && base ? totalRequiredAmount[baseSymbol] > getBalanceAmount(base): false, [baseSymbol, base, totalRequiredAmount]);
    const overSellAmount = useMemo(() => quoteSymbol && quote ? totalRequiredAmount[quoteSymbol] > getBalanceAmount(quote): false, [quoteSymbol, quote, totalRequiredAmount]);
    console.log(quote && getBalanceAmount(quote), totalRequiredAmount)
    return (
        <div>
            <Row justify={"space-between"} align={'middle'}>
                <Col>
                    <h2>Pending ({orders.length})</h2>
                    {baseSymbol && quoteSymbol &&
                        <h4>
                            <span>Orders Require</span>&nbsp;
                            <Typography.Text type={overBuyAmount ? 'danger' : undefined}>{totalRequiredAmount[baseSymbol]} {baseSymbol}</Typography.Text>&nbsp;
                            <Typography.Text type={overSellAmount ? 'danger' : undefined}>{totalRequiredAmount[quoteSymbol]} {quoteSymbol}</Typography.Text>
                        </h4>}
                </Col>
                <Col>
                    <Row justify={'end'} gutter={8}>
                        <Col>
                            <Button
                                type={orders.length > 0 ? 'primary' : 'default'}
                                onClick={() => clearAll()}>Clear All</Button>
                        </Col>
                        <Col>
                            <Button
                                type={orders.length > 0 ? 'primary' : 'default'}
                                onClick={() => orders.length > 0 && postOrder()}
                            >
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Table
                rowKey={'uuid'}
                scroll={{y: 500 }}
                pagination={false}
                size={'small'}
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
                            return <Button type={'primary'} onClick={() => cancelOrder(row.uuid)}>X</Button>
                        }
                    }
                ]}
                dataSource={orders}
            />
        </div>
    )
}

export default PendingOrders;