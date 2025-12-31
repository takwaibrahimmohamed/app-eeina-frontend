import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Subscription } from "../types";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  XCircle,
  Power,
  CreditCard,
  Settings2,
} from "lucide-react";

interface SubscriptionActionsProps {
  subscription: Subscription;
  onUpgrade: () => void;
  onDowngrade: () => void;
  onSwitchCycle: () => void;
  onCancel: () => void;
  onReactivate: () => void;
  onRetryPayment?: () => void;
}

export const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({
  subscription,
  onUpgrade,
  onDowngrade,
  onSwitchCycle,
  onCancel,
  onReactivate,
  onRetryPayment,
}) => {
  return (
    <Card className="shadow-sm border border-gray-100">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-gray-400" />
          Subscription Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          {subscription.status === "past_due" && (
            <Button
              onClick={onRetryPayment}
              className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm"
            >
              <CreditCard className="mr-2 h-4 w-4" /> Retry Payment
            </Button>
          )}

          {(subscription.status === "active" ||
            subscription.status === "trialing") && (
            <>
              {/* Upgrade Button - Primary Action */}
              <Button
                onClick={onUpgrade}
                className="bg-primaryColor hover:bg-primaryColor/90 text-white shadow-sm"
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade Plan
              </Button>

              {/* Downgrade Button - Secondary */}
              <Button
                onClick={onDowngrade}
                variant="outline"
                className="border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                <ArrowDownCircle className="mr-2 h-4 w-4" /> Downgrade
              </Button>

              {/* Switch Cycle - Secondary */}
              <Button
                onClick={onSwitchCycle}
                variant="outline"
                className="border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Switch Billing Cycle
              </Button>

              {/* Cancel - Destructive */}
              {!subscription.cancelAtPeriodEnd && (
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                >
                  <XCircle className="mr-2 h-4 w-4" /> Cancel Subscription
                </Button>
              )}

              {/* Reactivate - Success Action */}
              {subscription.cancelAtPeriodEnd && (
                <Button
                  onClick={onReactivate}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-sm ml-auto"
                >
                  <Power className="mr-2 h-4 w-4" /> Reactivate Subscription
                </Button>
              )}
            </>
          )}

          {/* Inactive State Reactivation */}
          {!(
            subscription.status === "active" ||
            subscription.status === "trialing"
          ) && (
            <Button
              onClick={onReactivate}
              className="bg-primaryColor hover:bg-primaryColor/90 text-white shadow-sm w-full sm:w-auto"
            >
              <Power className="mr-2 h-4 w-4" /> Reactivate Subscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
