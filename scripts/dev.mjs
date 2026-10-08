import { spawn, spawnSync } from 'node:child_process'
import { copyFile, mkdir, open, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const backend = path.join(root, 'backend')
const envFile = path.join(backend, '.env')
const databaseFile = path.join(backend, 'database', 'database.sqlite')

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} gagal dijalankan.`)
}

if (!existsSync(path.join(backend, 'vendor', 'autoload.php'))) {
  console.log('Memasang dependensi Laravel untuk pertama kali…')
  run('composer', ['install', '--no-interaction'], backend)
}

if (!existsSync(envFile)) {
  await copyFile(path.join(backend, '.env.example'), envFile)
}

await mkdir(path.dirname(databaseFile), { recursive: true })
await open(databaseFile, 'a').then(file => file.close())

const env = await readFile(envFile, 'utf8')
if (!/^APP_KEY=base64:.+/m.test(env)) run('php', ['artisan', 'key:generate', '--force'], backend)
console.log('Menyiapkan database SQL dan data awal…')
run('php', ['artisan', 'migrate', '--seed', '--force'], backend)

const processes = []
const stop = () => {
  for (const child of processes) child.kill('SIGTERM')
  process.exit()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)

const api = spawn('php', ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'], { cwd: backend, stdio: 'inherit' })
const web = spawn('npm', ['run', 'dev:frontend', '--', '--host', '127.0.0.1'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' })
const scheduler = spawn('php', ['artisan', 'schedule:work'], { cwd: backend, stdio: 'inherit' })
processes.push(api, web, scheduler)
api.on('error', error => { console.error('Laravel tidak dapat dimulai:', error.message); stop() })
web.on('error', error => { console.error('Vite tidak dapat dimulai:', error.message); stop() })
scheduler.on('error', error => { console.error('Penjadwal email tidak dapat dimulai:', error.message); stop() })
api.on('exit', code => { if (code !== null && code !== 0) stop() })
web.on('exit', code => { if (code !== null && code !== 0) stop() })
scheduler.on('exit', code => { if (code !== null && code !== 0) stop() })
console.log('Careerly API: http://127.0.0.1:8000/api/health')
console.log('Alamat dashboard yang benar ditampilkan oleh Vite pada baris Local di bawah ini.')
