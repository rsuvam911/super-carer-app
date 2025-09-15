import { loadStripe } from "@stripe/stripe-js";
import apiclient from "./apiService";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export interface SetupIntentResult {
  client_secret: string;
  setup_intent_id?: string;
}

export interface AddPaymentMethodRequest {
  paymentMethodId: string;
  isDefault?: boolean;
}

export interface PaymentMethodResult {
  paymentMethodId: string;
  cardBrand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  // Keep legacy fields for backward compatibility
  id?: string;
  type?: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export class StripeService {
  private static instance: StripeService;

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Step 1: Create a SetupIntent and get client secret from server
   */
  async createSetupIntent(): Promise<SetupIntentResult> {
    try {
      const response = await apiclient.post("/payment/setup-intent");
      console.log(response.data);
      return {
        client_secret: response.data.payload.clientSecret,
        setup_intent_id: response.data.setup_intent_id,
      };
    } catch (error) {
      console.error("Error creating SetupIntent:", error);
      throw new Error("Failed to create payment setup. Please try again.");
    }
  }

  /**
   * Step 2: Confirm SetupIntent using stripe.confirmCardSetup to get payment_method ID
   */
  async confirmCardSetup(
    stripe: any,
    clientSecret: string,
    cardElement: any
  ): Promise<{ paymentMethodId?: string; error?: any }> {
    try {
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      // Confirm the SetupIntent with the card element
      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        console.error("Card setup confirmation error:", error);
        return { error };
      }

      if (
        setupIntent &&
        setupIntent.status === "succeeded" &&
        setupIntent.payment_method
      ) {
        return { paymentMethodId: setupIntent.payment_method as string };
      }

      return { error: { message: "Setup intent did not succeed" } };
    } catch (error) {
      console.error("Error confirming card setup:", error);
      return {
        error: { message: "Failed to save payment method. Please try again." },
      };
    }
  }

  /**
   * Step 3: Add payment method to server with paymentMethodId
   */
  async addPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const response = await apiclient.post("/payment/add-method", {
        paymentMethodId,
      });
      if (response.status === 200) {
        console.log("Payment method added successfully!");
      } else {
        console.error("Error adding payment method to server:", response.data);
        throw new Error("Failed to save payment method. Please try again.");
      }
    } catch (error) {
      console.error("Error adding payment method to server:", error);
      throw new Error("Failed to save payment method. Please try again.");
    }
  }

  /**
   * Complete flow: Create setup intent, confirm with Stripe, and save to server
   */
  async addNewPaymentMethod(
    stripe: any,
    cardElement: any,
    isDefault: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Step 1: Get client secret from server
      const setupResult = await this.createSetupIntent();

      // Step 2: Confirm card setup with Stripe
      const { paymentMethodId, error } = await this.confirmCardSetup(
        stripe,
        setupResult.client_secret,
        cardElement
      );

      if (error || !paymentMethodId) {
        return {
          success: false,
          error: error?.message || "Failed to process payment method",
        };
      }

      // Step 3: Save payment method to server
      await this.addPaymentMethod(paymentMethodId);

      return { success: true };
    } catch (error: any) {
      console.error("Error in complete payment method flow:", error);
      return {
        success: false,
        error:
          error.message || "Failed to add payment method. Please try again.",
      };
    }
  }

  /**
   * Get customer's saved payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethodResult[]> {
    try {
      const response = await apiclient.get("/payment/methods");
      // Updated to use the new API response structure
      return response.data.payload || [];
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      throw new Error("Failed to load payment methods. Please try again.");
    }
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiclient.delete(`/payment/methods/${paymentMethodId}`);
    } catch (error) {
      console.error("Error deleting payment method:", error);
      throw new Error("Failed to delete payment method. Please try again.");
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiclient.post(`/payment/methods/${paymentMethodId}/set-default`);
    } catch (error) {
      console.error("Error setting default payment method:", error);
      throw new Error(
        "Failed to set default payment method. Please try again."
      );
    }
  }

  /**
   * Get Stripe instance for direct usage
   */
  async getStripe() {
    return await stripePromise;
  }
}

export const stripeService = StripeService.getInstance();
