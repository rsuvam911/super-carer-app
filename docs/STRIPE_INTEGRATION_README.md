# Stripe Payment Method Integration

## Overview

This integration adds Stripe payment method functionality for client users in the Super Carer App. The implementation follows a 3-step process as requested:

1. **Client calls server** `baseUrl/payment/setup-intent` → gets client secret
2. **Client collects payment details** → `stripe.confirmCardSetup` confirms the SetupIntent → gets a payment_method ID
3. **Client calls server again** → passes `paymentMethodId` to `/payment/add-method`

## Required Dependencies

Before using this integration, install the required Stripe dependencies:

```bash
pnpm add @stripe/stripe-js @stripe/react-stripe-js stripe
```

## Environment Variables

Add your Stripe publishable key to your environment variables:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## API Endpoints

The frontend expects the following backend API endpoints:

### 1. Create Setup Intent

```
POST /payment/setup-intent
Response: {
  client_secret: string,
  setup_intent_id?: string
}
```

### 2. Add Payment Method

```
POST /payment/add-method
Body: {
  paymentMethodId: string,
  isDefault?: boolean
}
```

### 3. Get Payment Methods

```
GET /payment/methods
Response: {
  paymentMethods: [{
    id: string,
    type: string,
    card?: {
      brand: string,
      last4: string,
      exp_month: number,
      exp_year: number
    }
  }]
}
```

### 4. Delete Payment Method

```
DELETE /payment/methods/{paymentMethodId}
```

### 5. Set Default Payment Method

```
POST /payment/methods/{paymentMethodId}/set-default
```

## Implementation Details

### StripeService (`services/stripeService.ts`)

Main service class that handles:

- Creating setup intents
- Confirming card setup with Stripe
- Adding payment methods to server
- Complete payment method flow
- Managing existing payment methods

### StripePaymentMethods Component (`components/stripe-payment-method.tsx`)

React component wrapped with Stripe Elements that:

- Provides secure card input form
- Handles the complete payment method addition flow
- Shows loading states and error handling
- Supports setting payment method as default

### PaymentMethodsList Component (`components/payment-methods-list.tsx`)

Component for displaying and managing existing payment methods:

- Lists all saved payment methods
- Allows setting default payment method
- Supports deleting payment methods
- Shows card brand icons and details

### Client Payment Page (`app/client/payment/page.tsx`)

Updated to include role-based access:

- Shows Stripe integration for client users only
- Falls back to simple form for non-client users
- Integrates with existing payment page structure

## Usage

### For Client Users

1. Navigate to `/client/payment`
2. Click on "Payment Methods" tab
3. Click "Add New Payment Method"
4. Fill in card details using Stripe Elements
5. Optionally set as default payment method
6. Submit to save

### Role-Based Access

The payment method addition is only available for users with `userRole === "client"`. Provider users will see the fallback implementation.

## Security Features

- Secure card data handling through Stripe Elements
- Client-side confirmation with server-side verification
- Payment method tokens stored securely on Stripe's servers
- No sensitive card data stored in your application

## Error Handling

The integration includes comprehensive error handling:

- Network errors during API calls
- Stripe-specific errors (invalid cards, etc.)
- User-friendly error messages via toast notifications
- Loading states during all operations

## Testing

To test the integration:

1. Install dependencies: `pnpm add @stripe/stripe-js @stripe/react-stripe-js stripe`
2. Set up environment variable with Stripe test key
3. Implement the required backend API endpoints
4. Run the application: `pnpm dev`
5. Navigate to client payment page and test adding payment methods

Use Stripe test card numbers for testing:

- `4242424242424242` (Visa)
- `5555555555554444` (Mastercard)
- `4000000000000002` (Card declined)

## Next Steps

1. Implement the backend API endpoints
2. Set up Stripe webhook handlers for payment method events
3. Add payment method validation and business logic
4. Implement payment processing using saved payment methods
5. Add proper error logging and monitoring
