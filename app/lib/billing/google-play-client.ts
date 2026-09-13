/**
 * Client utility for interacting with the Google Play Billing API.
 */

// Extend the Window interface to support getDigitalGoodsService
declare global {
  interface Window {
    getDigitalGoodsService?: (provider: string) => Promise<any>;
  }
}

export async function purchaseGooglePlayProduct(productId: string): Promise<{ purchaseToken?: string; error?: string }> {
  if (typeof window === 'undefined') {
    return { error: 'Not running in a browser environment' };
  }

  if (!window.getDigitalGoodsService) {
    return { error: 'Digital Goods API not supported on this device/browser.' };
  }

  try {
    const service = await window.getDigitalGoodsService('https://play.google.com/billing');
    
    if (!service) {
      return { error: 'Could not connect to Google Play Billing service.' };
    }

    const supportedInstruments = [{
      supportedMethods: 'https://play.google.com/billing',
      data: {
        sku: productId,
      },
    }];

    const details = {
      total: {
        label: 'Total',
        amount: {
          currency: 'USD',
          value: '0', // The actual value is defined in the Google Play Console
        },
      },
    };

    const request = new PaymentRequest(supportedInstruments, details);
    
    const canMakePayment = await request.canMakePayment();
    if (!canMakePayment) {
      return { error: 'Payment cannot be made with the specified instrument.' };
    }

    const paymentResponse = await request.show();
    
    const purchaseToken = paymentResponse.details.purchaseToken;
    
    await paymentResponse.complete('success');

    if (!purchaseToken) {
      return { error: 'Purchase completed but no token was returned.' };
    }

    return { purchaseToken };
  } catch (error: any) {
    console.error('Google Play purchase error:', error);
    return { error: error?.message || 'An error occurred during the purchase process.' };
  }
}
