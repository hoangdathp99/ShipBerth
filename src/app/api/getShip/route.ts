import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db"; // Import DB helper

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";
  try {
    const db = await connectToDB(); // Connect to DB
    let query = `
      SELECT ShipID, ShipName, nLoa 
      FROM VESSELS 
      WHERE (@searchQuery = '' OR LOWER(ShipName) LIKE '%' + @searchQuery + '%')
      ORDER BY ShipID 

    `;

    const result = await db
      .request()
      .input("searchQuery", searchQuery)
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
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
