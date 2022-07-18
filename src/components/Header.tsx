import React from 'react';
import {Button, Col, Row} from "antd";

interface HeaderProps {
    wallet: Wallet | undefined;
    onDisconnect: Function;
    onConnect: Function;
}

const styleHeaderCol = {
    fontSize: 15,
}

const Header = ({wallet, onDisconnect, onConnect}: HeaderProps) => {
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
                            <Button onClick={() => onDisconnect()}>Disconnect Wallet</Button>
                        </Col>
                    </Row>
                }
                {!wallet &&
                <Row gutter={8}>
                    {/*<Col>
                        <Button onClick={() => onConnect('harpoon-4')}>connect harpoon-4</Button>
                    </Col>*/}
                    <Col>
                        <Button onClick={() => onConnect('kaiyo-1')}>connect kaiyo-1</Button>
                    </Col>
                </Row>}
            </Col>
        </Row>
    )
}

export default Header;
