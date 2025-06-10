import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: "31.220.17.137",
  database: "bonkuploader",
  user: "streamly",
  password: "Streamly159@",
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileId, userPublicKey } = await request.json()

    const connection = await mysql.createConnection(dbConfig)

    // Delete file (only if it belongs to the user)
    const [result] = await connection.execute(
      `
      DELETE f FROM files f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ? AND u.public_key = ?
    `,
      [fileId, userPublicKey],
    )

    await connection.end()

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
  }
}
