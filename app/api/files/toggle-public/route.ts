import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"
import { randomBytes } from "crypto"

const dbConfig = {
  host: "31.220.17.137",
  database: "bonkuploader",
  user: "streamly",
  password: "Streamly159@",
}

export async function POST(request: NextRequest) {
  try {
    const { fileId, isPublic, userPublicKey } = await request.json()

    const connection = await mysql.createConnection(dbConfig)

    // Verify file belongs to user
    const [fileRows] = await connection.execute(
      `
      SELECT f.id FROM files f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ? AND u.public_key = ?
    `,
      [fileId, userPublicKey],
    )

    if ((fileRows as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({
        success: false,
        error: "File not found or access denied",
      })
    }

    let publicLink = null
    if (isPublic) {
      // Generate unique public link
      publicLink = randomBytes(16).toString("hex")
    }

    // Update file visibility
    await connection.execute("UPDATE files SET is_public = ?, public_link = ? WHERE id = ?", [
      isPublic,
      publicLink,
      fileId,
    ])

    await connection.end()

    return NextResponse.json({
      success: true,
      isPublic,
      publicLink,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
  }
}
