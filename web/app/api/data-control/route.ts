import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function PUT(request: NextRequest) {
  try {
    const hostHeader = request.headers.get('host') || '';
    const host = new URL('http://' + hostHeader);
    const originHeader = request.headers.get('origin');
    const origin = new URL(originHeader || 'https://invalid.example');
    const adminHeader = request.headers.get('x-tc-admin');

    if (
      !['localhost', '127.0.0.1', '[::1]'].includes(host.hostname) ||
      origin.host !== host.host ||
      adminHeader !== 'local-workstation'
    ) {
      return NextResponse.json(
        { detail: 'Data controls are available from this local workstation only.' },
        { status: 403 }
      );
    }

    const secret =
      process.env.TC_DATA_ADMIN_TOKEN ||
      (await readFile(path.resolve(process.cwd(), '../.cache/data-admin-token'), 'utf8')).trim();

    const body = await request.json();
    const pyApiUrl = process.env.PY_API_URL || 'http://127.0.0.1:8000';
    const result = await fetch(`${pyApiUrl}/data-management`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-TC-Admin': secret,
        'Origin': origin.origin,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    const data = await result.json();
    return NextResponse.json(data, {
      status: result.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { detail: 'Local data control is unavailable. Start the backend, reconnect the inventory, then try again.' },
      { status: 503 }
    );
  }
}
