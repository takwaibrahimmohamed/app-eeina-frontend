export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'month' | 'year';
  features: string[];
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'cancel_at_period_end' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  nextPaymentDate: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  brand?: string; // e.g., 'visa', 'mastercard'
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  pdfUrl: string;
  items: {
    description: string;
    amount: number;
  }[];
}
