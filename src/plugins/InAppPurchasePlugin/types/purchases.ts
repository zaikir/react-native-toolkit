export type Purchase = {
  productId: string;
  purchaseToken?: string;
  transactionDate: number;
  transactionReceipt: string;
  originalPurchase: any;
};
