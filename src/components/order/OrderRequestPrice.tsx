import {InputNumber} from "antd";
import useDenoms from "@hooks/useDenoms";

interface OrderRequestPriceProps {
    order: OrderRequest;
}
const OrderRequestPrice = ({order}: OrderRequestPriceProps) => {
    const {toSymbol} = useDenoms();
    return <InputNumber
        className={'borderless-input-number'}
        value={order.price} bordered={false} readOnly precision={+order.contract.price_precision}
        addonAfter={toSymbol(order.contract.denoms.quote)}
    />;
}

export default OrderRequestPrice;