export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const crypto = await import("crypto")
    const fs = await import("fs")
    const path = await import("path")

    const envPath = path.resolve(process.cwd(), ".env")
    let hash = process.env.SECRET_HASH

    // Auto-generate hash if not set or placeholder
    if (!hash || hash === "your-secret-hash-here") {
      hash = crypto.randomBytes(16).toString("hex")

      // Write or update .env file
      if (fs.existsSync(envPath)) {
        let content = fs.readFileSync(envPath, "utf-8")
        if (content.includes("SECRET_HASH=")) {
          content = content.replace(
            /SECRET_HASH=.*/,
            `SECRET_HASH="${hash}"`
          )
        } else {
          content += `\nSECRET_HASH="${hash}"\n`
        }
        fs.writeFileSync(envPath, content)
      } else {
        fs.writeFileSync(
          envPath,
          `DATABASE_URL="file:./dev.db"\nSECRET_HASH="${hash}"\n`
        )
      }

      process.env.SECRET_HASH = hash

      console.log("\n========================================")
      console.log("  새로운 SECRET_HASH가 생성되었습니다!")
      console.log("  .env 파일에 자동 저장됨")
      console.log("========================================\n")
    }

    const port = process.env.PORT || 3000
    console.log("\n========================================")
    console.log("  가계부 접속 URL:")
    console.log(`  http://localhost:${port}/${hash}`)
    console.log("========================================\n")
  }
}
