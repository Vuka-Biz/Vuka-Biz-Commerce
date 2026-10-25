import { FirebaseAuth, json, rateLimit, route, Server } from '@/server';

/** POST /api/admin/orders/:id/unlock – reopen a PIN-locked order with a fresh PIN (support staff only). */
export const POST = route<{ id: string }>(async (request, { id }) => {
  const user = await FirebaseAuth.requireUser(request);
  rateLimit(Server.userWrites, user.uid);
  return json({ order: await Server.orders.unlock(user, id) });
});
