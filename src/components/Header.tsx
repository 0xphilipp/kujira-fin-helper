import React, {useState} from 'react';
import {Button, Col, Menu, Row} from "antd";
import useWallet from "@hooks/useWallet";
import {Link} from "react-router-dom";

interface HeaderProps {
}

const styleHeaderCol = {
    fontSize: 15,
}

const Header = (props: HeaderProps) => {
    const {wallet, connect, disconnect} = useWallet();
    const [menu, setMenu] = useState('0');
    return (
        <Row justify={"space-between"} className={'header'} align={'middle'}>
            <Col>
                <Row>
                    <Col>
                        <h1 style={{margin: 0}}>KUJIRA FIN Helper</h1>
                    </Col>
                    <Col>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            defaultSelectedKeys={[menu]}
                            onClick={({key}) => setMenu(key)}
                            inlineCollapsed={false}
                            items={[
                                {
                                    key: 'Balances',
                                    label: <Link to={'/balances'}>Wallet</Link>,
                                },
                                {
                                    key: `Orders`,
                                    label: <Link to={'/orders'}>Orders</Link>,
                                }, {
                                    key: 'Market Making',
                                    label: <Link to={'/market-making'}>Market Making</Link>,
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Col>
            <Col style={{...styleHeaderCol, textAlign: 'right'}}>
                {wallet &&
                    <Row gutter={8} justify={"end"} align={'middle'}>
                        <Col>
                            {(wallet.signer as any).chainId}
                        </Col>
                        <Col>
                            {wallet.account.address}
                        </Col>
                        <Col>
                            <Button onClick={() => disconnect()}>Disconnect Wallet</Button>
                        </Col>
                    </Row>
                }
                {!wallet &&
                <Row gutter={8}>
                    <Col>
                        <Button onClick={() => connect('kaiyo-1')}>Connect Wallet</Button>
                    </Col>
                </Row>}
            </Col>
        </Row>
    )
}

export default Header;
