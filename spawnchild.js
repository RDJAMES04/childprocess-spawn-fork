import crypto from 'node:crypto'

// Receive the public key and file from the parent
process.stdin.on('data', (data) => {
  const [publicKey, file] = JSON.parse(data.toString())
  try {
    // Encrypt the file using the public key
    const encryptedFile = crypto.publicEncrypt(publicKey, file)
    process.stdout.write(encryptedFile)
  } catch (err) {
    console.error(err)
  }
})
