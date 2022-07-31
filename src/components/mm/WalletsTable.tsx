import {Button, Table} from "antd";
import useWallets from "@hooks/useWallets";
import {useNavigate} from "react-router-dom";
import useTradings from "@hooks/useTradings";
import useContracts from "@hooks/useContracts";
import {WalletDto} from "../../dto/wallet.dto";

const WalletsTable = () => {
    const {wallets} = useWallets();
    const {tradings} = useTradings();
    const {getMarketByAddress} = useContracts();
    const navigate = useNavigate();
    return (
        <>
            <h2>Wallet</h2>
            <Table
                rowKey={'account'}
                columns={[
                    {
                        title: 'Endpoint',
                        dataIndex: 'endpoint'
                    }, {
                        title: 'Address',
                        dataIndex: ['account', 'address'],
                        key: 0
                    }, {
                        title: 'Active Markets',
                        render(row: Wallet) {
                            return tradings
                                ?.filter(t => t.wallet.account.address === row.account.address)
                                ?.map(t => getMarketByAddress(t.contract.address))
                                .join('\n');
                        },
                    }, {
                        title: 'Actions',
                        fixed: 'right',
                        align: 'center',
                        render(row: WalletDto) {
                            return (
                                <Button type={'primary'} onClick={() => navigate(`/market-making/form?account=${row.account.address}`)}>Add Trading</Button>
                            )
                        }
                    }
                ]}
                dataSource={wallets}
                pagination={false}
            />
        </>
    )
}

export default WalletsTable;