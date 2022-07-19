import {InputNumber} from "antd";
import {toSymbol} from "@util/kujira";
import useContract from "@hooks/useContract";

interface OrderPriceProps {
    order: Order;
}
const OrderPrice = ({order}: OrderPriceProps) => {
    const {contract} = useContract();
    let price = +order.quote_price;
    let precision = 4;
    return <InputNumber
        className={'borderless-input-number'}
        value={price}
        bordered={false}
        readOnly
        precision={precision}
        addonAfter={contract ? toSymbol(contract.denoms.quote) : undefined}
    />;
}

export default OrderPrice;