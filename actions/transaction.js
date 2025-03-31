"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { checkUser } from "@/lib/checkUser"; // ✅ central fix

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// ✅ Create Transaction
export async function createTransaction(data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");

    const req = await request();
    const decision = await aj.protect(req, { userId: user.id, requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) throw new Error("Account not found");

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    console.error("❌ createTransaction Error:", error.message);
    throw new Error(error.message);
  }
}

// ✅ Get One Transaction
export async function getTransaction(id) {
  const user = await checkUser();
  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");
  return serializeAmount(transaction);
}

// ✅ Update Transaction
export async function updateTransaction(id, data) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");

    const original = await db.transaction.findUnique({
      where: { id, userId: user.id },
      include: { account: true },
    });

    if (!original) throw new Error("Transaction not found");

    const oldChange = original.type === "EXPENSE"
      ? -original.amount.toNumber()
      : original.amount.toNumber();

    const newChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const netChange = newChange - oldChange;

    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id, userId: user.id },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    console.error("❌ updateTransaction Error:", error.message);
    throw new Error(error.message);
  }
}

// ✅ Get All Transactions for User
export async function getUserTransactions(query = {}) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("User not found");

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return {
      success: true,
      data: transactions.map((tx) => ({
        ...tx,
        amount: tx.amount.toNumber(),
        account: {
          ...tx.account,
          balance: tx.account.balance.toNumber(),
        },
      })),
    };
  } catch (error) {
    console.error("❌ getUserTransactions Error:", error.message);
    throw new Error(error.message);
  }
}

// ✅ Scan Receipt
export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following in JSON:
      {
        "amount": number,
        "date": "ISO string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }
      If not a receipt, return {}.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const cleanedText = response.text().replace(/```(?:json)?\n?/g, "").trim();

    const data = JSON.parse(cleanedText);
    return {
      amount: parseFloat(data.amount),
      date: new Date(data.date),
      description: data.description,
      category: data.category,
      merchantName: data.merchantName,
    };
  } catch (error) {
    console.error("❌ scanReceipt Error:", error.message);
    throw new Error("Failed to scan receipt");
  }
}

// ✅ Helper: Next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY": date.setDate(date.getDate() + 1); break;
    case "WEEKLY": date.setDate(date.getDate() + 7); break;
    case "MONTHLY": date.setMonth(date.getMonth() + 1); break;
    case "YEARLY": date.setFullYear(date.getFullYear() + 1); break;
  }
  return date;
}
