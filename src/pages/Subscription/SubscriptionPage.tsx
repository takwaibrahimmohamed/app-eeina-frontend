import React, { useState } from "react";
import { SubscriptionOverview } from "./components/SubscriptionOverview";
import { SubscriptionActions } from "./components/SubscriptionActions";
import { PaymentMethods } from "./components/PaymentMethods";
import { BillingHistory } from "./components/BillingHistory";
import { Subscription, Plan, PaymentMethod, Invoice } from "./types";
import { toast } from "sonner";

// Mock Data
const MOCK_PLAN: Plan = {
  id: "price_premium_monthly",
  name: "Premium Plan",
  price: 9.99,
  currency: "USD",
  interval: "month",
  features: ["Unlimited Recipes", "Meal Planning", "Nutritional Analysis"],
};

const MOCK_SUBSCRIPTION: Subscription = {
  id: "sub_123456",
  planId: "price_premium_monthly",
  status: "active",
  currentPeriodStart: "2023-12-01T00:00:00Z",
  currentPeriodEnd: "2024-01-01T00:00:00Z",
  cancelAtPeriodEnd: false,
  nextPaymentDate: "2024-01-01T00:00:00Z",
};

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm_1",
    type: "card",
    brand: "Visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: "pm_2",
    type: "card",
    brand: "Mastercard",
    last4: "5555",
    expiryMonth: 10,
    expiryYear: 2024,
    isDefault: false,
  },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: "in_1",
    number: "INV-001",
    date: "2023-12-01T00:00:00Z",
    status: "paid",
    amount: 9.99,
    currency: "USD",
    pdfUrl: "#",
    items: [{ description: "Premium Plan - Monthly", amount: 9.99 }],
  },
  {
    id: "in_2",
    number: "INV-002",
    date: "2023-11-01T00:00:00Z",
    status: "paid",
    amount: 9.99,
    currency: "USD",
    pdfUrl: "#",
    items: [{ description: "Premium Plan - Monthly", amount: 9.99 }],
  },
];

export const SubscriptionPage: React.FC = () => {
  const [subscription, setSubscription] =
    useState<Subscription>(MOCK_SUBSCRIPTION);
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [isLoading, setIsLoading] = useState(false);

  const simulateApiCall = async (ms = 1000) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, ms));
    setIsLoading(false);
  };

  const handleUpgrade = async () => {
    if (window.confirm("Confirm upgrade to Pro Plan?")) {
      await simulateApiCall();
      setSubscription((prev) => ({
        ...prev,
        planId: "price_pro_monthly",
        status: "active",
      }));
      toast.success("Successfully upgraded to Pro Plan!");
    }
  };

  const handleDowngrade = async () => {
    if (
      window.confirm(
        "Are you sure you want to downgrade? You will lose premium features at the end of the period."
      )
    ) {
      await simulateApiCall();
      setSubscription((prev) => ({
        ...prev,
        cancelAtPeriodEnd: true,
      }));
      toast.success("Downgrade scheduled for end of billing period.");
    }
  };

  const handleSwitchCycle = async () => {
    await simulateApiCall();
    toast.success("Billing cycle switched to Yearly.");
  };

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      await simulateApiCall();
      setSubscription((prev) => ({
        ...prev,
        cancelAtPeriodEnd: true,
        status: "cancel_at_period_end",
      }));
      toast.success("Subscription scheduled for cancellation.");
    }
  };

  const handleReactivate = async () => {
    await simulateApiCall();
    setSubscription((prev) => ({
      ...prev,
      cancelAtPeriodEnd: false,
      status: "active",
    }));
    toast.success("Subscription reactivated!");
  };

  const handleRetryPayment = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: "Retrying payment...",
      success: "Payment successful! Subscription active.",
      error: "Payment failed. Please check your payment method.",
    });
    // Simulate success after delay
    setTimeout(() => {
      setSubscription((prev) => ({ ...prev, status: "active" }));
    }, 2000);
  };

  const handleAddPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: "card",
      brand: "Visa",
      last4: Math.floor(1000 + Math.random() * 9000).toString(),
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: false,
    };
    setPaymentMethods((prev) => [...prev, newMethod]);
    toast.success("New payment method added");
  };

  const handleRemovePaymentMethod = (id: string) => {
    if (paymentMethods.length <= 1) {
      toast.error("You must have at least one payment method.");
      return;
    }
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
    toast.success("Payment method removed.");
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    );
    toast.success("Default payment method updated.");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Subscription & Billing
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your plan, payment methods, and invoices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-green-700">
              System Operational
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <SubscriptionOverview
              subscription={subscription}
              plan={MOCK_PLAN}
            />
            <SubscriptionActions
              subscription={subscription}
              onUpgrade={handleUpgrade}
              onDowngrade={handleDowngrade}
              onSwitchCycle={handleSwitchCycle}
              onCancel={handleCancel}
              onReactivate={handleReactivate}
              onRetryPayment={handleRetryPayment}
            />
            <BillingHistory invoices={invoices} />
          </div>

          <div className="xl:col-span-1">
            <PaymentMethods
              paymentMethods={paymentMethods}
              onAddMethod={handleAddPaymentMethod}
              onRemoveMethod={handleRemovePaymentMethod}
              onSetDefault={handleSetDefaultPaymentMethod}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
