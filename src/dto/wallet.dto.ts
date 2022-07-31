export class WalletDto {

  readonly account: { address: string };

  constructor(wallet: Wallet) {
    this.account = {
      address: wallet.account.address,
    }
  }
}