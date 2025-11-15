import { NextRequest, NextResponse } from 'next/server';
import { db, userApis } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiId, params } = body;

    if (!apiId || !params) {
      return NextResponse.json(
        { error: 'Missing apiId or params' },
        { status: 400 }
      );
    }

    // 1. Get the API configuration from database
    const [api] = await db
      .select()
      .from(userApis)
      .where(eq(userApis.id, apiId))
      .limit(1);

    if (!api) {
      return NextResponse.json(
        { error: 'API not found' },
        { status: 404 }
      );
    }

    // 2. Check budget: current spend + cost per call <= budget limit
    const currentSpend = Number.parseFloat(api.spendAmount);
    const costPerCall = Number.parseFloat(api.costPerCall);
    const budgetLimit = Number.parseFloat(api.budgetLimit);

    if (currentSpend + costPerCall > budgetLimit) {
      return NextResponse.json(
        {
          error: 'Budget limit exceeded',
          currentSpend,
          budgetLimit,
          costPerCall,
        },
        { status: 429 }
      );
    }

    // 3. Build the request URL and headers
    let requestUrl = api.endpoint;
    let requestBody = null;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (api.httpMethod === 'GET') {
      // For GET requests: interpolate params into URL template
      // Replace {paramName} with actual values
      Object.keys(params).forEach((key) => {
        requestUrl = requestUrl.replace(`{${key}}`, encodeURIComponent(params[key]));
      });

      // Also replace {apiKey} if present in URL
      requestUrl = requestUrl.replace('{apiKey}', api.apiKey);
    } else if (api.httpMethod === 'POST') {
      // For POST requests: send params as JSON body
      requestBody = JSON.stringify(params);

      // Add API key to headers (common pattern)
      headers['Authorization'] = `Bearer ${api.apiKey}`;
    }

    // 4. Call the external API
    const response = await fetch(requestUrl, {
      method: api.httpMethod,
      headers,
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: 'External API call failed',
          status: response.status,
          message: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 5. Log spend: increment spendAmount by costPerCall
    await db
      .update(userApis)
      .set({
        spendAmount: sql`${userApis.spendAmount} + ${costPerCall}`,
      })
      .where(eq(userApis.id, apiId));

    // 6. Return the API response
    return NextResponse.json({
      success: true,
      data,
      spend: {
        currentSpend: currentSpend + costPerCall,
        budgetLimit,
        costPerCall,
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
