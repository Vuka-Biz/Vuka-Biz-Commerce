import { FirebaseAuth, json, OrderService, rateLimit, readJson, route, Server } from '@/server';

/** GET /api/orders – the owner's orders, or a driver's open deliveries. */
export const GET = route(async (request) => {
  const user = await FirebaseAuth.requireUser(request);
  return json({ orders: await Server.orders.list(user) });
});

/** POST /api/orders – { lines: [{ productId, quantity }], deliveryId, paymentId } */
export const POST = route(async (request) => {
  const user = await FirebaseAuth.requireUser(request);
  rateLimit(Server.userWrites, user.uid);
  const input = OrderService.parsePlaceOrder(await readJson(request));
  return json({ order: await Server.orders.place(user, input) }, 201);
});
