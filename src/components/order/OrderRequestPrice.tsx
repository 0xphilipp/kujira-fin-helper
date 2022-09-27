import {toSymbol} from "@util/kujira";
import {InputNumber} from "antd";

interface OrderRequestPriceProps {
    order: OrderRequest;
}
const OrderRequestPrice = ({order}: OrderRequestPriceProps) => {
    return <InputNumber
        className={'borderless-input-number'}
        value={order.price} bordered={false} readOnly precision={+order.contract.price_precision}
        addonAfter={toSymbol(order.contract.denoms.quote)}
    />;
}

export default OrderRequestPrice;