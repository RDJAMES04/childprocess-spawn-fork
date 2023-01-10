import crypto from 'node:crypto'

// Receive the public key and file from the parent
process.on('message', (data) => {
  const [publicKey, file] = JSON.parse(data.toString())

  try {
    // Encrypt the file using the public key
    const encryptedFile = crypto.publicEncrypt(publicKey, file)
    process.send(encryptedFile)
    // process.stdout.write(encryptedFile)
  } catch (err) {
    console.error(err)
  }
})
