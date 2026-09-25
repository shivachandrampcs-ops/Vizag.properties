import type { NextRequest } from "next/server";
import { PUT as sellerProfilePut } from "@/app/api/seller/profile/route";

/**
 * @deprecated Legacy endpoint kept for backwards compatibility.
 * New code should call `/api/seller/profile`.
 */
export async function PUT(req: NextRequest) {
  return sellerProfilePut(req);
}
