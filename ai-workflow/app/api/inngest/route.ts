import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { runWorkflowFunction } from '@/lib/workflowFunction';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runWorkflowFunction],
});