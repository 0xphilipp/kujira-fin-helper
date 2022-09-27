import {toSymbol} from "@util/kujira";
import {InputNumber} from "antd";

interface OrderRequestProps {
    order: OrderRequest;
}
const OrderRequestAmount = ({order}: OrderRequestProps) => {
    const denom = order.side === 'Buy' ? order.contract.denoms.quote : order.contract.denoms.base;
    const amount = order.amount;
    return <InputNumber
        className={'borderless-input-number'}
        value={amount} bordered={false} readOnly precision={3}
        addonAfter={toSymbol(denom)}
    />;
}

export default OrderRequestAmount;