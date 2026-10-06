import { prisma } from '../utils/prisma';
import { AppError } from '../utils/app-error';
import { CreateOrderInput, UpdateOrderStatusInput } from '../schemas/order.schema';

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `NC-${dateStr}-${randomSuffix}`;
};

export class OrderService {
  static async createOrder(userId: string, input: CreateOrderInput) {
    let addressId = input.addressId;

    // Handle new address creation if supplied
    if (!addressId && input.newAddress) {
      const address = await prisma.address.create({
        data: {
          userId,
          ...input.newAddress,
        },
      });
      addressId = address.id;
    }

    if (!addressId) {
      throw AppError.badRequest('A delivery shipping address is required to place an order');
    }

    // Determine cart items (either from explicit payload or from user's active cart)
    let cartItemsToProcess: Array<{ productId: string; quantity: number }> = [];

    if (input.items && input.items.length > 0) {
      cartItemsToProcess = input.items;
    } else {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart || cart.items.length === 0) {
        throw AppError.badRequest('Your shopping cart is empty');
      }

      cartItemsToProcess = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    }

    // Execute atomic transaction for stock validation, decrement, and order creation
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: Array<{
        productId: string;
        productName: string;
        productImage: string;
        price: number;
        quantity: number;
      }> = [];

      for (const item of cartItemsToProcess) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw AppError.notFound(`Product not found`);
        }

        if (product.stock < item.quantity) {
          throw AppError.badRequest(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`
          );
        }

        const discountedPrice =
          product.discountPercent > 0
            ? Number((product.price * (1 - product.discountPercent / 100)).toFixed(2))
            : product.price;

        subtotal += discountedPrice * item.quantity;

        const images = JSON.parse(product.images || '[]');
        const mainImage = images[0] || '';

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          productImage: mainImage,
          price: discountedPrice,
          quantity: item.quantity,
        });

        // Decrement product inventory atomically
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      subtotal = Number(subtotal.toFixed(2));

      // Calculate coupon discount if applicable
      let discountAmount = 0;
      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: input.couponCode.toUpperCase() },
        });
        if (coupon && coupon.isActive && subtotal >= coupon.minOrderAmount) {
          discountAmount = Number(((subtotal * coupon.discountPercent) / 100).toFixed(2));
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        }
      }

      const taxableSubtotal = Math.max(0, subtotal - discountAmount);
      const taxAmount = Number((taxableSubtotal * 0.08).toFixed(2));
      
      let shippingFee = 0;
      if (input.shippingOption === 'EXPRESS') {
        shippingFee = 14.99;
      } else {
        shippingFee = subtotal >= 100 ? 0 : 9.99;
      }

      const totalAmount = Number((taxableSubtotal + taxAmount + shippingFee).toFixed(2));

      // Generate tracking number
      const trackingNumber = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;

      // Create Order in DB
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId: addressId as string,
          status: 'CONFIRMED',
          paymentMethod: input.paymentMethod,
          paymentStatus: 'COMPLETED',
          subtotal,
          taxAmount,
          shippingFee,
          discountAmount,
          totalAmount,
          trackingNumber,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
          shippingAddress: true,
        },
      });

      // Clear user database cart
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return createdOrder;
    });

    return order;
  }

  static async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOrderById(orderId: string, userId?: string) {
    const where: any = { id: orderId };
    if (userId) {
      where.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: true,
        shippingAddress: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!order) {
      throw AppError.notFound('Order not found');
    }

    return order;
  }

  static async updateOrderStatus(orderId: string, input: UpdateOrderStatusInput) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw AppError.notFound('Order not found');
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: input.status,
        ...(input.trackingNumber && { trackingNumber: input.trackingNumber }),
      },
      include: {
        items: true,
        shippingAddress: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updated;
  }
}
