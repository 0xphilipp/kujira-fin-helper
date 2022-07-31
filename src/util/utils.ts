import {notification} from "antd";

export const toDateString = (date: string) => new Date(+date / 1_000_000).toLocaleString();

export const handleResponseErrorNotification = (res: any) => {
    if (res.statusCode !== 200) {
        const error = new Error();
        error.name = res.error;
        error.message = res.message[0];
        throw error;
    }
    return res;
}

export const handleErrorNotification = (e: any) => {
    if (e.message) {
        console.error(e);
        notification.open({
            message: e.name,
            description: e.message,
        });
    }
    return e;
};

export const formatAmount = (amount: string) => {
    const arr = amount.split('.');
    if (arr.length != 2) return amount;
    return `${arr[0]}.${arr[1].length > 8 ? arr[1].slice(0, 8) : arr[1]}`
}