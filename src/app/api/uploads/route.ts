import fs from 'fs';
import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  const uploadsDir = path.join(process.cwd(), 'uploads');

  try {
    const files = fs.readdirSync(uploadsDir);
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
  }
};
export async function POST(request: Request) {
  const formData = await request.formData();
  const file: File | null = formData.get('file') as unknown as File;
  const fileName = formData.get('fileName')?.toString();
  console.log(file);
  
  if (!file) {
    return NextResponse.json({ error: 'No file received' }, { status: 400 });
  }
  // if (!file.type.includes('png')) {
  //   return NextResponse.json({ error: 'Only PNG file is accepted' }, { status: 400 });
  // }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${fileName?.replace(' ', '_')}.png`;
  const filepath = path.join(process.cwd(), 'uploads', filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
