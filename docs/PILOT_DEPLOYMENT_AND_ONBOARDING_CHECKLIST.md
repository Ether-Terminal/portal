# Sovereign Ether OS // Enterprise Pilot Deployment & Onboarding Checklist
**Document ID:** `ETH-PILOT-ONBOARDING-2026.09`  
**Target Audience:** Carrier Project Sponsors, Lead Solutions Architects, Fleet Operations Directors, Chief Risk Officers  
**System Target:** Sovereign Ether OS (`v1.0.0-institutional-final`)  
**Deployment Duration:** 30 Calendar Days (Day-0 Bench Readiness to Day-30 Production Transition)

---

## 1. Executive Summary & Deployment Objectives

This runbook defines the structured, stage-gated implementation roadmap for commissioning **Sovereign Ether OS** across an enterprise pilot fleet. The pilot is engineered to validate five non-negotiable institutional benchmarks without risking vehicle warranty invalidation or enterprise network compromise:

1. **Zero CAN-Bus Write-Back:** 100% passive diagnostic bus sniffing (`listen-only on` kernel mode) under SAE J1939 and ISO 14229 UDS.
2. **Deterministic Dual-Consensus WASM:** Flawless isolation and byte-identical consensus between Cranelift and V8 runtimes.
3. **Edge Zero-PII Compliance:** Complete in-memory redaction of driver records under DPPA (18 U.S.C. § 2721) prior to bundle export.
4. **Daubert-Admissible Optical Forensics:** Sub-120ms verification of physical CMOS Bayer CFA demosaicing peaks at `(π, π)` to eliminate synthetic generative media fraud.
5. **Real-Time Institutional Solvency Automation:** Deterministic 4-tier reinsurance waterfalls (NAIC Schedule F) and ISO 20022 parametric settlement dispatch.

```
+--------------------------------------------------------------------------------------------------+
|                                    30-DAY PILOT TIMELINE                                         |
+-------------------+--------------------+--------------------+-------------------+----------------+
| Phase 0 (Days -7..0)| Phase 1 (Days 1..5)| Phase 2 (Days 6..12)| Phase 3 (Days 13..20)| Phase 4/5 (21..30)|
| Digital Software  | Cryptographic IAM  | Fleet Installation | Carrier WASM Logic| Solvency & Go-Live |
| & Air-Gap Staging | & WireGuard Peering| & Passive Sniffing | & Optical Forensics| Sign-Off & Audit   |
+-------------------+--------------------+--------------------+-------------------+----------------+
```

---

## 2. Phase 0: Pre-Deployment & Air-Gap Environment Readiness (Days -7 to 0)

Before executing the pilot at carrier facilities, verify the digital delivery packages, cryptographic baseline, and host workstation readiness.

- [ ] **0.0 Digital Delivery & Wire Settlement Verification**
  - Verify receipt of digital air-gapped delivery package (macOS DMG installer / ZIP distribution with SHA-256 cryptographic attestation).
  - **$0.00 Hardware CapEx:** Zero new hardware required—executes 100% locally on carrier's existing enterprise workstations and computing infrastructure.
  - Confirm presence of pre-loaded air-gapped forensic models and local cryptographic verification keys.
  - Confirm Accounts Payable wire settlement received with matched Wire Memo Code (`PILOT-ET-*****`).

- [ ] **0.1 Host Workstation & Interface Verification**
  - Verify host workstation meets enterprise minimums (macOS 13.0+ Ventura/Sonoma/Sequoia or Windows 10/11 64-bit).
  - Verify tamper-resistant local execution and zero external network egress dependencies.
  - For passive CAN vehicle auditing: Confirm presence of standard passive OBD-II / SAE J1939 breakout cable with hardware-clipped CAN Tx lines (`listen-only`).

- [ ] **0.2 Non-Volatile Memory (NVRAM) & Hardware Clock Audit**
  - Verify battery-backed monotonic RTC hardware clock with hardware lease-clock enforcement.
  - Execute NVRAM integrity check: Confirm zero-tolerance anti-rollback counter is initialized to zero:
    ```bash
    nvram -p | grep "anti_rollback_monotonic_counter"
    ```
  - Verify 10-day offline grace period parameter in `EnterpriseCustomConfig.swift` (`offlineLicenseGracePeriodDays = 10`).

- [ ] **0.3 Network Loopback & Attack Surface Lockdown**
  - Boot the edge unit in isolated bench environment (zero external WAN/LAN cables).
  - Execute local port audit verifying zero public network daemons:
    ```bash
    sudo netstat -tulnp | grep -v "127.0.0.1"
    ```
  - Confirm that REST (`127.0.0.1:8000`) and WebSocket (`127.0.0.1:8765`) are strictly bound to loopback.
  - Verify local SSD partition is encrypted under `AES-256-XTS-FIPS-140-3`.

---

## 3. Phase 1: Cryptographic Identity & WireGuard Peering (Days 1 to 5)

Establish the zero-trust carrier mesh network and seed tenant cryptographic keys.

- [ ] **1.1 Hardware Enclave Ed25519 Key Generation**
  - Trigger onboard Secure Element (Apple Secure Enclave or ATECC608B HSM) to generate the device identity keypair:
    - Public Key: Hardware Identity Public Key (attested to Carrier Root CA).
    - Private Key: Non-exportable, hardware-bound silicon key.
  - Record the device SHA-256 fingerprint in the carrier pilot inventory database.

- [ ] **1.2 Carrier WireGuard Point-to-Point Tunnel Configuration**
  - Establish WireGuard interface (`wg0`) listening exclusively on high UDP port:
    ```ini
    [Interface]
    Address = 10.68.0.24/32
    PrivateKey = <Non-Exportable-Enclave-Key>
    ListenPort = 51820

    [Peer]
    PublicKey = <Carrier-Ingress-Gateway-PubKey>
    Endpoint = vpn.carrier-domain.internal:51820
    AllowedIPs = 10.68.0.1/32
    PersistentKeepalive = 25
    ```
  - Perform ChaCha20-Poly1305 packet authentication test over isolated LTE/5G APN.

- [ ] **1.3 Tenant Custom Configuration Provisioning**
  - Deploy `EnterpriseCustomConfig.swift` with verified carrier parameters:
    - `tenantID`: `"TENANT-CORP-US-001"` (e.g., Sovereign Risk Syndicate AIG).
    - `autoSettlementLimit`: `$50,000.00` (Straight-Through Processing ceiling).
    - `highSeverityExecGateThreshold`: `$750,000.00` (Mandatory Executive Lock).
    - `wasmDualConsensusEnforced`: `true`.

---

## 4. Phase 2: Fleet Vehicle Installation & Passive CAN Sniffing (Days 6 to 12)

Install units across the designated 20-vehicle pilot cohort (passenger sedans, delivery vans, Class 8 heavy trucks).

- [ ] **2.1 Physical OBD-II / J1939 Harness Integration**
  - Connect harness to standard vehicle diagnostic port:
    - **Pins 6 & 14:** High-speed CAN differential pair (CAN-H / CAN-L).
    - **Pins 4 & 5:** Chassis and signal ground.
    - **Pin 16:** Unswitched battery positive (+12V / +24V DC).
  - Verify that Transmit Pin (Tx) is physically absent or isolated via optocoupler with reverse-bias protection.

- [ ] **2.2 SocketCAN Passive Listening Verification**
  - Initialize SocketCAN interface in kernel-enforced listen-only mode:
    ```bash
    sudo ip link set can0 type can bitrate 500000 listen-only on
    sudo ip link set can0 up
    ```
  - Verify `listen-only on` flag using `ip -details link show can0`.
  - For heavy commercial trucks, switch to SAE J1939 250 kbps profile:
    ```bash
    sudo ip link set can0 type can bitrate 250000 listen-only on
    ```

- [ ] **2.3 Zero ECU Interference & OEM Factory Warranty Audit**
  - Run an external OEM diagnostic scanner (Snap-on / Bosch / Ford IDS) concurrently on the vehicle CAN network.
  - Confirm zero Diagnostic Trouble Codes (DTCs) generated (specifically U0100 lost communication or CAN-bus error frames).
  - Confirm zero acknowledgment pulses (`ACK`) transmitted on `can0` during bus operation.

- [ ] **2.4 Parasitic Battery Draw & Low-Voltage Disconnect (LVD) Calibration**
  - Connect in-line digital multimeter to monitor sleep current.
  - Confirm device enters ultra-low power standby (`< 15 mA`) within 90 seconds of vehicle ignition cut-off.
  - Validate Low-Voltage Disconnect thresholds:
    - 12V Passenger Systems: Hardware cut-off trips at **11.8V DC**.
    - 24V Commercial Systems: Hardware cut-off trips at **23.6V DC**.

---

## 5. Phase 3: WASM Carrier Module Sandbox Deployment (Days 13 to 20)

Inject and test carrier-specific underwriting and claim adjudication logic within the dual-consensus WASM runtime.

- [ ] **3.1 Carrier WASM Logic Compilation**
  - Compile the carrier underwriting rules to `wasm32-unknown-unknown` target.
  - Verify binary size is within enterprise envelope (< 2.0 MB).
  - Inspect WASM exports: `adjudicate_claim`, `calculate_premium`, `evaluate_parametric_trigger`.

- [ ] **3.2 Dual-Consensus Engine Execution Audit**
  - Execute test batch of 1,000 synthetic collision packets through both Wasmtime (Cranelift) and V8 runtimes.
  - Verify bit-for-bit consensus across all output structures:
    ```
    Engine A (Cranelift): SHA256(Result) = 7f83b165...
    Engine B (V8):        SHA256(Result) = 7f83b165...
    Consensus State:     MATCH (Status 200 OK)
    ```
  - Confirm that an injected floating-point NaN mismatch causes an immediate deterministic sandbox trap.

- [ ] **3.3 Memory Isolate & Zero-Syscall Enforcement**
  - Confirm the WASM linear memory is hard-capped at 64KB (1 page).
  - Inject malicious WASM bytecode attempting `socket()`, `open()`, and `fork()`.
  - Verify sandbox immediately halts execution with `WasmTrapError: illegal host capability invocation`.

---

## 6. Phase 4: Optical Forensics & DPPA Privacy Pipeline (Days 21 to 25)

Validate fraud defense mechanisms and privacy redaction on live imagery and telemetry streams.

- [ ] **4.1 Optical Forensics & Synthetic Media Rejection Test**
  - Feed 50 physical collision photographs and 50 generative AI images (Midjourney v6, Stable Diffusion XL) into `backend/pixel_forensics_engine.py`.
  - Verify Bayer CFA demosaicing detection:
    - Physical CMOS photos: Autocorrelation peak at `(π, π)` yields CFA score > 0.60 (AUTHENTIC).
    - Generative AI photos: Score < 0.40 triggers `SYNTHETIC_MEDIA_FLAGGED` alert.
  - Verify execution speed: Complete 5-vector optical scan completes in `< 120 ms`.
  - Verify output meets Federal Rule of Evidence 702 (Daubert Standard).

- [ ] **4.2 Edge PII Sanitization Audit (`backend/pii_sanitizer.py`)**
  - Inject raw mock telemetry packets containing full 17-digit VINs, driver Social Security Numbers, and unblurred facial images.
  - Inspect output payload exported across the WireGuard tunnel:
    - [x] VIN stripped to 8-character WMI/VDS prefix (e.g., `1HGCR2F8`).
    - [x] SSN replaced with salted HMAC-SHA256 token (`HMAC-TOKEN-XXXX`).
    - [x] GPS coordinates fuzzed to 2 decimal places (`~1.1 km` spatial grid).
    - [x] Camera images blurred over facial bounding boxes (Gaussian σ=15).
  - Confirm adherence to Driver's Privacy Protection Act (**18 U.S.C. § 2721**).

- [ ] **4.3 Ethan Conversational AI Telephony Validation**
  - Test live incoming SIP claim call over UDP port 5060 / RTP 10000-20000.
  - Confirm Opus 24 kbps VBR audio codec engagement.
  - Validate forensic acoustic vector scan level 21 (60Hz Electric Network Frequency hum matching).
  - Verify end-to-end voice turnaround latency is `< 150 ms`.

---

## 7. Phase 5: Solvency Automation & Pilot Executive Sign-Off (Days 26 to 30)

Simulate high-severity catastrophic losses and execute formal treaty waterfall cessions.

- [ ] **5.1 Catastrophe Peril Modeling Validation (Tab 40)**
  - Load carrier pilot portfolio exposure into the stochastic simulation engine.
  - Run 100,000 Monte Carlo iterations across hurricane and earthquake hazard sets.
  - Confirm calculation of Solvency II 99.5% 1-in-200-year Value at Risk (VaR) matches carrier actuarial benchmarks within ±0.05%.

- [ ] **5.2 Reinsurance Waterfall Execution (Tab 41)**
  - Submit simulated catastrophic collision cluster totaling $15,000,000 in gross incurred losses.
  - Verify automatic waterfall allocation:
    1. Net Retention: First $1,000,000 absorbed.
    2. Quota Share (80/20): $4,000,000 ceded to lead syndicate.
    3. Working XOL ($10M xs $5M): $10,000,000 fully exhausted.
  - Confirm automated generation of NAIC Schedule F and Lloyd's MS9 cession bordereau.

- [ ] **5.3 Parametric Smart Contract Rehearsal (Tab 42)**
  - Trigger synthetic USGS ShakeMap (0.45g PGA) and NOAA Hurricane (130 kt sustained wind) dual-oracle alerts.
  - Verify state machine transition latency is `< 2.0 ms`.
  - Confirm generation of ISO 20022 `pacs.008.001.08` Fedwire dispatch message for $2,500,000.00 automated settlement.

- [ ] **5.4 Final Pilot Governance Review & Executive Hand-Off**
  - Complete joint review between Carrier CISO, Chief Actuary, Head of SIU, and Ether Terminal LLC deployment team.
  - Archive all pilot audit logs into tamper-evident Ed25519-signed verification dossier.
  - Sign off on production rollout authorization.

---

## 8. Pilot Verification Sign-Off Matrix

| Role | Name / Title | Organization | Approval Date | Signature / Enclave Key ID |
| :--- | :--- | :--- | :--- | :--- |
| **Carrier Project Sponsor** | _______________________ | Carrier Corporate | ___/___/2026 | `KEY-SPONSOR-________________` |
| **Chief Information Security Officer** | _______________________ | Carrier IT & Infosec | ___/___/2026 | `KEY-CISO-___________________` |
| **Chief Actuary / Risk Officer** | _______________________ | Carrier Actuarial | ___/___/2026 | `KEY-ACTUARIAL-______________` |
| **Director of Special Investigations (SIU)** | _______________________ | Carrier Claims/Fraud | ___/___/2026 | `KEY-SIU-____________________` |
| **Lead Deployment Architect** | _______________________ | Ether Terminal LLC | ___/___/2026 | `KEY-ETHER-DEPLOY-___________` |

---
*Ether Sovereign OS • Defense-Grade Telematics & Solvency Infrastructure • Confidential & Proprietary*
