import { json, route } from '@/server';

export const GET = route(() => json({ status: 'ok', time: new Date().toISOString() }));
