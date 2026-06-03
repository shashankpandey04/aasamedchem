import { getSession } from "@/lib/session";
import { NavbarClient } from "@/components/navbar-client";

export async function Navbar() {
  const session = await getSession();
  return <NavbarClient session={session} />;
}
