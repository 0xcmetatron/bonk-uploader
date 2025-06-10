import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: "31.220.17.137",
  database: "bonkuploader",
  user: "streamly",
  password: "Streamly159@",
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null

  try {
    const body = await request.json()
    const { nickname, message, userPublicKey } = body

    console.log("Chat send request:", { nickname, message, userPublicKey })

    if (!nickname || !message || !userPublicKey) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
      })
    }

    // Validate message length
    if (message.length > 500) {
      return NextResponse.json({
        success: false,
        error: "Message too long (max 500 characters)",
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // Verify user exists
    const [userCheck] = await connection.execute("SELECT id FROM users WHERE public_key = ? AND nickname = ?", [
      userPublicKey,
      nickname,
    ])

    if ((userCheck as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        error: "User verification failed",
      })
    }

    // Insert message
    const [result] = await connection.execute(
      "INSERT INTO chat_messages (nickname, message, timestamp, user_public_key) VALUES (?, ?, NOW(), ?)",
      [nickname, message.trim(), userPublicKey],
    )

    console.log("Message inserted successfully:", result)

    return NextResponse.json({
      success: true,
      messageId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Chat send error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
