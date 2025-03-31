// lib/checkUser.js

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) return null;

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) return loggedInUser;

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    const existingByEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingByEmail) return existingByEmail;

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });

    return newUser;
  } catch (error) {
    console.error("❌ Error checking user:", error.message);
    return null;
  }
};
