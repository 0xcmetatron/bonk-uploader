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
  let connection: mysql.Connection | null = null

  try {
    const body = await request.json()
    const { filename, filesize, filetype, base64data, userPublicKey, isPublic } = body

    console.log("Upload request received:", {
      filename,
      filesize,
      filetype,
      userPublicKey,
      isPublic,
      isPublicType: typeof isPublic,
    })

    if (!filename || !filesize || !filetype || !base64data || !userPublicKey) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields",
      })
    }

    connection = await mysql.createConnection(dbConfig)

    // Get user ID
    const [userRows] = await connection.execute("SELECT id FROM users WHERE public_key = ?", [userPublicKey])

    const users = userRows as any[]
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: "User not found",
      })
    }

    const userId = users[0].id

    // Convert isPublic to proper boolean and generate public link
    const isFilePublic = Boolean(isPublic)
    let publicLink = null

    if (isFilePublic) {
      publicLink = randomBytes(16).toString("hex")
      console.log("Generated public link:", publicLink)
    }

    console.log("Inserting file with values:", {
      userId,
      filename,
      filesize,
      filetype,
      isFilePublic,
      publicLink,
    })

    // Insert file with explicit boolean conversion
    const [result] = await connection.execute(
      `INSERT INTO files (user_id, filename, filesize, filetype, base64data, upload_date, is_public, public_link) 
       VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [userId, filename, filesize, filetype, base64data, isFilePublic ? 1 : 0, publicLink],
    )

    const insertId = (result as any).insertId
    console.log("File inserted successfully with ID:", insertId)

    // Verify the insertion
    const [verifyRows] = await connection.execute(
      "SELECT id, filename, is_public, public_link FROM files WHERE id = ?",
      [insertId],
    )

    const verifyData = (verifyRows as any[])[0]
    console.log("Verification data:", verifyData)

    return NextResponse.json({
      success: true,
      publicLink: publicLink,
      fileId: insertId,
      isPublic: isFilePublic,
      verification: verifyData,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
