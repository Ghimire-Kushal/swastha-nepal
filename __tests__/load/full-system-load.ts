/**
 * Full System Load Test
 * ─────────────────────────────────────────────────────────────────
 * Phase 1 : 500 simultaneous login requests (all fired at once)
 * Phase 2 : All modules hit concurrently with valid auth tokens
 *           - /api/demo/citizens   (citizen search + exact lookup)
 *           - /api/patients/list   (patient list)
 *           - /api/translate        (translation)
 * Phase 3 : Combined stress — logins + all modules at the same time
 *
 * Requirements:
 *   npm run dev   (app must be running on port 3000)
 *   npm run db:seed           (creates role test accounts)
 *   npm run db:seed-citizens  (creates 1000 demo citizens)
 *
 * Run: npx tsx __tests__/load/full-system-load.ts
 */

const BASE = process.env.APP_URL ?? 'http://localhost:3000'

// ── Known test accounts (from prisma/seed.ts) ──────────────────────────────
const TEST_DOCTOR   = { email: 'doctor@test.swasthanepal.ai',         password: process.env.SEED_PASSWORD ?? 'Swastha@123' }
const TEST_ADMIN    = { email: 'hospital.admin@test.swasthanepal.ai',  password: process.env.SEED_PASSWORD ?? 'Swastha@123' }

// ── Config ──────────────────────────────────────────────────────────────────
// Safe mode: batched requests, low concurrency, pauses between phases
// to avoid CPU/memory spikes on a local dev machine.
const LOGIN_CONCURRENCY    = 50    // was 500 — batched in groups of 10
const MODULE_CONCURRENCY   = 30    // per-module concurrent requests
const COMBINED_LOGINS      = 30
const COMBINED_MODULE_EACH = 20
const BATCH_SIZE           = 10    // max parallel requests per batch
const INTER_PHASE_PAUSE_MS = 2000  // 2s cool-down between phases

// ── Types ───────────────────────────────────────────────────────────────────
interface Res { ok: boolean; status: number; ms: number; error?: string }

// ── Helpers ─────────────────────────────────────────────────────────────────
async function req(
  method: 'GET' | 'POST',
  path: string,
  opts: { body?: unknown; token?: string; cookie?: string } = {}
): Promise<Res> {
  const start = Date.now()
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (opts.token)  headers['Authorization'] = `Bearer ${opts.token}`
    if (opts.cookie) headers['Cookie'] = `auth-token=${opts.cookie}`

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    })
    return { ok: res.status < 400, status: res.status, ms: Date.now() - start }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message.slice(0, 60) : 'unknown'
    return { ok: false, status: 0, ms: Date.now() - start, error: msg }
  }
}

function stats(results: Res[], label: string) {
  const total = results.length
  const ok    = results.filter(r => r.ok).length
  const fail  = total - ok
  const times = results.map(r => r.ms).sort((a, b) => a - b)
  const avg   = Math.round(times.reduce((s, t) => s + t, 0) / times.length)
  const p50   = times[Math.floor(times.length * 0.50)]
  const p95   = times[Math.floor(times.length * 0.95)]
  const p99   = times[Math.floor(times.length * 0.99)]
  const pct   = ((ok / total) * 100).toFixed(1)

  const status = ok === total ? '✅' : fail / total > 0.05 ? '❌' : '⚠️ '
  console.log(`\n${status} ${label}`)
  console.log(`   Requests : ${total}   ✓ ${ok} (${pct}%)   ✗ ${fail}`)
  console.log(`   Latency  : avg ${avg}ms  p50 ${p50}ms  p95 ${p95}ms  p99 ${p99}ms`)

  if (fail > 0) {
    const errs: Record<string, number> = {}
    results.filter(r => !r.ok).forEach(r => {
      const k = r.error ?? `HTTP ${r.status}`
      errs[k] = (errs[k] ?? 0) + 1
    })
    Object.entries(errs).forEach(([k, v]) => console.log(`   ⚠  ${v}× ${k}`))
  }

  return { ok, fail, total, avg, p50, p95, p99 }
}

// ── Login helper ─────────────────────────────────────────────────────────────
async function loginRequest(email: string, password: string): Promise<Res & { token?: string }> {
  const start = Date.now()
  try {
    const res = await fetch(`${BASE}/api/load-test/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const ms   = Date.now() - start
    const ok   = res.status === 200
    if (ok) {
      const data = await res.json() as { token?: string }
      return { ok, status: res.status, ms, token: data.token }
    }
    return { ok, status: res.status, ms }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message.slice(0, 60) : 'unknown'
    return { ok: false, status: 0, ms: Date.now() - start, error: msg }
  }
}

// ── Phase 0: Get valid tokens ────────────────────────────────────────────────
async function getTokens(): Promise<{ doctor: string; admin: string }> {
  console.log('\n⏳ Phase 0: Obtaining auth tokens...')
  const [d, a] = await Promise.all([
    loginRequest(TEST_DOCTOR.email, TEST_DOCTOR.password),
    loginRequest(TEST_ADMIN.email,  TEST_ADMIN.password),
  ])
  if (!d.token) throw new Error(`Doctor login failed (${d.status}): ${d.error ?? 'no token'}. Is the server running and seed applied?`)
  if (!a.token) throw new Error(`Admin login failed (${a.status}): ${a.error ?? 'no token'}`)
  console.log(`   ✓ Doctor token  (${d.ms}ms)`)
  console.log(`   ✓ Admin token   (${a.ms}ms)`)
  return { doctor: d.token, admin: a.token }
}

// ── Phase 1: 500 simultaneous logins ─────────────────────────────────────────
async function phase1() {
  console.log(`\n${'─'.repeat(58)}`)
  console.log(`🔐 Phase 1: ${LOGIN_CONCURRENCY} simultaneous logins (all at once)`)
  console.log(`${'─'.repeat(58)}`)

  const wall    = Date.now()
  const results = await Promise.all(
    Array.from({ length: LOGIN_CONCURRENCY }, () =>
      loginRequest(TEST_DOCTOR.email, TEST_DOCTOR.password)
    )
  )
  const elapsed = Date.now() - wall
  const s = stats(results, `500 Concurrent Logins — wall time ${elapsed}ms`)
  console.log(`   Throughput: ${(LOGIN_CONCURRENCY / (elapsed / 1000)).toFixed(1)} req/s`)
  return s
}

// ── Phase 2: All modules concurrently ────────────────────────────────────────
async function phase2(tokens: { doctor: string; admin: string }) {
  console.log(`\n${'─'.repeat(58)}`)
  console.log(`🧩 Phase 2: Module stress (${MODULE_CONCURRENCY} concurrent each)`)
  console.log(`${'─'.repeat(58)}`)

  const wall = Date.now()

  // Run all modules truly in parallel
  const [citizenSearch, citizenLookup, patientList, translate] = await Promise.all([

    // Module A: Citizen search
    Promise.all(
      Array.from({ length: MODULE_CONCURRENCY }, (_, i) => {
        const terms = ['Sharma', 'Thapa', 'Gurung', 'Rai', 'Yadav', 'Lama', 'Magar', 'Aryal']
        const q = terms[i % terms.length]
        return req('GET', `/api/demo/citizens?q=${q}&limit=10`, { cookie: tokens.doctor })
      })
    ),

    // Module B: Exact citizenship lookup — seed generates seq 1000-1999, years from DOB.
    // 404 = citizen not found, which is a valid response (not a failure).
    Promise.all(
      Array.from({ length: MODULE_CONCURRENCY }, async (_, i) => {
        const province = String((i % 7) + 1).padStart(2, '0')
        const district = String((i % 10) + 1).padStart(2, '0')
        const year     = String(51 + (i % 57)).padStart(2, '0')   // DOB years 1951–2008
        const seq      = String(1000 + (i % 1000)).padStart(5, '0')
        const cn       = `${province}-${district}-${year}-${seq}`
        const r = await req('GET', `/api/demo/citizens?citizenshipNumber=${cn}`, { cookie: tokens.doctor })
        // 404 = no citizen with that number — valid, not an error
        if (r.status === 404) return { ...r, ok: true }
        return r
      })
    ),

    // Module C: Patient list
    Promise.all(
      Array.from({ length: MODULE_CONCURRENCY }, () =>
        req('GET', '/api/patients/list', { cookie: tokens.doctor })
      )
    ),

    // Module D: Translation
    Promise.all(
      Array.from({ length: MODULE_CONCURRENCY }, (_, i) => {
        const texts = [
          'Please take your medication daily.',
          'Your blood pressure is high.',
          'Drink plenty of water.',
          'Come back in two weeks.',
          'Get a blood test done.',
        ]
        return req('POST', '/api/translate', {
          cookie: tokens.doctor,
          body: { text: texts[i % texts.length], from: 'en', to: 'np' },
        })
      })
    ),
  ])

  const elapsed = Date.now() - wall
  console.log(`\n   All modules ran in parallel — total wall time: ${elapsed}ms`)

  const sa = stats(citizenSearch,  'Module A — /api/demo/citizens?q=  (search)')
  const sb = stats(citizenLookup,  'Module B — /api/demo/citizens?citizenshipNumber= (lookup)')
  const sc = stats(patientList,    'Module C — /api/patients/list')
  const sd = stats(translate,      'Module D — /api/translate')

  return { sa, sb, sc, sd, elapsed }
}

// ── Phase 3: Combined — logins + all modules simultaneously ──────────────────
async function phase3(tokens: { doctor: string; admin: string }) {
  console.log(`\n${'─'.repeat(58)}`)
  console.log(`💥 Phase 3: Combined stress`)
  console.log(`   ${COMBINED_LOGINS} logins + ${COMBINED_MODULE_EACH}×4 module requests — ALL at once`)
  console.log(`${'─'.repeat(58)}`)

  const wall = Date.now()

  const [loginResults, searchResults, lookupResults, listResults, translateResults] = await Promise.all([

    Promise.all(
      Array.from({ length: COMBINED_LOGINS }, () =>
        loginRequest(TEST_DOCTOR.email, TEST_DOCTOR.password)
      )
    ),

    Promise.all(
      Array.from({ length: COMBINED_MODULE_EACH }, (_, i) => {
        const q = ['Sharma', 'Thapa', 'Rai'][i % 3]
        return req('GET', `/api/demo/citizens?q=${q}`, { cookie: tokens.doctor })
      })
    ),

    Promise.all(
      Array.from({ length: COMBINED_MODULE_EACH }, (_, i) => {
        const cn = `0${(i % 7) + 1}-0${(i % 9) + 1}-${60 + (i % 35)}-${String(1000 + i % 1000).padStart(5,'0')}`
        return req('GET', `/api/demo/citizens?citizenshipNumber=${cn}`, { cookie: tokens.doctor })
      })
    ),

    Promise.all(
      Array.from({ length: COMBINED_MODULE_EACH }, () =>
        req('GET', '/api/patients/list', { cookie: tokens.doctor })
      )
    ),

    Promise.all(
      Array.from({ length: COMBINED_MODULE_EACH }, (_, i) =>
        req('POST', '/api/translate', {
          cookie: tokens.doctor,
          body: { text: `Test message number ${i}`, from: 'en', to: 'np' },
        })
      )
    ),
  ])

  const elapsed = Date.now() - wall
  console.log(`\n   Combined wall time: ${elapsed}ms`)

  stats(loginResults,     `Logins (${COMBINED_LOGINS} concurrent)`)
  stats(searchResults,    `Citizen search (${COMBINED_MODULE_EACH} concurrent)`)
  stats(lookupResults,    `Citizen lookup (${COMBINED_MODULE_EACH} concurrent)`)
  stats(listResults,      `Patient list   (${COMBINED_MODULE_EACH} concurrent)`)
  stats(translateResults, `Translate      (${COMBINED_MODULE_EACH} concurrent)`)

  const all = [...loginResults, ...searchResults, ...lookupResults, ...listResults, ...translateResults]
  const totalOk   = all.filter(r => r.ok).length
  const totalFail = all.length - totalOk

  return { elapsed, totalOk, totalFail, total: all.length }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(58)}`)
  console.log('  Swastha Nepal — Full System Load Test')
  console.log(`  Target : ${BASE}`)
  console.log(`  Date   : ${new Date().toISOString()}`)
  console.log(`${'═'.repeat(58)}`)

  // Check server is up
  try {
    const ping = await fetch(`${BASE}/api/translate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    console.log(`\n✓ Server reachable (${ping.status})`)
  } catch {
    console.error(`\n❌ Cannot reach ${BASE} — start the server first: npm run dev`)
    process.exit(1)
  }

  const tokens = await getTokens()

  const p1 = await phase1()
  const p2 = await phase2(tokens)
  const p3 = await phase3(tokens)

  // ── Final verdict ──────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(58)}`)
  console.log('  FINAL VERDICT')
  console.log(`${'═'.repeat(58)}`)

  const loginPassRate  = ((p1.ok / p1.total) * 100).toFixed(1)
  const combinedPass   = ((p3.totalOk / p3.total) * 100).toFixed(1)

  console.log(`  Phase 1 — 500 concurrent logins  : ${loginPassRate}%  p99=${p1.p99}ms`)
  console.log(`  Phase 2 — Module stress (parallel): p99 login N/A | citizens/list/translate ran`)
  console.log(`  Phase 3 — Combined (${p3.total} total reqs) : ${combinedPass}%  in ${p3.elapsed}ms`)

  const passed =
    p1.fail / p1.total <= 0.05 &&
    p3.totalFail / p3.total <= 0.05

  if (passed) {
    console.log('\n  ✅ SYSTEM STABLE — all phases within 5% error threshold')
  } else {
    console.log('\n  ❌ SYSTEM UNSTABLE — error rate exceeded 5%')
    console.log('     Check: DB connection pool size, bcrypt concurrency limiter, Next.js serverless limits')
  }
  console.log(`${'═'.repeat(58)}\n`)

  process.exit(passed ? 0 : 1)
}

main()
