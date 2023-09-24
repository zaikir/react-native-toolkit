import { Platform } from 'react-native';
import type { ProductAndroid, ProductIOS } from 'react-native-iap';

import { Product } from 'plugins/types';

export function transformProduct(
  product: ProductIOS | ProductAndroid,
  consumable: boolean,
): Product {
  if (Platform.OS === 'ios') {
    const data = product as ProductIOS;

    return new Product({
      productId: data.productId,
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      localizedPrice: data.localizedPrice,
      currency: data.currency,
      consumable,
      originalData: data,
    });
  }

  if (Platform.OS === 'android') {
    const data = product as ProductAndroid;

    return new Product({
      productId: data.productId,
      title: data.title,
      description: data.description,
      originalData: data,
      price:
        parseFloat(data.oneTimePurchaseOfferDetails!.priceAmountMicros) / 1e6,
      localizedPrice: data.oneTimePurchaseOfferDetails!.formattedPrice,
      currency: data.oneTimePurchaseOfferDetails!.priceCurrencyCode,
      consumable,
    });
  }

  throw new Error(`Platform not supported: ${Platform.OS}`);
}
