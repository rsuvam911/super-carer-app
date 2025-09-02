"use client";

import React, { useState, useEffect } from 'react';
import { stripeService, PaymentMethodResult } from '@/services/stripeService';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CheckCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethodCardProps {
    paymentMethod: PaymentMethodResult;
    isDefault?: boolean;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
}

function PaymentMethodCard({ paymentMethod, isDefault, onDelete, onSetDefault }: PaymentMethodCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSettingDefault, setIsSettingDefault] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this payment method?')) {
            return;
        }

        setIsDeleting(true);
        try {
            await stripeService.deletePaymentMethod(paymentMethod.id);
            toast.success('Payment method deleted successfully');
            onDelete(paymentMethod.id);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete payment method');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSetDefault = async () => {
        setIsSettingDefault(true);
        try {
            await stripeService.setDefaultPaymentMethod(paymentMethod.id);
            toast.success('Default payment method updated');
            onSetDefault(paymentMethod.id);
        } catch (error: any) {
            toast.error(error.message || 'Failed to set default payment method');
        } finally {
            setIsSettingDefault(false);
        }
    };

    const getCardIcon = (brand: string) => {
        switch (brand?.toLowerCase()) {
            case 'visa':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#2D3A9E" />
                        <path d="M9 16H15V8H9V16Z" fill="#FFFFFF" />
                    </svg>
                );
            case 'mastercard':
                return (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                        {paymentMethod.card ? getCardIcon(paymentMethod.card.brand) : <CreditCard className="w-6 h-6" />}
                    </div>
                    <div>
                        <h4 className="font-medium">
                            {paymentMethod.card ?
                                `${paymentMethod.card.brand.charAt(0).toUpperCase() + paymentMethod.card.brand.slice(1)} ending in ${paymentMethod.card.last4}` :
                                `${paymentMethod.type} payment method`
                            }
                        </h4>
                        <p className="text-sm text-gray-500">
                            {paymentMethod.card ?
                                `Expires ${paymentMethod.card.exp_month.toString().padStart(2, '0')}/${paymentMethod.card.exp_year}` :
                                'Payment method'
                            }
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
                            {isSettingDefault ? 'Setting...' : 'Set Default'}
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

export function PaymentMethodsList({ refreshTrigger, onPaymentMethodsChange }: PaymentMethodsListProps) {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState<string | null>(null);

    const loadPaymentMethods = async () => {
        try {
            setLoading(true);
            const methods = await stripeService.getPaymentMethods();
            setPaymentMethods(methods);
            onPaymentMethodsChange?.(methods.length);

            // Find default payment method (this would come from your API)
            // For now, assume the first one is default
            if (methods.length > 0) {
                setDefaultPaymentMethodId(methods[0].id);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPaymentMethods();
    }, [refreshTrigger]);

    const handleDelete = (deletedId: string) => {
        setPaymentMethods(prev => {
            const updated = prev.filter(pm => pm.id !== deletedId);
            onPaymentMethodsChange?.(updated.length);
            return updated;
        });

        if (defaultPaymentMethodId === deletedId && paymentMethods.length > 1) {
            // Set a new default if the deleted one was default
            const remaining = paymentMethods.filter(pm => pm.id !== deletedId);
            if (remaining.length > 0) {
                setDefaultPaymentMethodId(remaining[0].id);
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
                    <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
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
            {paymentMethods.map((method) => (
                <PaymentMethodCard
                    key={method.id}
                    paymentMethod={method}
                    isDefault={method.id === defaultPaymentMethodId}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                />
            ))}
        </div>
    );
}