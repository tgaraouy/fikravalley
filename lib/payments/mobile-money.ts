/**
 * Mobile Money Payment Link Generation
 * 
 * Assembly over Addition: Use existing mobile money services (M-Wallet, Orange Money)
 * to enable 3-DH validation payments without business registration or procurement delays
 */

export type MobileMoneyProvider = 'm-wallet' | 'orange-money' | 'cih-bank' | 'attijariwafa';

export interface PaymentLinkParams {
  amount: number; // in DH
  idea_id: string;
  idea_title: string;
  customer_name?: string;
  provider?: MobileMoneyProvider;
}

export interface PaymentLink {
  provider: MobileMoneyProvider;
  link: string;
  instructions: string;
  qr_code_data?: string;
}

/**
 * Generate mobile money payment link
 * 
 * For now, generates instructions and deep links
 * In production, integrate with actual mobile money APIs
 */
export function generateMobileMoneyLink(params: PaymentLinkParams): PaymentLink {
  const { amount, idea_id, idea_title, customer_name, provider = 'm-wallet' } = params;

  // Generate unique payment reference
  const paymentRef = `FV-${idea_id.substring(0, 8)}-${Date.now().toString(36).toUpperCase()}`;

  switch (provider) {
    case 'm-wallet':
      return {
        provider: 'm-wallet',
        link: `https://m-wallet.ma/pay?amount=${amount}&ref=${paymentRef}&desc=${encodeURIComponent(idea_title)}`,
        instructions: `Pour payer ${amount} DH via M-Wallet:
1. Ouvre l'app M-Wallet
2. Va dans "Paiement"
3. Scanne le QR code ou entre le montant: ${amount} DH
4. Référence: ${paymentRef}`,
        qr_code_data: `m-wallet:${amount}:${paymentRef}:${idea_title}`,
      };

    case 'orange-money':
      return {
        provider: 'orange-money',
        link: `*144*${amount}*${paymentRef}#`,
        instructions: `Pour payer ${amount} DH via Orange Money:
1. Compose *144*${amount}*${paymentRef}#
2. Suis les instructions
3. Confirme le paiement`,
        qr_code_data: `orange-money:${amount}:${paymentRef}:${idea_title}`,
      };

    case 'cih-bank':
      return {
        provider: 'cih-bank',
        link: `https://cihbank.ma/pay?amount=${amount}&ref=${paymentRef}`,
        instructions: `Pour payer ${amount} DH via CIH Bank:
1. Ouvre l'app CIH Bank
2. Va dans "Paiements"
3. Entre le montant: ${amount} DH
4. Référence: ${paymentRef}`,
        qr_code_data: `cih-bank:${amount}:${paymentRef}:${idea_title}`,
      };

    case 'attijariwafa':
      return {
        provider: 'attijariwafa',
        link: `https://attijariwafa.ma/pay?amount=${amount}&ref=${paymentRef}`,
        instructions: `Pour payer ${amount} DH via Attijariwafa:
1. Ouvre l'app Attijariwafa
2. Va dans "Paiements"
3. Entre le montant: ${amount} DH
4. Référence: ${paymentRef}`,
        qr_code_data: `attijariwafa:${amount}:${paymentRef}:${idea_title}`,
      };

    default:
      return generateMobileMoneyLink({ ...params, provider: 'm-wallet' });
  }
}

/**
 * Generate payment link for idea validation
 * Default: 3 DH (as per assembly framework)
 */
export function generateValidationPaymentLink(
  idea_id: string,
  idea_title: string,
  customer_name?: string,
  amount: number = 3
): PaymentLink {
  return generateMobileMoneyLink({
    amount,
    idea_id,
    idea_title,
    customer_name,
    provider: 'm-wallet', // Default to M-Wallet (most common)
  });
}

/**
 * Get all available payment providers
 */
export function getAvailableProviders(): Array<{
  code: MobileMoneyProvider;
  name: string;
  icon: string;
}> {
  return [
    { code: 'm-wallet', name: 'M-Wallet', icon: '📱' },
    { code: 'orange-money', name: 'Orange Money', icon: '🟠' },
    { code: 'cih-bank', name: 'CIH Bank', icon: '🏦' },
    { code: 'attijariwafa', name: 'Attijariwafa', icon: '🏦' },
  ];
}

