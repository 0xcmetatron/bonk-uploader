import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: "31.220.17.137",
  database: "bonkuploader",
  user: "streamly",
  password: "Streamly159@",
}

export async function GET(request: NextRequest, { params }: { params: { link: string } }) {
  try {
    const { link } = params

    const connection = await mysql.createConnection(dbConfig)

    // Get public file
    const [rows] = await connection.execute(
      `
      SELECT f.id, f.filename, f.filesize, f.filetype, f.base64data, f.upload_date, u.nickname as uploader_nickname
      FROM files f
      JOIN users u ON f.user_id = u.id
      WHERE f.public_link = ? AND f.is_public = 1
    `,
      [link],
    )

    await connection.end()

    const files = rows as any[]

    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        error: "File not found or not public",
      })
    }

    return NextResponse.json({
      success: true,
      file: files[0],
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
  }
}
