import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
} from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { TradingAddDto, TradingDto, TradingType } from "../../trading/trading";
import useContracts from "@hooks/useContracts";
import TradingClient from "../../client/trading-client";
import useServers from "@hooks/useServers";
import { handleErrorNotification } from "@util/utils";
import useWalletBalance from "@hooks/useWalletBalance";
import useContract from "@hooks/useContract";
import useMarketPrice from "@hooks/useMarketPrice";

const MarketMakingFormPage = () => {
  const { id } = useParams();
  const { host } = useServers();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const account = useMemo(() => searchParams.get("account"), [searchParams]);
  const page = useMemo<"Add" | "Modify">(() => (id ? "Modify" : "Add"), []);
  const { contract, setContract } = useContract();
  const [rates, setRates] = useState<number[]>(
    page === "Add" ? [-0.02, -0.01, 0, 0.01, 0.02] : []
  );
  const [type, setType] = useState(TradingType.default);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);

  // const ratio =
  //   gridOptions.to &&
  //   gridOptions.from &&
  //   gridOptions.steps &&
  //   Math.pow(gridOptions.to / gridOptions.from, 1 / gridOptions.steps);

  const [targetRate, setTargetRate] = useState<number>();
  const { rate, baseBalance, quoteBalance, base, quote } = useWalletBalance(
    host,
    account
  );
  const { price } = useMarketPrice();
  const { contracts, getMarket, getBaseSymbol, getContractByAddress } =
    useContracts();
  useEffect(() => {
    if (!host || !account) {
      navigate("/market-making");
      return;
    }
    if (page === "Add") {
      setContract(contracts[0]);
    } else if (id) {
      TradingClient.getTrading(host, id)
        .then((res: TradingDto) => {
          setRates(res.deltaRates);
          setTargetRate(res.targetRate);
          setMin(res.min);
          setMax(res.max);
          setType(res.type);
          setContract(getContractByAddress(res.contract.address));
          form.setFieldsValue(res);
        })
        .catch(handleErrorNotification);
    } else {
      navigate("/market-making");
    }
  }, []);
  useEffect(() => {
    if (rate && !targetRate) {
      form.setFieldsValue({
        targetRate: +(rate * 100).toFixed(5),
      });
    }
  }, [rate]);

  const current = useMemo(() => {
    // price = 2
    // min = 1
    // max = 11
    // -> 90%
    let delta = max - min; // 10
    let current = price - min; // 1
    let targetRate = Math.max(0, Math.min(1, 1 - current / delta));

    let message = "";

    if (rate && quoteBalance && baseBalance) {
      if (targetRate > rate) {
        let wantedBase =
          ((quoteBalance / (1 - targetRate)) * targetRate) / price;
        let delta = wantedBase - baseBalance;
        message =
          `Deposit ${base} ` + delta.toFixed(2) + " " + targetRate + " " + rate;
      } else if (targetRate < rate) {
        let wantedQuote = (baseBalance / targetRate) * (1 - targetRate) * price;
        let delta = wantedQuote - quoteBalance;
        message = `Deposit ${quote} ` + delta.toFixed(2);
      }
    }

    return { targetRate, message };
  }, [min, max, price, rate, baseBalance, quoteBalance, base]);

  const onSave = async () => {
    if (!host) return;
    const values = await form.validateFields();
    const dto: TradingAddDto = {
      account: values.account,
      deltaRates: rates,
      targetRate: targetRate,
      contract: values.contract.address,
      orderAmountMin: values.orderAmountMin,
      type: type,
      min: min,
      max: max,
    };
    (page === "Modify" && id
      ? TradingClient.postTrading(host, id, dto)
      : TradingClient.putTrading(host, dto)
    )
      .then(() => navigate("/market-making"))
      .catch(handleErrorNotification);
  };

  const onRateInputEnter = (value: number) => {
    const rate: number = +(value / 100).toFixed(3);
    if (isNaN(rate)) return;
    if (rate <= -1 || rate >= 1) return;
    setRates((rates) =>
      rates ? [rate, ...rates?.filter((r) => r !== rate)] : [rate]
    );
  };

  return (
    <div style={{ padding: 10 }}>
      <Form
        form={form}
        style={{ padding: 10 }}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
      >
        <Form.Item label={" "} colon={false}>
          <Row justify={"end"}>
            <Col>
              <Space>
                <Button type={"primary"} onClick={() => onSave()}>
                  {page}
                </Button>
                <Button onClick={() => navigate("/market-making")}>
                  Cancel
                </Button>
              </Space>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item label={"exchange"}>
          <Input disabled value={"FIN"} />
        </Form.Item>
        <Form.Item label={"wallet"} name={"account"} initialValue={account}>
          <Input disabled />
        </Form.Item>
        <Form.Item
          label={"market"}
          name={["contract", "address"]}
          initialValue={contracts[0].address}
        >
          <Select
            onChange={(address) => {
              const contract = getContractByAddress(address);
              setContract(contract);
            }}
            disabled={page === "Modify"}
          >
            {contracts &&
              contracts.map((c) => (
                <Select.Option key={c.address} value={c.address}>
                  {getMarket(c)}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={"Order Minimum"}
          name={"orderAmountMin"}
          initialValue={0}
          rules={[
            {
              validator(rule, value) {
                if (value < 0) return Promise.reject();
                return Promise.resolve();
              },
              message: "amount must bigger than 0",
            },
          ]}
        >
          <InputNumber
            min={0}
            style={{ width: 150 }}
            addonAfter={contract && getBaseSymbol(contract)}
            controls={false}
          />
        </Form.Item>
        <Form.Item
          label={"Target Rate"}
          validateStatus={
            rate && targetRate && Math.abs(rate - targetRate) > 0.01
              ? "warning"
              : undefined
          }
          extra={
            contract &&
            rate && (
              <div>
                Current Balance Rate is{" "}
                <Button
                  style={{ padding: 0 }}
                  type={"link"}
                  onClick={() => setTargetRate(rate)}
                >
                  {(rate * 100).toFixed(5)}%
                </Button>
              </div>
            )
          }
        >
          <InputNumber
            style={{ width: 150 }}
            min={0}
            max={100}
            addonAfter={"%"}
            onChange={(v) => setTargetRate(+((v || 0) / 100).toFixed(5))}
            value={+((targetRate || 0) * 100).toFixed(5)}
            controls={false}
          />
        </Form.Item>

        <Form.Item label={"type"} name={["type"]}>
          <Select
            onChange={(type) => {
              setType(type);
            }}
          >
            <Select.Option value={TradingType.default}>default</Select.Option>

            <Select.Option value={TradingType.dynamic}>dynamic</Select.Option>
          </Select>
        </Form.Item>

        {type === TradingType.dynamic ? (
          <>
            <Form.Item label={"min"} name={["min"]}>
              <InputNumber
                style={{ width: 150 }}
                min={0}
                onChange={(v) => setMin(v ?? 0)}
                value={min}
                controls={false}
              />
            </Form.Item>
            <Form.Item
              label={"max"}
              name={["max"]}
              extra={
                min &&
                max && (
                  <div>
                    Price {price} - Rate {((rate || 0) * 100).toFixed(2)} % -
                    Target {(current.targetRate * 100).toFixed(2)} -{" "}
                    {current.message}
                  </div>
                )
              }
            >
              <InputNumber
                style={{ width: 150 }}
                min={0}
                onChange={(v) => setMax(v ?? 0)}
                value={min}
                controls={false}
              />
            </Form.Item>

            {/* <Form.Item
              label={"steps"}
              name={["steps"]}
              extra={
                gridOptions.from &&
                gridOptions.to &&
                gridOptions.steps && (
                  <>
                    <div>
                      {(
                        (gridOptions.to - gridOptions.from) /
                        gridOptions.steps
                      ).toFixed(3)}{" "}
                      $ ratio: {((ratio! - 1) * 100).toFixed(2)} %
                    </div>
                    <div>
                      {Array.from({ length: gridOptions.steps }, (x, i) =>
                        (gridOptions.from! * Math.pow(ratio!, i)).toFixed(3)
                      ).join(", ")}
                    </div>
                  </>
                )
              }
            >
              <InputNumber
                style={{ width: 150 }}
                min={5}
                // max={100}
                onChange={(v) =>
                  setGridOptions({
                    ...gridOptions,
                    steps: v ?? 0,
                  })
                }
                value={gridOptions.steps}
                controls={false}
              />
            </Form.Item> */}
          </>
        ) : (
          <></>
        )}

        <Form.Item label={"Order Rates"}>
          <Form.Item name={"rate"}>
            <InputNumber
              min={-100}
              step={0.1}
              defaultValue={0}
              max={100}
              style={{ textAlign: "left" }}
              addonBefore={"ADD"}
              addonAfter={"%"}
              precision={1}
              controls={false}
              onPressEnter={(v) => {
                const value = +(v.target as any).value;
                onRateInputEnter(value);
              }}
            />
          </Form.Item>
          <Form.Item>
            {rates
              ?.sort((a, b) => (a > b ? 1 : -1))
              ?.map((r) => (
                <Tag
                  key={r}
                  closable
                  onClose={() =>
                    setRates((rates) => rates?.filter((rate) => rate !== r))
                  }
                >
                  {(r * 100).toFixed(1)}%
                </Tag>
              ))}
          </Form.Item>
        </Form.Item>
      </Form>
    </div>
  );
};

export default MarketMakingFormPage;
