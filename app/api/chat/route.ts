import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db, userApis } from '@/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // 1. Fetch all user APIs from the database
    const apis = await db.select().from(userApis);

    // 2. Convert each API to a Claude tool definition
    const tools: Anthropic.Tool[] = apis.map((api) => {
      const paramSchema = api.parameterSchema as Record<string, string>;

      // Build parameter properties for the tool
      const properties: Record<string, { type: string; description: string }> = {};
      const required: string[] = [];

      Object.keys(paramSchema).forEach((paramName) => {
        properties[paramName] = {
          type: paramSchema[paramName],
          description: `Parameter: ${paramName}`,
        };
        required.push(paramName);
      });

      return {
        name: api.name.toLowerCase().replace(/\s+/g, '_'),
        description: api.description,
        input_schema: {
          type: 'object',
          properties,
          required,
        },
      };
    });

    // 3. Call Claude with these tools
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages,
      tools,
    });

    // 4. Handle tool calls
    if (response.stop_reason === 'tool_use') {
      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      if (toolUseBlock) {
        // Find the matching API by name
        const apiName = toolUseBlock.name;
        const api = apis.find(
          (a) => a.name.toLowerCase().replace(/\s+/g, '_') === apiName
        );

        if (!api) {
          return Response.json({
            error: 'Tool not found',
            toolName: apiName,
          }, { status: 404 });
        }

        // Call our proxy with the tool's input parameters
        const proxyResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/proxy`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiId: api.id,
              params: toolUseBlock.input,
            }),
          }
        );

        const proxyData = await proxyResponse.json();

        // If proxy failed (budget exceeded, etc), return error
        if (!proxyResponse.ok) {
          return Response.json({
            error: 'Proxy call failed',
            details: proxyData,
          }, { status: proxyResponse.status });
        }

        // Continue conversation with tool result
        const followUpResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: response.content,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: toolUseBlock.id,
                  content: JSON.stringify(proxyData.data),
                },
              ],
            },
          ],
          tools,
        });

        return Response.json({
          response: followUpResponse,
          toolUsed: {
            name: apiName,
            input: toolUseBlock.input,
            result: proxyData.data,
            spend: proxyData.spend,
          },
        });
      }
    }

    // No tool use - return Claude's response directly
    return Response.json({ response });

  } catch (error) {
    console.error('Chat error:', error);
    return Response.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
