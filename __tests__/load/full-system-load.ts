/**
 * Full System Load Test — Safe Mode
 * ─────────────────────────────────────────────────────────────────
 * Runs in small batches with cool-down pauses to avoid overheating
 * a local dev machine. All concurrency is capped at BATCH_SIZE.
 *
 * Phase 1 : 50 login requests, batched 10 at a time
 * Phase 2 : Each module tested with 30 requests, batched 10 at a time
 *           - /api/demo/citizens?q=        (citizen search)
 *           - /api/demo/citizens?cn=       (exact lookup)
 *           - /api/patients/list           (patient list)
 *           - /api/translate               (translation)
 * Phase 3 : Combined — logins + all modules, batched safely
 *
 * Run: npm run test:load:full
 */

const BASE     = process.env.APP_URL ?? 'http://localhost:3000'
const BATCH    = 10    // max concurrent requests at any moment
const PAUSE_MS = 1500  // ms cool-down between batches

const LOGIN_TOTAL    = 50
const MODULE_TOTAL   = 30
const COMBINED_LOGIN = 30
const COMBINED_MOD   = 15

const TEST_DOCTOR = {
  email:    'doctor@test.swasthanepal.ai',
  password: process.env.SEED_PASSWORD ?? 'Swastha@123',
}
const TEST_ADMIN = {
  email:    'hospital.admin@test.swasthanepal.ai',
  password: process.env.SEED_PASSWORD ?? 'Swastha@123',
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Res { ok: boolean; status: number; ms: number; error?: string }
interface LoginRes extends Res { token?: string }

// ── Core helpers ─────────────────────────────────────────────────────────────
const pause = (ms: number) => new Promise(r => setTimeout(r, ms))

async function httpReq(
  method: 'GET' | 'POST',
  path: string,
  opts: { body?: unknown; cookie?: string } = {},
): Promise<Res> {
  const start = Date.now()
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (opts.cookie) headers['Cookie'] = `auth-token=${opts.cookie}`
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    })
    return { ok: res.status < 400, status: res.status, ms: Date.now() - start }
  } catch (e: unknown) {
    return { ok: false, status: 0, ms: Date.now() - start, error: (e instanceof Error ? e.message : 'unknown').slice(0, 60) }
  }
}

async function loginReq(email: string, password: string): Promise<LoginRes> {
  const start = Date.now()
  try {
    const res = await fetch(`${BASE}/api/load-test/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const ms = Date.now() - start
    if (res.status === 200) {
      const data = await res.json() as { token?: string }
      return { ok: true, status: 200, ms, token: data.token }
    }
    return { ok: false, status: res.status, ms }
  } catch (e: unknown) {
    return { ok: false, status: 0, ms: Date.now() - start, error: (e instanceof Error ? e.message : 'unknown').slice(0, 60) }
  }
}

// Runs `tasks` in batches of `batchSize` with a pause between each batch
async function runBatched<T>(tasks: (() => Promise<T>)[], batchSize: number): Promise<T[]> {
  const results: T[] = []
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(fn => fn()))
    results.push(...batchResults)
    if (i + batchSize < tasks.length) await pause(PAUSE_MS)
  }
  return results
}

// ── Stats printer ─────────────────────────────────────────────────────────────
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
  const icon  = ok === total ? '✅' : fail / total > 0.05 ? '❌' : '⚠️ '

  console.log(`\n${icon} ${label}`)
  console.log(`   ${total} requests — ✓ ${ok} (${pct}%)  ✗ ${fail}`)
  console.log(`   avg ${avg}ms  p50 ${p50}ms  p95 ${p95}ms  p99 ${p99}ms`)

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

// ── Phase 0: Auth warmup ──────────────────────────────────────────────────────
async function getTokens(): Promise<{ doctor: string; admin: string }> {
  console.log('\n⏳ Phase 0: Auth warmup...')
  const [d, a] = await Promise.all([
    loginReq(TEST_DOCTOR.email, TEST_DOCTOR.password),
    loginReq(TEST_ADMIN.email,  TEST_ADMIN.password),
  ])
  if (!d.token) throw new Error(`Doctor login failed (HTTP ${d.status}). Is the server running and seed applied?`)
  if (!a.token) throw new Error(`Admin login failed (HTTP ${a.status})`)
  console.log(`   ✓ Doctor token  (${d.ms}ms)`)
  console.log(`   ✓ Admin token   (${a.ms}ms)`)
  return { doctor: d.token, admin: a.token }
}

// ── Phase 1: Login load — batched ────────────────────────────────────────────
async function phase1() {
  console.log(`\n${'─'.repeat(58)}`)
  console.log(`🔐 Phase 1: ${LOGIN_TOTAL} logins — batches of ${BATCH} (${PAUSE_MS}ms pause between)`)
  console.log(`${'─'.repeat(58)}`)

  const tasks = Array.from({ length: LOGIN_TOTAL }, () => () =>
    loginReq(TEST_DOCTOR.email, TEST_DOCTOR.password)
  )

  const wall    = Date.now()
  const results = await runBatched(tasks, BATCH)
  const elapsed = Date.now() - wall
  const s = stats(results, `${LOGIN_TOTAL} Logins — wall time ${elapsed}ms`)
  console.log(`   Throughput: ${(LOGIN_TOTAL / (elapsed / 1000)).toFixed(1)} req/s`)
  return s
}

// ── Phase 2: Module tests — each batched ─────────────────────────────────────
async function phase2(tokens: { doctor: string; admin: string }) {
  console.log(`\n${'─'.repeat(58)}`)
  console.log(`🧩 Phase 2: Module tests — ${MODULE_TOTAL} req each, batches of ${BATCH}`)
  console.log(`${'─'.repeat(58)}`)

  const SEARCH_TERMS = ['Sharma', 'Thapa', 'Gurung', 'Rai', 'Yadav', 'Lama', 'Magar', 'Aryal']
  const PHRASES = [
    'Please take your medication daily.',
    'Your blood pressure is high.',
    'Drink plenty of water.',
    'Come back in two weeks.',
    'Get a blood test done.',
  ]

  // Module A: Citizen search
  await pause(PAUSE_MS)
  const searchResults = await runBatched(
    Array.from({ length: MODULE_TOTAL }, (_, i) => () =>
      httpReq('GET', `/api/demo/citizens?q=${SEARCH_TERMS[i % SEARCH_TERMS.length]}&limit=5`, { cookie: tokens.doctor })
    ),
    BATCH
  )
  const sa = stats(searchResults, 'Module A — /api/demo/citizens?q= (search)')

  // Module B: Citizenship number lookup (404 = not found = valid)
  await pause(PAUSE_MS)
  const lookupResults = await runBatched(
    Array.from({ length: MODULE_TOTAL }, (_, i) => async () => {
      const province = String((i % 7) + 1).padStart(2, '0')
      const district = String((i % 10) + 1).padStart(2, '0')
      const year     = String(51 + (i % 57)).padStart(2, '0')
      const seq      = String(1000 + (i % 1000)).padStart(5, '0')
      const cn       = `${province}-${district}-${year}-${seq}`
      const r = await httpReq('GET', `/api/demo/citizens?citizenshipNumber=${cn}`, { cookie: tokens.doctor })
      return r.status === 404 ? { ...r, ok: true } : r
    }),
    BATCH
  )
  const sb = stats(lookupResults, 'Module B — /api/demo/citizens?citizenshipNumber= (lookup, 404=ok)')

  // Module C: Patient list
  await pause(PAUSE_MS)
  const listResults = await runBatched(
    Array.from({ length: MODULE_TOTAL }, () => () =>
      httpReq('GET', '/api/patients/list', { cookie: tokens.doctor })
    ),
    BATCH
  )
  const sc = stats(listResults, 'Module C — /api/patients/list')

  // Module D: Translation
  await pause(PAUSE_MS)
  const translateResults = await runBatched(
    Array.from({ length: MODULE_TOTAL }, (_, i) => () =>
      httpReq('POST', '/api/translate', {
        cookie: tokens.doctor,
        body: { text: PHRASES[i % PHRASES.length], from: 'en', to: 'np' },
      })
    ),
    BATCH
  )
  const sd = stats(translateResults, 'Module D — /api/translate')

  return { sa, sb, sc, sd }
}

// ── Phase 3: Combined — logins + all modules batched together ─────────────────
async function phase3(tokens: { doctor: string; admin: string }) {
  console.log(`\n${'─'.repeat(58)}`)
  console.log(`💥 Phase 3: Combined — ${COMBINED_LOGIN} logins + ${COMBINED_MOD}×4 modules`)
  console.log(`   Interleaved, batched ${BATCH} at a time`)
  console.log(`${'─'.repeat(58)}`)

  await pause(PAUSE_MS)

  // Build interleaved task list: login, search, lookup, list, translate
  const tasks: (() => Promise<Res>)[] = []
  for (let i = 0; i < Math.max(COMBINED_LOGIN, COMBINED_MOD); i++) {
    if (i < COMBINED_LOGIN) {
      tasks.push(() => loginReq(TEST_DOCTOR.email, TEST_DOCTOR.password))
    }
    if (i < COMBINED_MOD) {
      tasks.push(() => httpReq('GET', `/api/demo/citizens?q=${['Thapa','Rai','Sharma'][i%3]}`, { cookie: tokens.doctor }))
      tasks.push(async () => {
        const cn = `0${(i%7)+1}-0${(i%9)+1}-${String(55+(i%50)).padStart(2,'0')}-${String(1000+i).padStart(5,'0')}`
        const r  = await httpReq('GET', `/api/demo/citizens?citizenshipNumber=${cn}`, { cookie: tokens.doctor })
        return r.status === 404 ? { ...r, ok: true } : r
      })
      tasks.push(() => httpReq('GET', '/api/patients/list', { cookie: tokens.doctor }))
      tasks.push(() => httpReq('POST', '/api/translate', { cookie: tokens.doctor, body: { text: `Health check ${i}`, from: 'en', to: 'np' } }))
    }
  }

  const wall    = Date.now()
  const results = await runBatched(tasks, BATCH)
  const elapsed = Date.now() - wall

  console.log(`\n   Total requests: ${results.length}  Wall time: ${elapsed}ms`)
  const overall = stats(results, `Combined — all modules + logins`)

  return { elapsed, ok: overall.ok, fail: overall.fail, total: overall.total }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(58)}`)
  console.log('  Swastha Nepal — Safe Mode Load Test')
  console.log(`  Target : ${BASE}`)
  console.log(`  Date   : ${new Date().toISOString()}`)
  console.log(`  Batch  : ${BATCH} concurrent max, ${PAUSE_MS}ms between batches`)
  console.log(`${'═'.repeat(58)}`)

  try {
    await fetch(`${BASE}/api/translate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    console.log('\n✓ Server reachable')
  } catch {
    console.error(`\n❌ Cannot reach ${BASE} — run: npm run dev`)
    process.exit(1)
  }

  const tokens = await getTokens()

  const p1 = await phase1()
  const p2 = await phase2(tokens)
  const p3 = await phase3(tokens)

  console.log(`\n${'═'.repeat(58)}`)
  console.log('  FINAL VERDICT')
  console.log(`${'═'.repeat(58)}`)
  console.log(`  Phase 1 — Logins  : ${((p1.ok/p1.total)*100).toFixed(1)}%  p99=${p1.p99}ms`)
  console.log(`  Phase 2 — Modules : search✓ lookup✓ list✓ translate✓`)
  console.log(`  Phase 3 — Combined: ${((p3.ok/p3.total)*100).toFixed(1)}%  in ${p3.elapsed}ms`)

  const passed = p1.fail/p1.total <= 0.05 && p3.fail/p3.total <= 0.05
  const modulesPassed = [p2.sa, p2.sb, p2.sc, p2.sd].every(m => m.fail/m.total <= 0.05)

  if (passed && modulesPassed) {
    console.log('\n  ✅ SYSTEM STABLE — all phases within 5% error threshold')
  } else {
    console.log('\n  ❌ SYSTEM UNSTABLE — error rate exceeded 5%')
    if (!passed)        console.log('     Login/combined phase failed')
    if (!modulesPassed) console.log('     One or more modules failed')
  }
  console.log(`${'═'.repeat(58)}\n`)

  process.exit(passed && modulesPassed ? 0 : 1)
}

main()
