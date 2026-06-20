import fs from 'fs'
import path from 'path'

const srcDir = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\24113489-32bc-40cd-be70-de94eee858b1'
const destDir = 'c:\\Users\\Dell\\OneDrive\\Desktop\\flash\\public\\portfolio'

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
}

const files = [
  { src: 'aura_branding_1781840451433.png', dest: 'aura_branding.png' },
  { src: 'nexis_marketing_1781840465556.png', dest: 'nexis_marketing.png' }
]

files.forEach(f => {
  const srcPath = path.join(srcDir, f.src)
  const destPath = path.join(destDir, f.dest)
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath)
    console.log(`Successfully copied ${f.src} -> ${f.dest}`)
  } else {
    console.warn(`Source file not found: ${srcPath}`)
  }
})
