import { prisma } from '../utils/prisma';
import { AppError } from '../utils/app-error';
import { AddToCartInput, UpdateCartItemInput, ValidateCouponInput } from '../schemas/cart.schema';

export class CartService {
  static async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: { id: true, name: true, slug: true },
                  },
                },
              },
            },
          },
        },
      });
    }

    const items = cart.items.map((item) => {
      const discountedPrice =
        item.product.discountPercent > 0
          ? Number((item.product.price * (1 - item.product.discountPercent / 100)).toFixed(2))
          : item.product.price;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images || '[]'),
          discountedPrice,
        },
        lineTotal: Number((discountedPrice * item.quantity).toFixed(2)),
      };
    });

    const subtotal = items.reduce((acc, curr) => acc + curr.lineTotal, 0);
    const estimatedTax = Number((subtotal * 0.08).toFixed(2));
    const freeShippingThreshold = 100;
    const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 9.99;
    const total = Number((subtotal + estimatedTax + shippingFee).toFixed(2));

    return {
      id: cart.id,
      items,
      itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
      summary: {
        subtotal: Number(subtotal.toFixed(2)),
        tax: estimatedTax,
        shippingFee,
        freeShippingThreshold,
        amountNeededForFreeShipping: Math.max(0, Number((freeShippingThreshold - subtotal).toFixed(2))),
        total,
      },
    };
  }

  static async addItem(userId: string, input: AddToCartInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (product.stock < input.quantity) {
      throw AppError.badRequest(`Only ${product.stock} units available in stock`);
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: input.productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + input.quantity;
      if (newQuantity > product.stock) {
        throw AppError.badRequest(`Cannot add more than available stock (${product.stock})`);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  static async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw AppError.notFound('Cart not found');

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) throw AppError.notFound('Cart item not found');

    if (input.quantity > item.product.stock) {
      throw AppError.badRequest(`Only ${item.product.stock} items available in stock`);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: input.quantity },
    });

    return this.getCart(userId);
  }

  static async removeItem(userId: string, itemId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw AppError.notFound('Cart not found');

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) throw AppError.notFound('Cart item not found');

    await prisma.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId);
  }

  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { success: true, message: 'Cart cleared' };
  }

  static async validateCoupon(input: ValidateCouponInput) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw AppError.badRequest('Invalid or expired coupon code');
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw AppError.badRequest('This coupon has expired');
    }

    if (input.subtotal < coupon.minOrderAmount) {
      throw AppError.badRequest(
        `Coupon requires a minimum order amount of $${coupon.minOrderAmount.toFixed(2)}`
      );
    }

    let discountAmount = Number(((input.subtotal * coupon.discountPercent) / 100).toFixed(2));
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    return {
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
      message: `Coupon ${coupon.code} applied! Saved $${discountAmount.toFixed(2)}`,
    };
  }
}
