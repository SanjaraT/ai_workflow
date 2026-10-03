import { inngest } from './inngest';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runWorkflowFunction = inngest.createFunction(
  {
    id: 'run-workflow',
    triggers: [{ event: 'workflow/run' }],
  },
  async ({ event, step }) => {
    const { nodes, edges, startNodeId } = event.data;
    const executionPath: any[] = [];
    let currentNodeId = startNodeId;

    while (currentNodeId) {
      const currentNode = nodes.find((n: any) => n.id === currentNodeId);
      if (!currentNode) break;

      const result = await step.run(`node-${currentNodeId}`, async () => {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a decision engine. Answer ONLY with YES or NO. No explanation, no punctuation, just YES or NO.',
            },
            { role: 'user', content: currentNode.data.prompt },
          ],
          max_tokens: 5,
          temperature: 0,
        });
        const answer = completion.choices[0].message.content?.trim().toUpperCase();
        return answer === 'YES' ? 'YES' : 'NO';
      });

      executionPath.push({
        nodeId: currentNodeId,
        prompt: currentNode.data.prompt,
        result,
      });

      const handle = result === 'YES' ? 'yes' : 'no';
      const nextEdge = edges.find(
        (e: any) => e.source === currentNodeId && e.sourceHandle === handle
      );
      currentNodeId = nextEdge ? nextEdge.target : null;
    }

    return { executionPath };
  }
);