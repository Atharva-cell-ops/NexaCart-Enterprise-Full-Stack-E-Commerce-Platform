import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, Product, CouponValidation } from '../types';
import { cartApi } from '../api/cart.api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  appliedCoupon: CouponValidation | null;
  itemCount: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

  // Local state for guest cart if unauthenticated
  const [guestItems, setGuestItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nexacart_guest_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const calculateGuestSummary = (items: CartItem[]) => {
    const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
    const tax = Number((subtotal * 0.08).toFixed(2));
    const freeShippingThreshold = 100;
    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 9.99;
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const total = Number((Math.max(0, subtotal - discount) + tax + shippingFee).toFixed(2));

    return {
      id: 'guest-cart',
      items,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      summary: {
        subtotal: Number(subtotal.toFixed(2)),
        tax,
        shippingFee,
        freeShippingThreshold,
        amountNeededForFreeShipping: Math.max(0, Number((freeShippingThreshold - subtotal).toFixed(2))),
        total,
      },
    };
  };

  const refreshCart = async () => {
    if (isAuthenticated) {
      try {
        const serverCart = await cartApi.getCart();
        setCart(serverCart);
      } catch (err) {
        console.error('Failed to load user cart:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCart(calculateGuestSummary(guestItems));
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated, guestItems, appliedCoupon]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      if (isAuthenticated) {
        const updated = await cartApi.addItem(product.id, quantity);
        setCart(updated);
      } else {
        // Guest cart
        setGuestItems((prev) => {
          const discountedPrice =
            product.discountPercent > 0
              ? Number((product.price * (1 - product.discountPercent / 100)).toFixed(2))
              : product.price;

          const existingIndex = prev.findIndex((item) => item.productId === product.id);
          let newItems = [...prev];

          if (existingIndex > -1) {
            const newQty = newItems[existingIndex].quantity + quantity;
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newQty,
              lineTotal: Number((discountedPrice * newQty).toFixed(2)),
            };
          } else {
            const newItem: CartItem = {
              id: `guest-item-${Date.now()}`,
              productId: product.id,
              quantity,
              product: {
                ...product,
                discountedPrice,
              },
              lineTotal: Number((discountedPrice * quantity).toFixed(2)),
            };
            newItems.push(newItem);
          }
          localStorage.setItem('nexacart_guest_cart', JSON.stringify(newItems));
          return newItems;
        });
      }
      success(`Added ${product.name} to cart`);
      openDrawer();
    } catch (err: any) {
      toastError(err.message || 'Failed to add item to cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      if (isAuthenticated) {
        const updated = await cartApi.updateItem(itemId, quantity);
        setCart(updated);
      } else {
        setGuestItems((prev) => {
          const newItems = prev.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                quantity,
                lineTotal: Number((item.product.discountedPrice * quantity).toFixed(2)),
              };
            }
            return item;
          });
          localStorage.setItem('nexacart_guest_cart', JSON.stringify(newItems));
          return newItems;
        });
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      if (isAuthenticated) {
        const updated = await cartApi.removeItem(itemId);
        setCart(updated);
      } else {
        setGuestItems((prev) => {
          const newItems = prev.filter((item) => item.id !== itemId);
          localStorage.setItem('nexacart_guest_cart', JSON.stringify(newItems));
          return newItems;
        });
      }
      success('Item removed from cart');
    } catch (err: any) {
      toastError(err.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await cartApi.clearCart();
      }
      setGuestItems([]);
      localStorage.removeItem('nexacart_guest_cart');
      setAppliedCoupon(null);
      await refreshCart();
    } catch (err: any) {
      toastError(err.message || 'Failed to clear cart');
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const subtotal = cart?.summary.subtotal || 0;
      if (subtotal <= 0) {
        toastError('Please add items to your cart before applying a coupon');
        return;
      }
      const result = await cartApi.validateCoupon(code, subtotal);
      setAppliedCoupon(result);
      success(result.message);
    } catch (err: any) {
      toastError(err.message || 'Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    success('Coupon removed');
  };

  const itemCount = cart?.itemCount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isDrawerOpen,
        appliedCoupon,
        itemCount,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
