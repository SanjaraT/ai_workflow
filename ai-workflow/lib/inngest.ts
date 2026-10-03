import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'ai-workflow',
  isDev: process.env.NODE_ENV !== 'production',
});