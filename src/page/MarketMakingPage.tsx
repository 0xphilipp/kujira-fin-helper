import TradingsTable from "../components/mm/TradingsTable";
import TradingServerConnection from "../components/mm/TradingServerConnection";
import useServers from "@hooks/useServers";
import WalletsTable from "../components/mm/WalletsTable";
import {Col, Row} from "antd";

const MarketMakingPage = () => {
    const {connected} = useServers();
    return (
        <div style={{padding: 10}}>
            <TradingServerConnection />
            <Row style={{marginBottom: 20}}>
                <Col span={24}>
                    {connected && <WalletsTable />}
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    {connected && <TradingsTable />}
                </Col>
            </Row>
        </div>
    )
}

export default MarketMakingPage;