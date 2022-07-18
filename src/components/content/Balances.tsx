import {toSymbol} from "@util/kujira";
import {Descriptions} from "antd";
import {SyncOutlined} from "@ant-design/icons";
import {useState} from "react";

interface BalancesProps {
    balances: Balance[]
    onReload: () => Promise<void>;
}

const Balances = ({balances, onReload}: BalancesProps) => {
    const [spin, setSpin] = useState<boolean>(false);
    const formatAmount = (amount: string) => {
        const arr = amount.split('.');
        if (arr.length != 2) return amount;
        return `${arr[0]}.${arr[1].length > 8 ? arr[1].slice(0, 8) : arr[1]}`
    }
    const onSpinClicked = () => {
        setSpin(true);
        onReload()
            .finally(() => setSpin(false))
    }
    return (
        <div>
            <Descriptions bordered layout={'horizontal'}
                          title={<>Balances <SyncOutlined spin={spin} onClick={() => onSpinClicked()} /></>}>
                {balances.map(b => (
                    <Descriptions.Item key={b.denom} label={toSymbol(b.denom)} span={3}>
                        {formatAmount(b.amount)}
                    </Descriptions.Item>
                ))}
            </Descriptions>

        </div>
    )
}

export default Balances;