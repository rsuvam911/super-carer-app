# Stripe Integration Fixes

## Issues Fixed

### 1. **Stripe Instance Mismatch Error**

**Problem**: `IntegrationError: Please use the same instance of Stripe you used to create this Element to create your Source or Token.`

**Root Cause**: The StripeService was creating its own Stripe instance using `stripePromise`, but the component was using a different instance from `useStripe()` hook.

**Solution**:

- Modified `confirmCardSetup()` method to accept the Stripe instance as a parameter
- Updated `addNewPaymentMethod()` to pass the Stripe instance from the component
- Component now passes `stripe` instance from `useStripe()` to the service

### 2. **Client Secret Format Issue**

**Problem**: `Missing value for stripe.confirmCardSetup intent secret: value should be a client_secret string.`

**Root Cause**: Server response structure was different than expected. Server returns:

```json
{
  "payload": {
    "clientSecret": "seti_1S2npgCimjiDNdcQX2W1h240_secret_..."
  }
}
```

**Solution**: Updated `createSetupIntent()` to extract client secret from correct path: `response.data.payload.clientSecret`

### 3. **API Endpoint Path Issues**

**Problem**: 404 errors for `/v1/payment/methods` endpoint

**Root Cause**: Service was using incorrect API paths with `/v1/` prefix

**Solution**: Updated all API endpoints to correct paths:

- `/payment/setup-intent` ✓
- `/payment/add-method` ✓
- `/payment/methods` ✓
- `/payment/methods/{id}` ✓
- `/payment/methods/{id}/set-default` ✓

### 4. **Missing isDefault Parameter Support**

**Problem**: The `isDefault` parameter wasn't being passed to the server

**Solution**:

- Updated `addPaymentMethod()` to accept `isDefault` parameter
- Modified the method to include `isDefault` in the request body
- Updated the complete flow to pass through the `isDefault` value

## Updated Code Flow

### Service Method Signature Changes

```typescript
// Before
async addNewPaymentMethod(cardElement: any, isDefault: boolean = false)

// After
async addNewPaymentMethod(stripe: any, cardElement: any, isDefault: boolean = false)
```

### Component Usage Update

```typescript
// Before
const result = await stripeService.addNewPaymentMethod(cardElement, isDefault);

// After
const result = await stripeService.addNewPaymentMethod(
  stripe,
  cardElement,
  isDefault
);
```

## Expected Server Response Format

The service now expects the server to return the setup intent in this format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment intent created successfully",
  "payload": {
    "clientSecret": "seti_1S2npgCimjiDNdcQX2W1h240_secret_SylMVVHhqAGjprRq2KRrHrObQhTNrkR"
  },
  "timestamp": "2025-09-02T06:36:44.85408Z"
}
```

## Files Modified

1. **`services/stripeService.ts`**:

   - Fixed client secret extraction path
   - Added Stripe instance parameter to methods
   - Added `isDefault` parameter support
   - Corrected all API endpoint paths

2. **`components/stripe-payment-method.tsx`**:
   - Updated to pass Stripe instance to service methods

## Test Steps

1. Navigate to `/client/payment`
2. Click "Add New Payment Method"
3. Enter test card details (4242424242424242)
4. Optionally check "Set as default"
5. Submit form
6. Verify no console errors
7. Check that payment method is saved successfully

The integration should now work correctly without the Stripe instance mismatch errors and properly communicate with the backend API.
