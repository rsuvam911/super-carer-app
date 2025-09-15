"use client";

import React, { useState, useEffect } from "react";
import { stripeService, PaymentMethodResult } from "@/services/stripeService";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethodResult;
  isDefault?: boolean;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

function PaymentMethodCard({
  paymentMethod,
  isDefault,
  onDelete,
  onSetDefault,
}: PaymentMethodCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    const methodId = paymentMethod.paymentMethodId || paymentMethod.id;
    if (!methodId) {
      toast.error("Payment method ID not found");
      return;
    }

    setIsDeleting(true);
    try {
      await stripeService.deletePaymentMethod(methodId);
      toast.success("Payment method deleted successfully");
      onDelete(methodId);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete payment method");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async () => {
    const methodId = paymentMethod.paymentMethodId || paymentMethod.id;
    if (!methodId) {
      toast.error("Payment method ID not found");
      return;
    }

    setIsSettingDefault(true);
    try {
      await stripeService.setDefaultPaymentMethod(methodId);
      toast.success("Default payment method updated");
      onSetDefault(methodId);
    } catch (error: any) {
      toast.error(error.message || "Failed to set default payment method");
    } finally {
      setIsSettingDefault(false);
    }
  };

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case "visa":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="4" fill="#2D3A9E" />
            <path d="M9 16H15V8H9V16Z" fill="#FFFFFF" />
          </svg>
        );
      case "mastercard":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="24" height="24" rx="4" fill="#1A56DB" />
            <path
              d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
              fill="#FF5F00"
            />
          </svg>
        );
      default:
        return <CreditCard className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
            {/* Handle both new and old API structures */}
            {getCardIcon(paymentMethod.cardBrand || paymentMethod.card?.brand)}
          </div>
          <div>
            <h4 className="font-medium">
              {/* Handle both new and old API structures */}
              {(() => {
                const cardBrand =
                  paymentMethod.cardBrand || paymentMethod.card?.brand;
                const last4 = paymentMethod.last4 || paymentMethod.card?.last4;

                if (cardBrand && last4) {
                  const capitalizedBrand =
                    cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1);
                  return `${capitalizedBrand} ending in ${last4}`;
                }

                return `${paymentMethod.type || "Card"} payment method`;
              })()}
            </h4>
            <p className="text-sm text-gray-500">
              {/* Handle both new and old API structures */}
              {(() => {
                const expMonth =
                  paymentMethod.expMonth || paymentMethod.card?.exp_month;
                const expYear =
                  paymentMethod.expYear || paymentMethod.card?.exp_year;

                if (expMonth && expYear) {
                  return `Expires ${expMonth
                    .toString()
                    .padStart(2, "0")}/${expYear}`;
                }

                return "Payment method";
              })()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isDefault && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Default
            </span>
          )}
          {!isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetDefault}
              disabled={isSettingDefault}
              className="text-xs"
            >
              {isSettingDefault ? "Setting..." : "Set Default"}
            </Button>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface PaymentMethodsListProps {
  refreshTrigger?: number;
  onPaymentMethodsChange?: (count: number) => void;
}

export function PaymentMethodsList({
  refreshTrigger,
  onPaymentMethodsChange,
}: PaymentMethodsListProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResult[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<
    string | null
  >(null);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await stripeService.getPaymentMethods();
      setPaymentMethods(methods);
      onPaymentMethodsChange?.(methods.length);

      // Find default payment method from the API response
      const defaultMethod = methods.find((method) => method.isDefault);
      if (defaultMethod) {
        const defaultId = defaultMethod.paymentMethodId || defaultMethod.id;
        if (defaultId) {
          setDefaultPaymentMethodId(defaultId);
        }
      } else if (methods.length > 0) {
        // Fallback to first method if no default is specified
        const firstId = methods[0].paymentMethodId || methods[0].id;
        if (firstId) {
          setDefaultPaymentMethodId(firstId);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [refreshTrigger]);

  const handleDelete = (deletedId: string) => {
    setPaymentMethods((prev) => {
      const updated = prev.filter(
        (pm) => (pm.paymentMethodId || pm.id) !== deletedId
      );
      onPaymentMethodsChange?.(updated.length);
      return updated;
    });

    if (defaultPaymentMethodId === deletedId && paymentMethods.length > 1) {
      // Set a new default if the deleted one was default
      const remaining = paymentMethods.filter(
        (pm) => (pm.paymentMethodId || pm.id) !== deletedId
      );
      if (remaining.length > 0) {
        const newDefaultId = remaining[0].paymentMethodId || remaining[0].id;
        if (newDefaultId) {
          setDefaultPaymentMethodId(newDefaultId);
        } else {
          setDefaultPaymentMethodId(null);
        }
      } else {
        setDefaultPaymentMethodId(null);
      }
    }
  };

  const handleSetDefault = (newDefaultId: string) => {
    setDefaultPaymentMethodId(newDefaultId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center">
              <div className="w-12 h-8 bg-gray-200 rounded mr-3"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No payment methods added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paymentMethods.map((method, index) => {
        const methodId = method.paymentMethodId || method.id;
        // Use index as fallback key if methodId is undefined
        const key = methodId || `payment-method-${index}`;
        return (
          <PaymentMethodCard
            key={key}
            paymentMethod={method}
            isDefault={methodId === defaultPaymentMethodId}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        );
      })}
    </div>
  );
}
