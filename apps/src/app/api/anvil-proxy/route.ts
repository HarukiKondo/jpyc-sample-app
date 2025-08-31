import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディの取得を改善
    const contentType = request.headers.get('content-type');
    let body;
    
    if (contentType?.includes('application/json')) {
      const text = await request.text();
      if (text.trim()) {
        try {
          body = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Body:', text);
          return NextResponse.json(
            { jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null },
            { status: 400 }
          );
        }
      } else {
        console.error('Empty request body');
        return NextResponse.json(
          { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id: null },
          { status: 400 }
        );
      }
    } else {
      body = await request.json();
    }
    
    console.log('Proxying request to Anvil:', body);
    
    // Codespace内部からlocalhost:8545のAnvilにアクセス
    const response = await fetch('http://localhost:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Anvil response:', data);

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Anvil proxy error:', error);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Anvil connection failed',
          data: error instanceof Error ? error.message : String(error),
        },
        id: null,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 