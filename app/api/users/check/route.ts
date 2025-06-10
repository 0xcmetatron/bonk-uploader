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
    const { publicKey } = await request.json()

    const connection = await mysql.createConnection(dbConfig)

    const [rows] = await connection.execute("SELECT nickname FROM users WHERE public_key = ?", [publicKey])

    await connection.end()

    const users = rows as any[]

    if (users.length > 0) {
      return NextResponse.json({
        exists: true,
        nickname: users[0].nickname,
      })
    } else {
      return NextResponse.json({
        exists: false,
      })
    }
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }
}
