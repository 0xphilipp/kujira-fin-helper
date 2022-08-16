import {Button, Checkbox, Form, Input, Popover} from "antd";
import useServers from "@hooks/useServers";
import TradingClient from "../../client/trading-client";
import {handleErrorNotification} from "@util/utils";
import {useEffect} from "react";

const TradingServerConnection = () => {
    const [form] = Form.useForm();
    const {host, mutate, connected} = useServers();
    const onConnectServer = async () => {
        if (connected) {
            await mutate(undefined);
            return;
        }
        const {save, server} = await form.validateFields();
        TradingClient.getInfo(server)
            .then(res => {
                if (res.version !== process.env.REACT_APP_VERSION) {
                    const error = new Error();
                    error.message = `Server version[${res.version}] and Client version[${process.env.VERSION}] mismatch.`;
                    throw error;
                }
            })
            .then(() => {
                if (save) {
                    localStorage.setItem('server', server);
                } else {
                    localStorage.removeItem('server');
                }
            })
            .then(() => mutate(server))
            .catch(handleErrorNotification);
    }
    useEffect(() => {
        const url = localStorage.getItem('server');
        if (url) {
            form.setFieldsValue({
                save: 'checked',
                server: url,
            })
            mutate(url)
                .catch(handleErrorNotification);
        }
    }, [])
    return (
        <Form form={form}
              style={{marginBottom: 10}}
              layout="inline"
              colon={false}
        >
            <Form.Item
                name={'server'}
                label={'Connect Server'}
                tooltip={<span>You can download and install it <a href={'https://github.com/kht2199/kujira-fin-market-making'} target={'_blank'}>here</a></span>}
                initialValue={host || 'http://localhost:3000'}
                rules={[{
                    required: true,
                }]}
            >
                <Input type={'url'} disabled={connected} />
            </Form.Item>
            <Popover content={'Save on successful connection for next connection'}>
                <div>
                    <Form.Item
                        name={'save'}
                        valuePropName="checked"
                    >
                        <Checkbox disabled={connected} onChange={(e) => {
                            if (!e.target.checked) {
                                localStorage.removeItem('server');
                            }
                        }}>
                            Save
                        </Checkbox>
                    </Form.Item>
                </div>
            </Popover>
            <Form.Item label={' '}>
                <Button onClick={() => onConnectServer()} style={{width: 100}}>
                    {connected ? 'Disconnect' : 'Connect'}
                </Button>
            </Form.Item>
        </Form>
    )
}

export default TradingServerConnection;