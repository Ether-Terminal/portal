# Ether OS & Web Portal: Pre-Obfuscation Master Roadmap

This document serves as the permanent reference and execution guide for the production hardening, obfuscation, and deployment of the **Ether Terminal** ecosystem.

---

## 1. Core Architecture Rule: The Dual-Zone Model

When the platform is obfuscated and shipped, it strictly preserves the **Dual-Zone Architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ETHER OS ARCHITECTURE                           │
├───────────────────────────────────┬────────────────────────────────────┤
│       ZONE 1: CORE KERNEL         │     ZONE 2: ENTERPRISE EXTENSION   │
│     (Proprietary & Obfuscated)    │      (100% Configurable by IT)     │
├───────────────────────────────────┼────────────────────────────────────┤
│ • EtherCore Enclave Engine        │ • /Enterprise Directory & Modules  │
│ • FIPS-140-3 Hardware Lease Clock │ • EnterprisePatch.swift            │
│ • Ultrasonic Air-Gap Diode        │ • Custom Modules Builder (+Tabs)   │
│ • Novo Statutory Licensing Vault  │ • Enterprise LLM Hub (Claude/vLLM) │
│ • Proprietary Actuarial Logic     │ • Dynamic JSON Schema Registry     │
│ 🔒 [L5 HOMOMORPHICALLY SEALED]    │ 🛠️ [MUTABLE BY BUYER IT OFFICERS]  │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Protection & Extensibility Guarantees
1. **Zero Core IP Leakage**: Competitors or third-party auditors cannot reverse-engineer the proprietary core algorithms or bypass licensing.
2. **Full IT Department Power**: The buyer's IT department can still open the **ETSTHER DevSecOps tab [17]** to:
   - Edit `EnterprisePatch.swift` (branding, auto-settlement caps, risk thresholds).
   - Create custom tabs & visual dashboards via the Module Builder Wizard.
   - Point the AI gateway to their private LLM endpoints (Claude, Azure, local vLLM).
   - Inject dynamic JSON schemas for carrier integrations (Guidewire, Duck Creek).
   - Trigger `SAVE & AUDIT` and `HOT-RELOAD OS` in real time.
3. **`LeaseShieldEngine` Guardrail**:
   - Custom business logic compiles with `[Lease Shield: PASS]`.
   - Any attempt to tamper with the lease timer or crack licensing triggers `CORE_MUTATION_DENIED` and is halted.

---

## 2. Pre-Obfuscation Master Checklist

Obfuscation is an irreversible, one-way compile step. The following steps must be completed before running the obfuscation build:

### Phase A: Source Code Baseline & Git Freezing
- [ ] **Tag Clean Source**: Run `git tag -a v1.0.0-source-pristine -m "Pristine readable source prior to obfuscation"` in both repositories:
  - `Desktop/Ether-Web`
  - `Ether_Sovereign_Backend`
- [ ] **Dedicated Build Output**: Configure all obfuscation output to write strictly to `/dist` or `/build` directories. Never run in-place destructive obfuscation on source files.

### Phase B: Frontend & Web Verification
- [ ] **Directive Memorandum (`signature.html`)**:
  - [x] Responsive layout: Licensing & Licensor cards remain 100% inside the double gold frame.
  - [x] Zero viewport displacement when switching signature modes or tapping `✓ Done`.
  - [x] Instant notification to Discord (`#ether-ntfy-ops`) and Ntfy upon signature lock.
  - [ ] **Print-to-PDF Formatting**: Open print dialog on Chrome and Safari; confirm page breaks cleanly on Letter Portrait with zero cutoffs or UI artifacting.
  - [ ] **Treasury Wire Verification**: Re-verify Middlesex Federal Savings FA / Novo Fedwire details:
    - Routing (ABA): `211370150`
    - Account: `103650380`
- [ ] **Portal Landing Page (`index.html`)**:
  - [ ] Test all lead modals (Waitlist, Directive Reservation, Custom Tier, Contact Form).
  - [ ] Confirm all forms route silently through `/.netlify/functions/discord-notify` with `@everyone` push notification enabled.

### Phase C: Secrets & Environmental Isolation
- [ ] **Zero Hardcoded Secrets**: Ensure no webhook tokens, private keys, or personal emails exist in client-side HTML/JS.
- [ ] **Serverless Function Isolation**: Confirm all outgoing relays remain in Netlify serverless functions (`DISCORD_WEBHOOK_URL`, `NTFY_TOPIC`).
- [ ] **CORS Production Lockdown**: Lock `Access-Control-Allow-Origin` in serverless functions to `https://ether-terminal.com`.

### Phase D: Obfuscation Configuration Rules
- [ ] **Reserved DOM Identifiers**:
  - Prevent function mangling for functions invoked from HTML attributes:
    `setSigMode`, `onDoneClicked`, `clearSigCanvas`, `attemptPrint`, `attemptEmailAccounting`, `onFieldChange`, `onFieldBlur`, `attemptRemint`.
  - Preserve DOM ID string literals (`buyerSigCanvas`, `btnSigDone`, `inCompany`, etc.).
- [ ] **String Array Obfuscation**: Use moderate encoding to maintain sub-second page execution speeds on mobile devices.

### Phase E: Binary & Native Layer Obfuscation
- [ ] **Rust Core (`ether_os/rust_core`)**: Build with `cargo build --release` and configure `strip = true` in `Cargo.toml`.
- [ ] **Python Backend (`backend/`)**: Compile to optimized `.pyc` bytecode bundles.
- [ ] **Swift Simulator / macOS Build**: Compile in Release configuration with full symbol stripping (`STRIP_INSTALLED_PRODUCT = YES`).

---

## 3. Post-Obfuscation Smoke Test Protocol

Once the obfuscated build is produced, execute this 3-minute smoke test:
1. Open obfuscated `signature.html`: sign, click `Done`, verify Discord alert fires with green badge.
2. Open obfuscated `index.html`: submit test lead, verify webhook dispatch.
3. Open `ETSTHER DevSecOps`: make a minor change in `EnterprisePatch.swift`, click `SAVE & AUDIT` -> verify build succeeds and OS hot-reloads.
