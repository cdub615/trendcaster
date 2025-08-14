import {mastra} from '@/mastra';
import {NextRequest, NextResponse} from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get the research workflow from Mastra
    const workflow = mastra.getWorkflow('researchWorkflow');
    const run = await workflow.createRunAsync();

    // Stream the workflow execution in real-time
    const result = await run.stream({
      inputData: { query },
    });

    // Create streaming response using Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Starting research...' })}\n\n`));

          // Stream each chunk as it arrives from the workflow
          for await (const chunk of result.stream) {
            const chunkData = JSON.stringify({ type: 'chunk', data: chunk });
            controller.enqueue(encoder.encode(`data: ${chunkData}\n\n`));
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', message: 'Research completed' })}\n\n`));
          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    });

  } catch (error) {
    console.error('Research streaming error:', error);
    return NextResponse.json(
      { error: `Research failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
