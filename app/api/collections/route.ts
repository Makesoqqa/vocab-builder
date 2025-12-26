import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Collection } from '@/lib/models';

export async function GET() {
    await dbConnect();
    // In a real app, filtering by user session is key.
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // For now, return all collections (Demo Mode)
    const collections = await Collection.find({});
    return NextResponse.json(collections);
}

export async function POST(req: Request) {
    await dbConnect();
    const body = await req.json();
    const collection = await Collection.create(body);
    return NextResponse.json(collection);
}
