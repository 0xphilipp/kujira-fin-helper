import React from 'react';
import {Button, Col, Row} from "antd";
import useWallet from "@hooks/useWallet";

interface HeaderProps {
}

const styleHeaderCol = {
    fontSize: 15,
}

const Header = ({}: HeaderProps) => {
    const {wallet, connect, disconnect} = useWallet();
    return (
        <Row justify={"space-between"} className={'header'} align={'middle'}>
            <Col>
                <h1>KUJIRA FIN Helper</h1>
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
                        <Button onClick={() => connect('kaiyo-1')}>connect kaiyo-1</Button>
                    </Col>
                </Row>}
            </Col>
        </Row>
    )
}

export default Header;
