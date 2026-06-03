import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { TEST_CREDENTIALS } from "@/lib/test-credentials";

import type { Unit } from "@/lib/pricing";

export type ProductSummary = {
  id: string;
  name: string;
  price: number;
  unit: Unit;
};

export type OrderStatus = "processing" | "in transit" | "shipped" | "cancelled";
export type InvoiceStatus = "pending" | "paid" | "cancelled";

export type OrderItem = {
  productName: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  lineTotal: number;
};

export type OrderSummary = {
  id: string;
  userId?: string;
  items: OrderItem[];
  grandTotal: number;
  orderStatus: OrderStatus;
  invoiceStatus: InvoiceStatus;
  createdAt: string;
};

export { TEST_CREDENTIALS };

export async function seedDemoUsers() {
  await connectToDatabase();

  await Promise.all(
    TEST_CREDENTIALS.map(async ({ name, username, password, role }) => {
      const existing = await User.findOne({ username }).lean();
      if (!existing) {
        const passwordHash = await hashPassword(password);
        await User.create({ name, username, passwordHash, role });
      }
    }),
  );
}

export async function getProducts(): Promise<ProductSummary[]> {
  await connectToDatabase();
  await seedDemoUsers();

  const products = await Product.find().sort({ name: 1 }).lean();

  return products.map((product) => ({
    id: String(product._id),
    name: String(product.name),
    price: Number(product.price),
    unit: product.unit as Unit,
  }));
}

function mapOrder(order: Record<string, unknown>): OrderSummary {
  // Support both the new multi-item shape and legacy single-product documents
  let items: OrderItem[];
  let grandTotal: number;

  if (Array.isArray(order.items) && order.items.length > 0) {
    items = (order.items as Record<string, unknown>[]).map((item) => ({
      productName: String(item.productName),
      quantity: Number(item.quantity),
      unit: item.unit as Unit,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    }));
    grandTotal = Number(order.grandTotal);
  } else {
    // Legacy single-item order
    items = [
      {
        productName: String(order.productName),
        quantity: Number(order.quantity),
        unit: order.unit as Unit,
        unitPrice: Number(order.totalPrice),
        lineTotal: Number(order.totalPrice),
      },
    ];
    grandTotal = Number(order.totalPrice);
  }

  return {
    id: String(order._id),
    userId: order.userId ? String(order.userId) : undefined,
    items,
    grandTotal,
    orderStatus: ((order.orderStatus as string) ?? "processing") as OrderStatus,
    invoiceStatus: ((order.invoiceStatus as string) ?? "pending") as InvoiceStatus,
    createdAt: new Date(order.createdAt as Date).toISOString(),
  };
}

export async function getOrders(userId?: string): Promise<OrderSummary[]> {
  await connectToDatabase();

  const filter = userId ? { userId } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

  return (orders as Record<string, unknown>[]).map(mapOrder);
}

export async function getOrderById(id: string): Promise<OrderSummary | null> {
  await connectToDatabase();

  const order = await Order.findById(id).lean();
  if (!order) return null;

  return mapOrder(order as Record<string, unknown>);
}
