# Ether Sovereign OS: Windows Evaluation Setup Guide
## 30-Day Air-Gapped Pilot Quick-Start Manual

This guide provides simple, step-by-step instructions for running the **Sovereign Ether OS** pilot on Windows 10 and Windows 11 enterprise laptops and workstations.

---

### System Requirements
* **Operating System:** Windows 10 or Windows 11 (64-bit)
* **RAM:** Minimum 8 GB (16 GB recommended)
* **Browser:** Microsoft Edge (Chromium) or Google Chrome
* **Network Requirement:** **Zero.** The system operates completely offline in Airplane Mode.

---

### Option A: 1-Click Zero-Install Mode (Simplest for Claims Adjusters)
If you want to immediately explore the user interface, actuarial dictionaries, crash forensics, and sample claim scoping without installing any developer tools or needing corporate IT permissions:

1. Extract the `Ether_Sovereign_Windows_Pilot.zip` to your Desktop or Documents folder.
2. Double-click **`index.html`** (or double-click **`run_windows.bat`**).
3. The full Sovereign Console opens directly in your browser.
4. **Air-Gap Verification:** You can disconnect Wi-Fi or enable Airplane Mode. The console runs 100% locally from your machine.

---

### Option B: Local Backend Engine Mode (With Python)
If your evaluation team wants to test the local WebSocket ingestion engine:

1. Ensure **Python 3.9+** is installed on your Windows machine (downloadable from [python.org](https://www.python.org/downloads/) or the Windows Store).
2. Install the lightweight dependencies (optional, one-time):
   ```cmd
   pip install websockets numpy Pillow cryptography
   ```
3. Double-click **`run_windows.bat`**.
4. The batch script will automatically launch the local engine in the background and open the console interface.

---

### Option C: Enterprise Docker Container Mode (Preferred by IT Security)
If your corporate security policy blocks running local script files, your IT administrator can run the pre-configured container appliance:

1. Ensure **Docker Desktop** is running on Windows.
2. Open PowerShell in the folder and run:
   ```powershell
   docker compose -f docker-compose.appliance.yml up -d
   ```
3. Open your browser to `http://localhost:8080`.
4. The application executes inside an isolated, non-root Linux container with zero access to your corporate intranet.

---

### How to Test Sample Claims on Day 1
1. Inside the console, navigate to **Tab 05: Universal Claim Ledger** or **Tab 15: Automotive Dashboard**.
2. Open the **`sample_claims_pack/`** folder provided with your pilot bundle.
3. Drag and drop any of the `.json` claim files or test photos into the drop zone.
4. Verify sub-5-second damage valuation and certified CIECA BMS export.

---

### Technical Support & Direct Contact
* **Engineering Lead:** Protocol Engineering & Operations Group
* **Official Contact:** contact@ether-terminal.com
* **Official Phone:** (888) 861-9020
* **Official Web:** https://ether-terminal.com
