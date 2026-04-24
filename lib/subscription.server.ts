import { cookies } from "next/headers";
import { SUBSCRIPTION_COOKIE } from "./subscription";

export async function isSubscribedServer(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(SUBSCRIPTION_COOKIE)?.value === "1";
}
