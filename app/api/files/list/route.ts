import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: "31.220.17.137",
  database: "bonkuploader",
  user: "streamly",
  password: "Streamly159@",
}

export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null

  try {
    const { searchParams } = new URL(request.url)
    const userPublicKey = searchParams.get("userPublicKey")

    if (!userPublicKey) {
      return NextResponse.json({
        success: false,
        error: "User public key required",
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // Get user files with proper boolean conversion
    const [rows] = await connection.execute(
      `
      SELECT f.id, f.filename, f.filesize, f.filetype, f.base64data, f.upload_date, 
             CASE WHEN f.is_public = 1 THEN true ELSE false END as is_public, 
             f.public_link
      FROM files f
      JOIN users u ON f.user_id = u.id
      WHERE u.public_key = ?
      ORDER BY f.upload_date DESC
    `,
      [userPublicKey],
    )

    console.log(
      "Files retrieved:",
      (rows as any[]).map((f) => ({
        id: f.id,
        filename: f.filename,
        is_public: f.is_public,
        public_link: f.public_link,
      })),
    )

    return NextResponse.json({
      success: true,
      files: rows,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
