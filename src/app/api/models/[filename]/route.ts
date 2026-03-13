import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9000';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params;
        const res = await fetch(`${BACKEND_URL}/models/${filename}`);

        if (!res.ok) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 });
        }

        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'model/gltf-binary',
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch model' }, { status: 503 });
    }
}
