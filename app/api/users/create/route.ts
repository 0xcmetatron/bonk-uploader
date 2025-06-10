import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: "31.220.17.137",
  database: "bonkuploader",
  user: "streamly",
  password: "Streamly159@",
}

export async function POST(request: NextRequest) {
  try {
    const { publicKey, nickname } = await request.json()

    const connection = await mysql.createConnection(dbConfig)

    // Check if nickname already exists
    const [existingNickname] = await connection.execute("SELECT id FROM users WHERE nickname = ?", [nickname])

    if ((existingNickname as any[]).length > 0) {
      await connection.end()
      return NextResponse.json({
        success: false,
        error: "Nickname already taken",
      })
    }

    // Check if public key already exists
    const [existingUser] = await connection.execute("SELECT id FROM users WHERE public_key = ?", [publicKey])

    if ((existingUser as any[]).length > 0) {
      await connection.end()
      return NextResponse.json({
        success: false,
        error: "User already exists",
      })
    }

    // Create new user
    await connection.execute("INSERT INTO users (public_key, nickname, created_at) VALUES (?, ?, NOW())", [
      publicKey,
      nickname,
    ])

    await connection.end()

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 })
  }
}
