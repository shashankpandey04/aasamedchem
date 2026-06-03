"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hashPassword, verifyPassword } from "@/lib/auth";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { seedDemoUsers } from "@/lib/inventory";
import { ALL_UNITS, calculateTotalPrice, type Unit } from "@/lib/pricing";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

// ---------------------------------------------------------------------------
// Auth actions
// ---------------------------------------------------------------------------

export type AuthState = { error?: string } | undefined;

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = readText(formData, "name");
  const username = readText(formData, "username").toLowerCase();
  const password = readText(formData, "password");
  const role = readText(formData, "role") as "user" | "admin";

  if (!name || !username || !password) {
    return { error: "All fields are required." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (role !== "user" && role !== "admin") {
    return { error: "Invalid role." };
  }

  await connectToDatabase();

  const existing = await User.findOne({ username }).lean();
  if (existing) {
    return { error: "Username already taken." };
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, username, passwordHash, role });

  await createSession({
    userId: String(user._id),
    name: user.name,
    role: user.role as "user" | "admin",
  });

  redirect(role === "admin" ? "/admin" : "/user");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = readText(formData, "username").toLowerCase();
  const password = readText(formData, "password");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  await connectToDatabase();
  await seedDemoUsers();

  const user = await User.findOne({ username }).lean();
  if (!user) {
    return { error: "Invalid username or password." };
  }

  const valid = await verifyPassword(password, String(user.passwordHash));
  if (!valid) {
    return { error: "Invalid username or password." };
  }

  await createSession({
    userId: String(user._id),
    name: String(user.name),
    role: user.role as "user" | "admin",
  });

  redirect(user.role === "admin" ? "/admin" : "/user");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Product actions (admin)
// ---------------------------------------------------------------------------

export async function createProductAction(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/login");
  }

  const name = readText(formData, "name");
  const price = Number(formData.get("price"));
  const unit = readText(formData, "unit") as Unit;

  if (!name || !Number.isFinite(price) || price <= 0 || !ALL_UNITS.includes(unit)) {
    redirect("/admin/products?error=invalid-product");
  }

  await connectToDatabase();

  const existing = await Product.findOne({ name }).lean();
  if (existing) {
    redirect("/admin/products?error=duplicate-product");
  }

  await Product.create({ name, price, unit });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/order");
  redirect("/admin/products?saved=1");
}

export async function updateProductAction(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/login");
  }

  const id = readText(formData, "id");
  const name = readText(formData, "name");
  const price = Number(formData.get("price"));
  const unit = readText(formData, "unit") as Unit;

  if (!id || !name || !Number.isFinite(price) || price <= 0 || !ALL_UNITS.includes(unit)) {
    redirect("/admin/products?error=invalid-product");
  }

  await connectToDatabase();

  const conflict = await Product.findOne({ name, _id: { $ne: id } }).lean();
  if (conflict) {
    redirect("/admin/products?error=duplicate-product");
  }

  await Product.findByIdAndUpdate(id, { name, price, unit });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/order");
  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/login");
  }

  const id = readText(formData, "id");
  if (!id) redirect("/admin/products?error=invalid-product");

  await connectToDatabase();
  await Product.findByIdAndDelete(id);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/order");
  redirect("/admin/products");
}

export async function deleteOrderAction(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/login");
  }

  const id = readText(formData, "id");
  if (!id) redirect("/admin/orders");

  await connectToDatabase();
  await Order.findByIdAndDelete(id);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function updateOrderStatusAction(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/login");
  }

  const id = readText(formData, "id");
  const orderStatus = readText(formData, "orderStatus");
  const VALID = ["processing", "in transit", "shipped", "cancelled"];

  if (!id || !VALID.includes(orderStatus)) redirect("/admin/orders");

  await connectToDatabase();
  await Order.findByIdAndUpdate(id, { orderStatus });

  revalidatePath("/admin/orders");
  revalidatePath(`/invoice/${id}`);
  revalidatePath("/orders");
}

export async function updateInvoiceStatusAction(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "admin") {
    redirect("/login");
  }

  const id = readText(formData, "id");
  const invoiceStatus = readText(formData, "invoiceStatus");
  const VALID = ["pending", "paid", "cancelled"];

  if (!id || !VALID.includes(invoiceStatus)) redirect("/admin/orders");

  await connectToDatabase();
  await Order.findByIdAndUpdate(id, { invoiceStatus });

  revalidatePath("/admin/orders");
  revalidatePath(`/invoice/${id}`);
  revalidatePath("/orders");
}

// ---------------------------------------------------------------------------
// Order actions (user + admin)
// ---------------------------------------------------------------------------

export type CartItem = {
  productName: string;
  quantity: number;
  unit: Unit;
};

export async function createOrderAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  let cartItems: CartItem[];
  try {
    cartItems = JSON.parse(readText(formData, "items")) as CartItem[];
  } catch {
    redirect("/order?error=invalid-order");
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    redirect("/order?error=invalid-order");
  }

  await connectToDatabase();

  const resolvedItems = [];
  let grandTotal = 0;

  for (const item of cartItems) {
    const { productName, quantity, unit } = item;

    if (!productName || !Number.isFinite(quantity) || quantity <= 0 || !ALL_UNITS.includes(unit)) {
      redirect("/order?error=invalid-order");
    }

    const product = await Product.findOne({ name: productName }).lean();
    if (!product) {
      redirect("/order?error=missing-product");
    }

    const lineTotal = calculateTotalPrice(
      Number(product.price),
      product.unit as Unit,
      quantity,
      unit,
    );

    if (lineTotal === null) {
      redirect("/order?error=invalid-unit");
    }

    resolvedItems.push({
      productName,
      quantity,
      unit,
      unitPrice: Number(product.price),
      lineTotal,
    });

    grandTotal += lineTotal;
  }

  await Order.create({
    userId: session.userId,
    items: resolvedItems,
    grandTotal,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/order");
  revalidatePath("/orders");
  redirect("/order?saved=1");
}
