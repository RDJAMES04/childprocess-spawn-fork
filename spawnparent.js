import { spawn } from 'node:child_process'
import fs from 'node:fs'
import crypto from 'node:crypto'

// Read the file that we want to encrypt
const fileContent = fs.readFileSync('./file.txt', 'utf8')

// Generate a public/private key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'passphrase',
  },
})

// Spawn a child process
const child = spawn('node', ['./pushchild.js'])

// Send the public key and file to the child
child.stdin.write(JSON.stringify([publicKey, fileContent]))

// Receive the encrypted file from the child
child.stdout.on('data', (data) => {
  const encryptedFile = data

  const startTime = Date.now()

  try {
    const decryptedFile = crypto.privateDecrypt({ key: privateKey, passphrase: 'passphrase' }, (encryptedFile))

    child.kill()
    const endTime = Date.now()
    // Verify that the encrypted file is actually the original file
    console.log(`Verification ${(decryptedFile.toString() === fileContent) ? 'succeeded' : 'failed'}.`)
    console.log(`Execution time: ${endTime - startTime}ms.`)
    const memoryUsage = process.memoryUsage()
    console.log(`Memory usage: ${memoryUsage.rss} bytes`)
  } catch (err) {
    console.error(err)
  }
})
