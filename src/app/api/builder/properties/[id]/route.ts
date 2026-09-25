import type { NextRequest } from "next/server";
import {
  DELETE as sellerDelete,
  GET as sellerGet,
  PUT as sellerPut,
} from "@/app/api/seller/properties/[id]/route";

/**
 * @deprecated Legacy endpoint kept for backwards compatibility.
 * New code should call `/api/seller/properties/[id]`.
 * Ownership is enforced server-side inside the shared handler.
 */
type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Params) {
  return sellerGet(req, ctx);
}

export async function PUT(req: NextRequest, ctx: Params) {
  return sellerPut(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: Params) {
  return sellerDelete(req, ctx);
}
