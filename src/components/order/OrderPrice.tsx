import {InputNumber} from "antd";
import {toSymbol} from "@util/kujira";

interface OrderPriceProps {
    order: Order;
    contract: Contract;
}
const OrderPrice = ({order, contract}: OrderPriceProps) => {
    let price = +order.quote_price;
    let precision = 4;
    return <InputNumber
        className={'borderless-input-number'}
        value={price}
        bordered={false}
        readOnly
        precision={precision}
        addonAfter={toSymbol(contract.denoms.quote)}
    />;
}

export default OrderPrice;