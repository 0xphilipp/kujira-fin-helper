import {notification} from "antd";

export const toDateString = (date: string) => new Date(+date / 1_000_000).toLocaleString();

export const handleErrorNotification = (e: Error) => notification.open({
    message: e.name,
    description: e.message,
})