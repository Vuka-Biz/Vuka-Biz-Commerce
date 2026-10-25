import { FirebaseAuth, json, route, Server } from '@/server';

/** GET /api/admin/orders – every order, newest first (support staff only). */
export const GET = route(async (request) => {
  const user = await FirebaseAuth.requireUser(request);
  return json({ orders: await Server.orders.listAll(user) });
});
