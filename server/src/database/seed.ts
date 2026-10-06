import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NexaCart Database Seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  // 2. Create Users (Admin & Customer)
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const customerPassword = await bcrypt.hash('Customer@123456', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexacart.com',
      passwordHash: adminPassword,
      firstName: 'Alex',
      lastName: 'Vance',
      phoneNumber: '+1 (555) 019-2834',
      role: 'ADMIN',
      cart: { create: {} },
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@nexacart.com',
      passwordHash: customerPassword,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      phoneNumber: '+1 (555) 439-8812',
      role: 'CUSTOMER',
      cart: { create: {} },
    },
  });

  console.log('✅ Created Demo Users:');
  console.log('   👑 Admin: admin@nexacart.com / Admin@123456');
  console.log('   🛍️ Customer: customer@nexacart.com / Customer@123456');

  // 3. Create Shipping Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: customer.id,
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      postalCode: '97477',
      country: 'United States',
      isDefault: true,
    },
  });

  // 4. Create Product Categories
  const categoriesData = [
    {
      name: 'Audio & Acoustics',
      slug: 'audio-acoustics',
      description: 'Studio-grade headphones, wireless earbuds, and high-fidelity sound systems.',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    },
    {
      name: 'Wearables & Smartwatches',
      slug: 'wearables-smartwatches',
      description: 'Precision biometric tracking, luxury titanium finishes, and next-gen AMOLED displays.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    },
    {
      name: 'Computing & Peripherals',
      slug: 'computing-peripherals',
      description: 'Ergonomic mechanical keyboards, 4K webcams, and ultra-fast workspace docking hubs.',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    },
    {
      name: 'Smart Home & Living',
      slug: 'smart-home-living',
      description: 'Connected ambient lighting, intelligent purifiers, and automated home security.',
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
    },
    {
      name: 'Cameras & Optics',
      slug: 'cameras-optics',
      description: 'Full-frame mirrorless bodies, cinema lenses, and creator gimbal stabilizers.',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    },
    {
      name: 'Minimalist Accessories',
      slug: 'minimalist-accessories',
      description: 'Full-grain leather carry cases, MagSafe power banks, and anodized aluminum desk trays.',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
    },
  ];

  const categoryMap: { [slug: string]: string } = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }

  console.log(`✅ Created ${categoriesData.length} Product Categories`);

  // 5. Create Realistic Portfolio Products
  const productsData = [
    {
      name: 'Aether Pro Spatial Wireless Headphones',
      slug: 'aether-pro-spatial-wireless-headphones',
      description: 'Custom 45mm neodymium drivers tuned for lossless spatial audio. Active hybrid noise cancellation with 40-hour ultra-low latency battery life and plush lambskin memory foam ear cushions.',
      price: 349.99,
      discountPercent: 15,
      stock: 42,
      sku: 'AETH-PRO-BLK',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
      ]),
      featured: true,
      rating: 4.9,
      reviewCount: 28,
      categoryId: categoryMap['audio-acoustics'],
    },
    {
      name: 'Vanguard Chrono Titanium Smartwatch',
      slug: 'vanguard-chrono-titanium-smartwatch',
      description: 'Forged Grade 5 aerospace titanium bezel with sapphire crystal glass. Dual-frequency multi-GNSS tracking, advanced ECG sensors, and 14-day continuous battery life on single charge.',
      price: 499.00,
      discountPercent: 10,
      stock: 18,
      sku: 'VANG-CHRN-TI',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
      ]),
      featured: true,
      rating: 4.8,
      reviewCount: 19,
      categoryId: categoryMap['wearables-smartwatches'],
    },
    {
      name: 'Keychron Lumina Q6 Custom Mechanical Keyboard',
      slug: 'keychron-lumina-q6-custom-keyboard',
      description: 'CNC machined 6063 aluminum body with gasket mount design. Pre-lubed Gateron Pro hot-swappable switches, sound dampening silicon layers, and double-shot PBT keycaps in retro carbon finish.',
      price: 189.50,
      discountPercent: 0,
      stock: 65,
      sku: 'KEYC-LUM-Q6',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
      ]),
      featured: true,
      rating: 4.9,
      reviewCount: 44,
      categoryId: categoryMap['computing-peripherals'],
    },
    {
      name: 'Aura Horizon Smart Ambient Lamp',
      slug: 'aura-horizon-smart-ambient-lamp',
      description: 'Seamless circadian rhythm sync lighting with 16.8 million colors. Ultra-slim brushed brass silhouette with touch capacitive slide dimmer and Matter & HomeKit smart integration.',
      price: 129.00,
      discountPercent: 20,
      stock: 30,
      sku: 'AURA-HRZ-LAMP',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
      ]),
      featured: false,
      rating: 4.7,
      reviewCount: 15,
      categoryId: categoryMap['smart-home-living'],
    },
    {
      name: 'Lumix Prime 35mm f/1.4 Cinema Lens',
      slug: 'lumix-prime-35mm-cinema-lens',
      description: 'Nano surface coating with 11-blade circular aperture diaphragm. Silky smooth manual focus throw with 0.8 MOD gearing for professional cinema rigs and breath compensation.',
      price: 799.00,
      discountPercent: 5,
      stock: 12,
      sku: 'LUMX-35MM-F14',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
      ]),
      featured: true,
      rating: 5.0,
      reviewCount: 31,
      categoryId: categoryMap['cameras-optics'],
    },
    {
      name: 'Nomad Classic Horween Leather Folio',
      slug: 'nomad-classic-horween-leather-folio',
      description: 'Handcrafted with vegetable-tanned American Horween leather that develops an organic, rich patina over time. Hidden micro-suction phone mount and reinforced contrast stitching.',
      price: 89.00,
      discountPercent: 0,
      stock: 50,
      sku: 'NOMD-FOLIO-BRN',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
      ]),
      featured: false,
      rating: 4.6,
      reviewCount: 12,
      categoryId: categoryMap['minimalist-accessories'],
    },
    {
      name: 'Pulse Wave ANC True Wireless Earbuds',
      slug: 'pulse-wave-anc-earbuds',
      description: 'Dual balanced armature architecture with adaptive wind-noise isolation. IPX7 waterproof casing with Qi wireless charging case providing 32 hours total playtime.',
      price: 159.99,
      discountPercent: 25,
      stock: 75,
      sku: 'PULS-WAV-ANC',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
      ]),
      featured: true,
      rating: 4.8,
      reviewCount: 52,
      categoryId: categoryMap['audio-acoustics'],
    },
    {
      name: 'HyperDrive Studio Thunderbolt 4 Dock',
      slug: 'hyperdrive-studio-tb4-dock',
      description: '14-in-1 workstation expansion with dual 4K 120Hz display outputs, 96W power delivery, 2.5Gb Ethernet, and ultra-fast 40Gbps data transfer bandwidth.',
      price: 249.95,
      discountPercent: 12,
      stock: 24,
      sku: 'HYPR-TB4-DK14',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80',
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
      ]),
      featured: false,
      rating: 4.7,
      reviewCount: 22,
      categoryId: categoryMap['computing-peripherals'],
    },
    {
      name: 'Zenith OLED Ergonomic Trackball Mouse',
      slug: 'zenith-oled-ergonomic-trackball-mouse',
      description: '57-degree natural vertical handshake angle reducing muscle strain by 40%. Optical precision sensor up to 4000 DPI with built-in mini OLED stats display and multi-device Bluetooth switching.',
      price: 119.00,
      discountPercent: 0,
      stock: 35,
      sku: 'ZEN-MS-TRK57',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
      ]),
      featured: false,
      rating: 4.5,
      reviewCount: 17,
      categoryId: categoryMap['computing-peripherals'],
    },
    {
      name: 'PureAir Shield Pro Smart Air Purifier',
      slug: 'pureair-shield-pro-smart-purifier',
      description: 'Medical-grade H13 True HEPA filter capturing 99.97% of airborne particles down to 0.1 microns. Laser particle monitor with real-time AQI indicator and whisper-quiet night mode.',
      price: 279.00,
      discountPercent: 18,
      stock: 20,
      sku: 'PURE-SHLD-PRO',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
      ]),
      featured: true,
      rating: 4.9,
      reviewCount: 38,
      categoryId: categoryMap['smart-home-living'],
    },
    {
      name: 'Apex 8K Creator Mirrorless Camera',
      slug: 'apex-8k-creator-mirrorless-camera',
      description: '45MP full-frame backside-illuminated sensor with 8-stop in-body image stabilization. Uncompressed 8K 30fps RAW recording and dual CFexpress Type B card slots.',
      price: 2499.00,
      discountPercent: 8,
      stock: 6,
      sku: 'APEX-8K-CAM',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
        'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&q=80',
      ]),
      featured: true,
      rating: 5.0,
      reviewCount: 14,
      categoryId: categoryMap['cameras-optics'],
    },
    {
      name: 'MagCharge Qi2 Modular Wireless Stand',
      slug: 'magcharge-qi2-modular-stand',
      description: 'CNC machined solid aluminum multi-device charging stand. 15W Qi2 certified magnetic fast charging for phone, watch, and earbuds simultaneously.',
      price: 99.99,
      discountPercent: 10,
      stock: 40,
      sku: 'MAGC-QI2-STD',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=800&q=80',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
      ]),
      featured: false,
      rating: 4.8,
      reviewCount: 29,
      categoryId: categoryMap['minimalist-accessories'],
    },
  ];

  for (const prod of productsData) {
    const createdProduct = await prisma.product.create({ data: prod });

    // Seed realistic reviews
    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: createdProduct.id,
        rating: 5,
        comment: `Outstanding build quality and flawless performance. Exactly what I was looking for! Fast shipping as well.`,
      },
    });
  }

  console.log(`✅ Created ${productsData.length} Products with Sample Reviews`);

  // 6. Create Active Discount Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        discountPercent: 10,
        minOrderAmount: 50,
        maxDiscount: 50,
        isActive: true,
      },
      {
        code: 'NEXA20',
        discountPercent: 20,
        minOrderAmount: 150,
        maxDiscount: 100,
        isActive: true,
      },
      {
        code: 'SUMMER30',
        discountPercent: 30,
        minOrderAmount: 300,
        maxDiscount: 150,
        isActive: true,
      },
    ],
  });

  console.log('✅ Created Promotional Coupons: WELCOME10, NEXA20, SUMMER30');

  // 7. Create a Sample Past Order for Customer
  const firstProduct = await prisma.product.findFirst({ where: { slug: 'aether-pro-spatial-wireless-headphones' } });
  if (firstProduct) {
    await prisma.order.create({
      data: {
        orderNumber: 'NC-20261006-8812',
        userId: customer.id,
        addressId: address1.id,
        status: 'DELIVERED',
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'COMPLETED',
        subtotal: 297.49,
        taxAmount: 23.80,
        shippingFee: 0,
        discountAmount: 0,
        totalAmount: 321.29,
        trackingNumber: 'TRK-982314561',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: firstProduct.id,
              productName: firstProduct.name,
              productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
              price: 297.49,
              quantity: 1,
            },
          ],
        },
      },
    });
    console.log('✅ Created Sample Customer Order (DELIVERED)');
  }

  console.log('🎉 NexaCart Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
