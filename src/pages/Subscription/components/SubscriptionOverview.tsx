import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Subscription, Plan } from "../types";
import {
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface SubscriptionOverviewProps {
  subscription: Subscription;
  plan: Plan;
}

export const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = ({
  subscription,
  plan,
}) => {
  // const { t } = useLanguage();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          color: "bg-green-100 text-green-700",
          label: "Active",
          border: "border-green-200",
        };
      case "trialing":
        return {
          color: "bg-blue-100 text-blue-700",
          label: "Trialing",
          border: "border-blue-200",
        };
      case "past_due":
        return {
          color: "bg-red-100 text-red-700",
          label: "Past Due",
          border: "border-red-200",
        };
      case "canceled":
      case "expired":
        return {
          color: "bg-gray-100 text-gray-700",
          label: "Canceled",
          border: "border-gray-200",
        };
      case "cancel_at_period_end":
        return {
          color: "bg-yellow-100 text-yellow-700",
          label: "Canceling",
          border: "border-yellow-200",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-700",
          label: status,
          border: "border-gray-200",
        };
    }
  };

  const statusConfig = getStatusConfig(subscription.status);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <Card className="shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primaryColor/5 p-6 border-b border-primaryColor/10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-primaryColor flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Current Plan
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-gray-900">{plan.name}</h2>
              <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide text-gray-500 border border-gray-200">
                {plan.interval}ly
              </span>
            </div>
          </div>
          <Badge
            className={`${statusConfig.color} ${statusConfig.border} border px-3 py-1 text-sm shadow-none`}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          {/* Price */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">
                Recurring Price
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {plan.currency.toUpperCase()} {plan.price.toFixed(2)}{" "}
                <span className="text-sm font-normal text-gray-400">
                  / {plan.interval}
                </span>
              </p>
            </div>
          </div>

          {/* Next Payment */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">
                Next Payment
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {subscription.cancelAtPeriodEnd
                  ? "No upcoming payment"
                  : formatDate(subscription.nextPaymentDate)}
              </p>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">
                Member Since
              </p>
              <p className="text-base font-medium text-gray-700">
                {formatDate(subscription.currentPeriodStart)}
              </p>
            </div>
          </div>

          {/* Auto Renew */}
          <div className="flex items-start gap-4">
            <div
              className={`p-2.5 rounded-lg ${
                subscription.cancelAtPeriodEnd
                  ? "bg-yellow-50 text-yellow-500"
                  : "bg-green-50 text-green-500"
              }`}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">
                Auto-Renewal
              </p>
              <p
                className={`text-base font-medium ${
                  subscription.cancelAtPeriodEnd
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {subscription.cancelAtPeriodEnd
                  ? "Disabled (Cancels at end of period)"
                  : "Active"}
              </p>
            </div>
          </div>
        </div>

        {subscription.status === "trialing" && subscription.trialEnd && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Your Free Trial is Active
                </p>
                <p className="text-xs text-blue-700">
                  Enjoying the premium features?
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {Math.ceil(
                  (new Date(subscription.trialEnd).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                Days Left
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
