import {notification} from "antd";

export const toDateString = (date: string) => new Date(+date / 1_000_000).toLocaleString();

export const handleErrorNotification = (e: Error) => notification.open({
    message: e.name,
    description: e.message,
})

export const formatAmount = (amount: string) => {
    const arr = amount.split('.');
    if (arr.length != 2) return amount;
    return `${arr[0]}.${arr[1].length > 8 ? arr[1].slice(0, 8) : arr[1]}`
}