import {Descriptions} from "antd";
import {SyncOutlined} from "@ant-design/icons";
import {useState} from "react";
import useBalances from "@hooks/useBalances";
import {formatAmount, handleErrorNotification} from "@util/utils";
import useDenoms from "@hooks/useDenoms";

interface BalancesProps {}

const Balances = ({}: BalancesProps) => {
    const {toSymbol} = useDenoms();
    const {balances, refreshBalances} = useBalances();
    const [spin, setSpin] = useState<boolean>(false);
    const onSpinClicked = () => {
        setSpin(true);
        refreshBalances()
            .catch(handleErrorNotification)
            .finally(() => setSpin(false))
    }
    if (!balances) return <></>;
    return (
        <Descriptions bordered
                      layout={'horizontal'}
                      title={<span>Wallet <SyncOutlined spin={spin} onClick={() => onSpinClicked()} /></span>}>
            {balances.map(b => (
                <Descriptions.Item
                    key={b.denom}
                    label={toSymbol(b.denom)}
                    span={2}
                >
                    <div style={{width: 100}}>{formatAmount(b.amount)}</div>
                </Descriptions.Item>
            ))}
        </Descriptions>
    )
}

export default Balances;