import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db"; // Import DB helper

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";
  const start = (page - 1) * limit;
  const end = start + limit;
  try {
    const db = await connectToDB(); // Connect to DB
    let query = `
      SELECT ShipID, ShipName, nLoa 
      FROM VESSELS 
      WHERE (@searchQuery = '' OR LOWER(ShipName) LIKE '%' + @searchQuery + '%')
      ORDER BY ShipID 
      OFFSET @start ROWS 
      FETCH NEXT @limit ROWS ONLY;
    `;

    const result = await db
      .request()
      .input("searchQuery", searchQuery)
      .input("start", start)
      .input("limit", limit)
      .query(query);

    // Get total count with filtering
    const countQuery = `
      SELECT COUNT(*) AS Total 
      FROM VESSELS 
      WHERE (@searchQuery = '' OR LOWER(ShipName) LIKE '%' + @searchQuery + '%');
    `;
    const count = await db
      .request()
      .input("searchQuery", searchQuery)
      .query(countQuery);
    return NextResponse.json({
      ships: result.recordset,
      nextPage: end < count.recordset[0].Total ? page + 1 : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
