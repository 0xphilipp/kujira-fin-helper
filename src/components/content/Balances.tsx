import {toSymbol} from "@util/kujira";
import {Descriptions} from "antd";
import {SyncOutlined} from "@ant-design/icons";
import {useState} from "react";
import useBalances from "@hooks/useBalances";
import {formatAmount, handleErrorNotification} from "@util/utils";

interface BalancesProps {}

const Balances = ({}: BalancesProps) => {
    const {balances, refreshBalances} = useBalances();
    const [spin, setSpin] = useState<boolean>(false);
    const onSpinClicked = () => {
        setSpin(true);
        refreshBalances()
            .catch(handleErrorNotification)
            .finally(() => setSpin(false))
    }
    return (
        <div>
            <Descriptions bordered layout={'horizontal'}
                          labelStyle={{width: 50, padding: '0 10px', margin: 0}}
                          title={<>Balances <SyncOutlined spin={spin} onClick={() => onSpinClicked()} /></>}>
                {balances && balances.map(b => (
                    <Descriptions.Item
                        key={b.denom}
                        label={toSymbol(b.denom)} span={3}
                    >
                        <div style={{width: 100}}>{formatAmount(b.amount)}</div>
                    </Descriptions.Item>
                ))}
            </Descriptions>
        </div>
    )
}

export default Balances;