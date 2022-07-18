export const toDateString = (date: string) => new Date(+date / 1_000_000).toLocaleString();
