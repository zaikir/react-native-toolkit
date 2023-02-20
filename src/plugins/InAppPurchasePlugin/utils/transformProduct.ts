import { Platform } from 'react-native';
import type { ProductAndroid, ProductIOS } from 'react-native-iap';

import type { Product } from '../types/product';

export function transformProduct(
  product: ProductIOS | ProductAndroid,
): Product {
  if (Platform.OS === 'ios') {
    const data = product as ProductIOS;

    return {
      productId: data.productId,
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      localizedPrice: data.localizedPrice,
      currency: data.currency,
      originalData: data,
    };
  }

  if (Platform.OS === 'android') {
    const data = product as ProductAndroid;

    return {
      productId: data.productId,
      title: data.title,
      description: data.description,
      price:
        parseFloat(data.oneTimePurchaseOfferDetails!.priceAmountMicros) / 1e6,
      localizedPrice: data.oneTimePurchaseOfferDetails!.formattedPrice,
      currency: data.oneTimePurchaseOfferDetails!.priceCurrencyCode,
      originalData: data,
    };
  }

  throw new Error(`Platform not supported: ${Platform.OS}`);
}
