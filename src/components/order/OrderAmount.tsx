import {InputNumber} from "antd";
import useDenoms from "@hooks/useDenoms";

interface OrderAmountProps {
    amount: number;
    denom: Denom;
}

const OrderAmount = ({amount, denom}: OrderAmountProps) => {
    const {toSymbol} = useDenoms();
    let precision = 4;
    return <InputNumber
        className={'borderless-input-number'}
        value={amount} bordered={false} readOnly precision={precision}
        addonAfter={toSymbol(denom)}
    />;
}

export default OrderAmount;