import type { NextRequest } from "next/server";
import {
  GET as sellerGet,
  POST as sellerPost,
} from "@/app/api/seller/properties/route";

/**
 * @deprecated Legacy endpoint kept for backwards compatibility.
 * New code should call `/api/seller/properties`.
 * Identical behaviour: the session decides which account owns the listing.
 */
export async function GET() {
  return sellerGet();
}

export async function POST(req: NextRequest) {
  return sellerPost(req);
}
