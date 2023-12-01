import { Platform } from 'react-native';
import type {
  SubscriptionAmazon,
  SubscriptionAndroid,
  SubscriptionIOS,
} from 'react-native-iap';

import { parseIso8601Period } from './parseIso8601Period';
import { Subscription } from '../../types';

// eslint-disable-next-line max-len
export function transformSubscription(
  subscription: SubscriptionIOS | SubscriptionAndroid | SubscriptionAmazon,
): Subscription {
  if (Platform.OS === 'ios') {
    const data = subscription as SubscriptionIOS;

    return new Subscription({
      productId: data.productId,
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      localizedPrice: data.localizedPrice,
      currency: data.currency,
      periodUnit: data.subscriptionPeriodUnitIOS!.toLocaleLowerCase() as any,
      numberOfPeriods: parseFloat(data.subscriptionPeriodNumberIOS!),
      ...(data.introductoryPricePaymentModeIOS === 'FREETRIAL' && {
        trial: {
          periodUnit:
            data.introductoryPriceSubscriptionPeriodIOS!.toLocaleLowerCase() as any,
          numberOfPeriods: parseFloat(
            data.introductoryPriceNumberOfPeriodsIOS!,
          ),
        },
      }),
      originalData: data,
    });
  }

  if (Platform.OS === 'android') {
    const data = subscription as SubscriptionAndroid;

    if (data.subscriptionOfferDetails.length !== 1) {
      console.warn(
        `Multiple offsers detected for a subscription ${data.productId}. First offer will be used`,
      );
    }

    const offerPrices =
      data.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList;
    const [priceInfo] = offerPrices.filter((x) => x.priceAmountMicros !== '0');
    const [trialInfo] = offerPrices.filter((y) => y.priceAmountMicros === '0');

    return new Subscription({
      productId: data.productId,
      title: data.title,
      description: data.description,
      originalData: data,
      price: parseFloat(priceInfo.priceAmountMicros) / 1e6,
      localizedPrice: priceInfo.formattedPrice,
      currency: priceInfo.priceCurrencyCode,
      ...parseIso8601Period(priceInfo.billingPeriod),
      ...(trialInfo && {
        trial: {
          ...parseIso8601Period(trialInfo.billingPeriod),
        },
      }),
    });
  }

  throw new Error(`Platform not supported: ${Platform.OS}`);
}
