import { ServerConfig } from './config';
import { FirestoreOrderRepository } from './FirestoreOrderRepository';
import { InMemoryOrderRepository, OrderService } from './OrderService';
import { RateLimiter } from './RateLimiter';

export { FirebaseAuth, type AuthUser } from './FirebaseAuth';
export { ApiError, json, rateLimit, readJson, route } from './http';
export { OrderService } from './OrderService';

/** One instance per server process, shared by every API route. */
export const Server = {
  orders: new OrderService(
    ServerConfig.serviceAccount
      ? new FirestoreOrderRepository(ServerConfig.serviceAccount)
      : new InMemoryOrderRepository(),
  ),
  userWrites: new RateLimiter(ServerConfig.userWriteLimit.capacity, ServerConfig.userWriteLimit.refillPerSecond),
};
