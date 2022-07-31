const walletClient = ({
    getBalances(host: string, address: string) {
        return fetch(`${host}/wallets/${address}/balances`)
            .then(res => res.json());
    }
})

export default walletClient;