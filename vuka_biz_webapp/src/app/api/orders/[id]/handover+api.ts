import { FirebaseAuth, json, OrderService, rateLimit, readJson, route, Server } from '@/server';

/** POST /api/orders/:id/handover – { pin } entered by the driver at the shop. */
export const POST = route<{ id: string }>(async (request, { id }) => {
  const user = await FirebaseAuth.requireUser(request);
  rateLimit(Server.userWrites, user.uid);
  const pin = OrderService.parsePin(await readJson(request));
  return json({ order: await Server.orders.confirmHandover(user, id, pin) });
});
