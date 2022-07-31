import {Button, Form, Input} from "antd";
import useServers from "@hooks/useServers";
import TradingClient from "../../client/trading-client";
import {handleErrorNotification} from "@util/utils";

const TradingServerConnection = () => {
    const [form] = Form.useForm();
    const {host, mutate, connected} = useServers();
    const onConnectServer = async () => {
        const {server} = await form.validateFields();
        TradingClient.getInfo(server)
            .then(() => mutate(server))
            .catch(handleErrorNotification);
    }
    return (
        <Form form={form}
              style={{marginBottom: 10}}
              layout="inline"
              colon={false}
        >
            <Form.Item
                name={'server'}
                label={'Connect Server'}
                initialValue={host || 'http://localhost:3000'}
                rules={[{
                    required: true,
                    validator(rule, value) {
                        return /^((http|https?:\/\/)|(www.))(?:([a-zA-Z]+)|(\d+\.\d+.\d+.\d+)):\d{4}$/.test(value) ? Promise.resolve() : Promise.reject()
                    }
                }]}
            >
                <Input type={'url'} disabled={connected}/>
            </Form.Item>
            <Form.Item label={' '}>
                <Button disabled={connected} onClick={() => onConnectServer()}>Connect</Button>
            </Form.Item>
        </Form>
    )
}

export default TradingServerConnection;