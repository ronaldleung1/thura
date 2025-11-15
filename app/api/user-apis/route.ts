import { NextRequest, NextResponse } from 'next/server';
import { db, userApis } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET: List all user APIs
export async function GET() {
  try {
    const apis = await db.select().from(userApis);
    return NextResponse.json({ apis });
  } catch (error) {
    console.error('GET /api/user-apis error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch APIs', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Add a new API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      endpoint,
      apiKey,
      httpMethod,
      costPerCall,
      budgetLimit,
      parameterSchema,
      description,
    } = body;

    // Validate required fields
    if (!name || !endpoint || !apiKey || !httpMethod || !costPerCall || !budgetLimit || !parameterSchema || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate HTTP method
    if (!['GET', 'POST'].includes(httpMethod)) {
      return NextResponse.json(
        { error: 'httpMethod must be GET or POST' },
        { status: 400 }
      );
    }

    // Insert new API
    const [newApi] = await db
      .insert(userApis)
      .values({
        name,
        endpoint,
        apiKey,
        httpMethod,
        costPerCall: costPerCall.toString(),
        budgetLimit: budgetLimit.toString(),
        spendAmount: '0',
        parameterSchema,
        description,
      })
      .returning();

    return NextResponse.json({ api: newApi }, { status: 201 });
  } catch (error) {
    console.error('POST /api/user-apis error:', error);
    return NextResponse.json(
      { error: 'Failed to create API', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Remove an API
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const apiId = searchParams.get('id');

    if (!apiId) {
      return NextResponse.json(
        { error: 'Missing API ID' },
        { status: 400 }
      );
    }

    await db.delete(userApis).where(eq(userApis.id, apiId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/user-apis error:', error);
    return NextResponse.json(
      { error: 'Failed to delete API', message: (error as Error).message },
      { status: 500 }
    );
  }
}
