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
const child = spawn('node', ['./spawnchild.js'])

// Send the public key and file to the child
child.stdin.write(JSON.stringify([publicKey, fileContent]))

// Receive the encrypted file from the child
child.stdout.on('data', (data) => {
  const encryptedFile = data

  try {
    const decryptedFile = crypto.privateDecrypt({ key: privateKey, passphrase: 'passphrase' }, (encryptedFile))

    child.kill()

    // Verify that the encrypted file is actually the original file
    const memoryUsage = process.memoryUsage()
    console.table({
      Verification: `${(decryptedFile.toString() === fileContent) ? 'succeeded' : 'failed'}`,
      Memory: `${memoryUsage.rss} bytes`,
      Uptime: `${process.uptime()} seconds`,
    })
  } catch (err) {
    console.error(err)
  }
})
