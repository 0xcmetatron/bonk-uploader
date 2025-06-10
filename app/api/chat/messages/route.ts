import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: "31.220.17.137",
  database: "bonkuploader",
  user: "streamly",
  password: "Streamly159@",
}

export async function GET() {
  let connection: mysql.Connection | null = null

  try {
    connection = await mysql.createConnection(dbConfig)

    const [rows] = await connection.execute(`
      SELECT id, nickname, message, timestamp, user_public_key
      FROM chat_messages
      ORDER BY timestamp DESC
      LIMIT 50
    `)

    // Reverse to show oldest first
    const messages = (rows as any[]).reverse()

    return NextResponse.json(
      {
        success: true,
        messages,
        count: messages.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Chat messages error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch messages: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
