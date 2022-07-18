import {toSymbol} from "@util/kujira";
import {InputNumber} from "antd";

interface OrderAmountProps {
    amount: number;
    denom: Denom;
}

const OrderAmount = ({amount, denom}: OrderAmountProps) => {
    let precision = 4;
    return <InputNumber
        className={'borderless-input-number'}
        value={amount} bordered={false} readOnly precision={precision}
        addonAfter={toSymbol(denom)}
    />;
}

export default OrderAmount;