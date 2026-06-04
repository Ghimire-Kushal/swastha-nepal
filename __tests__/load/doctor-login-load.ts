/**
 * Load test: 1000 doctor logins
 *
 * Fires in batches of 100 to avoid overwhelming the Node.js listen backlog.
 * Tests both total throughput and system stability under sustained load.
 *
 * Run: npx tsx __tests__/load/doctor-login-load.ts
 *
 * Requirements:
 *   - App server running: npm run dev (or npm start)
 *   - Demo seed already run: npx tsx db/seed-demo.ts
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:3000'
const TOTAL = 1000
const BATCH_SIZE = 100
const DOCTOR_EMAIL = 'doctor1@demo.swastha.np'
const DOCTOR_PASS = 'Demo@1234'

interface Result {
  status: number
  ms: number
  ok: boolean
  error?: string
}

async function singleLogin(): Promise<Result> {
  const start = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/api/load-test/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DOCTOR_EMAIL, password: DOCTOR_PASS }),
    })
    const text = await res.text()
    return { status: res.status, ms: Date.now() - start, ok: res.status === 200 }
  } catch (err: any) {
    return { status: 0, ms: Date.now() - start, ok: false, error: err.message?.slice(0, 60) ?? 'unknown' }
  }
}

async function runBatch(n: number): Promise<Result[]> {
  return Promise.all(Array.from({ length: n }, () => singleLogin()))
}

async function run() {
  console.log(`\n🔥 Load Test: ${TOTAL} doctor logins in batches of ${BATCH_SIZE}`)
  console.log(`   Target: ${BASE_URL}`)
  console.log(`   User:   ${DOCTOR_EMAIL}\n`)

  const allResults: Result[] = []
  const wall = Date.now()
  const batches = Math.ceil(TOTAL / BATCH_SIZE)

  for (let i = 0; i < batches; i++) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL - i * BATCH_SIZE)
    process.stdout.write(`  batch ${i + 1}/${batches} (${batchSize} req)... `)
    const batchStart = Date.now()
    const results = await runBatch(batchSize)
    const passed = results.filter(r => r.ok).length
    console.log(`${passed}/${batchSize} ok — ${Date.now() - batchStart}ms`)
    allResults.push(...results)
  }

  const elapsed = Date.now() - wall
  const passed = allResults.filter(r => r.ok).length
  const failed = allResults.filter(r => !r.ok).length
  const times = allResults.map(r => r.ms).sort((a, b) => a - b)
  const p50 = times[Math.floor(times.length * 0.5)]
  const p95 = times[Math.floor(times.length * 0.95)]
  const p99 = times[Math.floor(times.length * 0.99)]
  const avg = Math.round(times.reduce((s, t) => s + t, 0) / times.length)

  console.log('\n─── Results ──────────────────────────────')
  console.log(`  Total requests : ${TOTAL}`)
  console.log(`  Passed         : ${passed} (${((passed / TOTAL) * 100).toFixed(1)}%)`)
  console.log(`  Failed         : ${failed}`)
  console.log(`  Wall time      : ${elapsed}ms`)
  console.log(`  Throughput     : ${(TOTAL / (elapsed / 1000)).toFixed(1)} req/s`)
  console.log(`  Avg latency    : ${avg}ms`)
  console.log(`  p50 latency    : ${p50}ms`)
  console.log(`  p95 latency    : ${p95}ms`)
  console.log(`  p99 latency    : ${p99}ms`)

  if (failed > 0) {
    const errorMap: Record<string, number> = {}
    allResults.filter(r => !r.ok).forEach(r => {
      const key = r.error ?? `HTTP ${r.status}`
      errorMap[key] = (errorMap[key] ?? 0) + 1
    })
    console.log('\n  Error breakdown:')
    Object.entries(errorMap).forEach(([k, v]) => console.log(`    ${v}x  ${k}`))
  }

  console.log('──────────────────────────────────────────')

  if (failed > TOTAL * 0.05) {
    console.log('\n❌ FAIL — more than 5% of requests failed. Check connection pool config.\n')
    process.exit(1)
  } else {
    console.log('\n✅ PASS — system handled concurrent load within acceptable limits.\n')
  }
}

run()
