"use client";

import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripeService } from '@/services/stripeService';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#1f2937',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#9ca3af',
            },
            iconColor: '#6b7280',
        },
        invalid: {
            iconColor: '#ef4444',
            color: '#ef4444',
        },
        complete: {
            iconColor: '#10b981',
        },
    },
    hidePostalCode: false,
};

interface AddPaymentMethodFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

function AddPaymentMethodForm({ onSuccess, onCancel }: AddPaymentMethodFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [isDefault, setIsDefault] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            toast.error('Payment system not ready. Please try again.');
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            toast.error('Card information not found. Please try again.');
            return;
        }

        setIsLoading(true);

        try {
            // Use the complete flow from stripeService
            const result = await stripeService.addNewPaymentMethod(stripe, cardElement, isDefault);

            if (result.success) {
                toast.success('Payment method added successfully!');
                onSuccess();
            } else {
                toast.error(result.error || 'Failed to add payment method. Please try again.');
            }
        } catch (error: any) {
            console.error('Error in payment method setup:', error);
            toast.error(error.message || 'Failed to add payment method. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Payment Method</h3>
                <p className="text-gray-600">Securely add a new payment method to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-[#00C2CB]" />
                                Card Information
                            </div>
                        </label>
                        <div className="relative">
                            <div className="border-2 border-gray-200 rounded-xl p-4 transition-all duration-200 focus-within:border-[#00C2CB] focus-within:ring-4 focus-within:ring-[#00C2CB]/10 hover:border-gray-300">
                                <CardElement options={CARD_ELEMENT_OPTIONS} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <input
                            id="default-card"
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="h-4 w-4 text-[#00C2CB] focus:ring-[#00C2CB] border-gray-300 rounded transition-colors duration-200"
                        />
                        <label htmlFor="default-card" className="ml-3 flex items-center">
                            <span className="text-sm font-medium text-gray-700">
                                Set as default payment method
                            </span>
                            <div className="ml-2 group relative">
                                <svg className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                    This will be used for future payments
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!stripe || isLoading}
                        className="px-8 py-2.5 bg-gradient-to-r from-[#00C2CB] to-[#00b0b9] hover:from-[#00b0b9] hover:to-[#009da5] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Add Payment Method
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Security badge */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secured by Stripe • Your payment information is encrypted and secure
                </div>
            </div>
        </div>
    );
}

interface StripePaymentMethodsProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function StripePaymentMethods({ onSuccess, onCancel }: StripePaymentMethodsProps) {
    const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

    useEffect(() => {
        // Initialize Stripe
        const initStripe = async () => {
            const stripe = await stripeService.getStripe();
            setStripePromise(Promise.resolve(stripe));
        };

        initStripe();
    }, []);

    if (!stripePromise) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-[#00C2CB]/20 border-t-[#00C2CB] rounded-full animate-spin"></div>
                        <CreditCard className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#00C2CB]" />
                    </div>
                    <p className="mt-4 text-gray-600 font-medium">Loading secure payment system...</p>
                    <p className="mt-1 text-sm text-gray-500">Powered by Stripe</p>
                </div>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise}>
            <AddPaymentMethodForm onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
    );
}