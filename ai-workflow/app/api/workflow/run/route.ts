import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});
export async function POST(req: NextRequest) {
  try {
    const { nodes, edges } = await req.json();

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ error: 'No nodes provided' }, { status: 400 });
    }

    const targetNodeIds = new Set(edges.map((e: any) => e.target));
    const startNode = nodes.find((n: any) => !targetNodeIds.has(n.id));

    if (!startNode) {
      return NextResponse.json({ error: 'No start node found' }, { status: 400 });
    }

    const emptyNode = nodes.find((n: any) => !n.data.prompt?.trim());
    if (emptyNode) {
      return NextResponse.json(
        { error: `Node "${emptyNode.data.label || emptyNode.id}" has no prompt` },
        { status: 400 }
      );
    }

    const executionPath: any[] = [];
    let currentNodeId = startNode.id;

    while (currentNodeId) {
      const currentNode = nodes.find((n: any) => n.id === currentNodeId);
      if (!currentNode) break;

      const completion = await openai.chat.completions.create({
        model: 'openrouter/free',
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

      const result = completion.choices[0].message.content?.trim().toUpperCase();
      const answer = result === 'YES' ? 'YES' : 'NO';

      executionPath.push({
        nodeId: currentNodeId,
        prompt: currentNode.data.prompt,
        result: answer,
      });

      const handle = answer === 'YES' ? 'yes' : 'no';
      const nextEdge = edges.find(
        (e: any) => e.source === currentNodeId && e.sourceHandle === handle
      );
      currentNodeId = nextEdge ? nextEdge.target : null;
    }

    return NextResponse.json({ executionPath });

  } catch (err: any) {
    console.error('Workflow error:', err);
    return NextResponse.json(
      { error: err.message || 'Workflow execution failed' },
      { status: 500 }
    );
  }
}