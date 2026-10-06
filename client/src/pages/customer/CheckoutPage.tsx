import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building,
  MapPin,
  Plus,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/auth.api';
import { ordersApi } from '../../api/orders.api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

const addressFormSchema = z.object({
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State / Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().default('United States'),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

export const CheckoutPage: React.FC = () => {
  const { cart, appliedCoupon, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [shippingOption, setShippingOption] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<'DEMO_PAYMENT' | 'CREDIT_CARD' | 'CASH_ON_DELIVERY'>('CREDIT_CARD');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Credit Card Form simulator states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardHolder, setCardHolder] = useState('SARAH JENKINS');

  // Fetch saved user addresses
  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => authApi.getAddresses(),
    enabled: isAuthenticated,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
    },
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId && !isAddingNewAddress) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    } else if (addresses.length === 0) {
      setIsAddingNewAddress(true);
    }
  }, [addresses]);

  const items = cart?.items || [];
  const subtotal = cart?.summary.subtotal || 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Number((taxableSubtotal * 0.08).toFixed(2));
  const shippingFee = shippingOption === 'EXPRESS' ? 14.99 : subtotal >= 100 ? 0 : 9.99;
  const total = Number((taxableSubtotal + tax + shippingFee).toFixed(2));

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link to="/products">
          <Button size="sm">Explore Products</Button>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (newAddressData?: AddressFormData) => {
    if (!isAuthenticated) {
      toastError('Please sign in or create an account to finalize your order.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    try {
      setIsSubmittingOrder(true);

      const payload: any = {
        paymentMethod,
        shippingOption,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };

      if (isAddingNewAddress && newAddressData) {
        payload.newAddress = newAddressData;
      } else if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        toastError('Please select or enter a shipping address');
        setIsSubmittingOrder(false);
        return;
      }

      const order = await ordersApi.createOrder(payload);
      await clearCart();
      success('Order placed successfully!');
      navigate(`/order-success/${order.id}`, { state: { order } });
    } catch (err: any) {
      toastError(err.message || 'Failed to place order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout & Order Confirmation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your delivery details and choose your simulated payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Steps Container */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. SHIPPING ADDRESS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900">Delivery Address</h3>
              </div>

              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  {isAddingNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                </button>
              )}
            </div>

            {!isAddingNewAddress && addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                            {addr.city}, {addr.state}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">{addr.street}</p>
                        <p className="text-xs text-slate-500">
                          {addr.postalCode}, {addr.country}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <form id="address-form" onSubmit={handleSubmit(handlePlaceOrder)} className="space-y-4">
                <Input
                  label="Street Address"
                  placeholder="742 Evergreen Terrace"
                  error={errors.street?.message}
                  {...register('street')}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Input
                    label="City"
                    placeholder="Springfield"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Input
                    label="State / Province"
                    placeholder="OR"
                    error={errors.state?.message}
                    {...register('state')}
                  />
                  <Input
                    label="Postal Code"
                    placeholder="97477"
                    error={errors.postalCode?.message}
                    {...register('postalCode')}
                  />
                </div>
              </form>
            )}
          </div>

          {/* 2. SHIPPING METHOD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Shipping Speed</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setShippingOption('STANDARD')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                  shippingOption === 'STANDARD'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Standard Tracked Delivery
                  </span>
                  <span className="text-[11px] text-slate-500 block">3 - 5 Business Days</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {subtotal >= 100 ? 'FREE' : '$9.99'}
                </span>
              </div>

              <div
                onClick={() => setShippingOption('EXPRESS')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                  shippingOption === 'EXPRESS'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">
                    Express Priority Air
                  </span>
                  <span className="text-[11px] text-slate-500 block">1 - 2 Business Days</span>
                </div>
                <span className="text-xs font-bold text-indigo-600">$14.99</span>
              </div>
            </div>
          </div>

          {/* 3. PAYMENT METHOD SIMULATOR */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900">Payment Simulation</h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Sandbox Mode
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DEMO_PAYMENT')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'DEMO_PAYMENT'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>1-Click Fast Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Cash on Delivery</span>
              </button>
            </div>

            {/* Card Simulator UI */}
            {paymentMethod === 'CREDIT_CARD' && (
              <div className="space-y-4 pt-2">
                {/* Virtual Card Graphic */}
                <div className="w-full max-w-sm mx-auto h-44 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-white p-5 flex flex-col justify-between shadow-xl border border-indigo-800/40 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold tracking-widest text-indigo-300 uppercase">
                      Nexa Platinum
                    </span>
                    <CreditCard className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="text-lg font-mono tracking-widest text-slate-100">
                    {cardNumber}
                  </div>
                  <div className="flex justify-between items-end text-[10px] uppercase text-indigo-200 font-semibold">
                    <div>
                      <span className="block text-[8px] text-indigo-400">Cardholder</span>
                      <span>{cardHolder}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-indigo-400">Expires</span>
                      <span>{cardExpiry}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">CVC Code</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-28">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h3>

          {/* Mini Items Carousel / List */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-xs">
                <img
                  src={item.product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-slate-400 text-[11px]">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-slate-900">${item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Due</span>
              <span className="text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {isAddingNewAddress ? (
            <Button
              type="submit"
              form="address-form"
              variant="primary"
              size="lg"
              className="w-full justify-between"
              isLoading={isSubmittingOrder}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Place & Pay ${total.toFixed(2)}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handlePlaceOrder()}
              variant="primary"
              size="lg"
              className="w-full justify-between"
              isLoading={isSubmittingOrder}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Place & Pay ${total.toFixed(2)}
            </Button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit encrypted checkout simulator</span>
          </div>
        </div>
      </div>
    </div>
  );
};
