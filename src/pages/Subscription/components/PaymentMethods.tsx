import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentMethod } from "../types";
import { CreditCard, Trash2, Plus, Lock } from "lucide-react";

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onAddMethod: () => void;
  onRemoveMethod: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentMethods,
  onAddMethod,
  onRemoveMethod,
  onSetDefault,
}) => {
  return (
    <Card className="shadow-sm border border-gray-100 h-full">
      <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-gray-400" />
          Payment Methods
        </CardTitle>
        <Button
          onClick={onAddMethod}
          size="sm"
          variant="ghost"
          className="text-primaryColor hover:text-primaryColor/80 hover:bg-primaryColor/5 h-8"
        >
          <Plus className="h-4 w-4 mr-1" /> Add New
        </Button>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`group relative flex items-center justify-between p-4 border rounded-xl transition-all ${
              method.isDefault
                ? "bg-primaryColor/5 border-primaryColor/20 ring-1 ring-primaryColor/10"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2.5 rounded-lg ${
                  method.isDefault
                    ? "bg-white text-primaryColor"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 capitalize">
                    {method.brand}{" "}
                    <span className="text-gray-400 text-sm font-normal">
                      • {method.last4}
                    </span>
                  </p>
                  {method.isDefault && (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-primaryColor bg-white border border-primaryColor/20 rounded-full uppercase tracking-wide">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Expires {method.expiryMonth}/{method.expiryYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!method.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSetDefault(method.id)}
                  className="text-xs text-gray-500 hover:text-primaryColor hover:bg-transparent"
                >
                  Set Default
                </Button>
              )}
              {/* Prevent deleting if it's the only one or default (unless logic allows) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveMethod(method.id)}
                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {paymentMethods.length === 0 && (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
            <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">
              No payment methods
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Add a card to process payments
            </p>
          </div>
        )}

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          <span>Payments secured with 256-bit encryption</span>
        </div>
      </CardContent>
    </Card>
  );
};
