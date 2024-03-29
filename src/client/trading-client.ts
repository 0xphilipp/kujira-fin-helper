import {TradingAddDto, TradingDto} from "../trading/trading";

const TradingClient = ({
    getTradings(host: any) {
        return fetch(`${host}/tradings`)
            .then(res => res.json());
    },
    getTrading(host: string, id: string): Promise<TradingDto> {
        return fetch(`${host}/tradings/${id}`)
            .then(res => res.json())
    },
    postTrading(host: string, id: string, values: TradingAddDto) {
        return fetch(`${host}/tradings/${id}`, {
            method: 'post',
            body: JSON.stringify(values),
            headers: {
                'Content-type': 'application/json'
            }
        })
    },
    putTrading(host: string, values: TradingAddDto) {
        return fetch(`${host}/tradings`, {
            method: 'put',
            body: JSON.stringify(values),
            headers: {
                'Content-type': 'application/json'
            }
        })
    },
    getInfo(host: string) {
        return fetch(`${host}/info`)
            .then(res => res.json());
    },
    patchStop(host: string, id: string) {
        return fetch(`${host}/tradings/${id}/stop`, {
            method: 'post',
        });
    },
    patchResume(host: string, id: string) {
        return fetch(`${host}/tradings/${id}/resume`, {
            method: 'post',
        })
    },
    delete(host: string, id: string) {
        return fetch(`${host}/tradings/${id}`, {
            method: 'delete',
        });
    }
})

export default TradingClient;
