# CALLBOX DAVAO REGIONAL INTRANET PORTAL (NODE DAVAO_10)
## OFFICIAL COMPLIANCE HANDOVER & SYSTEMS OPERATIONS MANUAL
**Document Reference:** CBD-INT-2026-OM  
**Target Department:** Callbox Davao Human Resources & Executive Operations  
**Classification:** Internal Corporate Confidential  
**Version:** 1.0.0 (Production-Ready Turnover)  
**Date of Release:** July 9, 2026  

---

## 1. DOCUMENT REVISION HISTORY

| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| **1.0.0** | July 09, 2026 | Head Systems Architect | Initial Release & Production Handover to Davao HR |

---

## 2. EXECUTIVE SUMMARY & PORTAL ARCHITECTURE

The **Callbox Davao Intranet Portal (Node Davao_10)** is a modern, high-performance, secure digital workspace designed explicitly for Callbox Davao branch operations. It serves as a unified central gateway for branch activities—integrating real-time communication dispatchers, essential dialing and CRM link lists, localized standard operating procedures (SOPs), and strict administrative security control panels.

### Core Systems Principles
*   **Security-First Access Isolation:** Restricts interactive modules strictly based on the authenticated employee's clearance rank.
*   **Active Local & Remote Sync:** Integrates with local caches and remote database pipelines to preserve branch settings, bookmarks, and activity logs.
*   **Sound Synthesis Feedback:** Uses the Web Audio API to play responsive, low-latency audio alarms ("Biometric Beeps") to reinforce operational boundaries and secure gateway events.
*   **15-Minute Session Guard:** Periodically tracks activity. After 15 minutes of inactivity, the portal securely logs out the current session to guard company workstations against unauthorized access.

---

## 3. SECURITY RANKS & DEFAULT CREDENTIAL MATRIX

Access to the intranet is segmented into four distinct role-based security clearances. To turn over the portal, provide the HR department and Super Admin personnel with these default credentials:

| Clearance Level | Authorized Role | Primary Functional Scope | Default Account Username | Default Secure Passcode |
| :--- | :--- | :--- | :--- | :--- |
| **Level 4** | **Super Admin** | System-wide root authority. Roster management, approving password reset requests, database diagnostic controls, full audit logs viewing. | `admin@callboxinc.com` | `callboxdavaoadmin` |
| **Level 4 (Alt)**| **Super Admin** | Secondary root login. Backup supervisor role for operations. | `werzkie.tim@callboxinc.com` | `callbox2026` |
| **Level 3** | **HR Manager** | Roster additions/termination status, posting critical news bulletins, uploading resource documents/SOPs, requesting role elevation. | *(Created by Super Admin via panel)* | `callbox2026` *(change on first login)* |
| **Level 2** | **Employee / Agent** | View links directory, star customized fast favorites, read bulletins, download compliance files, update personal profile card, request self-service reset. | `jane.doe@callboxinc.com` | `callbox2026` |
| **Level 1** | **Inactive / Guest** | Read-only access to standard documents. Completely locked out of secure dashboards and administrative tools. | *(Assigned to archived/former employees)* | *Disabled* |

---

## 4. DETAILED END-USER NAVIGATION FLOW

### FLOW A: Standard Employee / Campaign Agent (Level 2)
```
[Login Screen] ──(Auth Level 2)──> [Systems Hub] ──> [Toggle Favorites Star] ──> [Favorite Dock Pins]
      │
      ├──> [Read Announcement Board] ──> [Download Compliance SOP] ──(Track Meter Up)
      │
      └──> [My Profile] ──> [Update Phone/Skype] ──> [Save Profile Event Logged]
```

#### Step-by-Step Instructions:
1.  **Secure Authentication:** Open the login portal. Enter `jane.doe@callboxinc.com` and password `callbox2026`. Press **Sign In**.
2.  **Systems Hub & Favorites Star:** 
    *   Upon entry, you will see the **Systems Hub** displaying active dialers, shift managers, and VOIP directories.
    *   To pin your most-used systems, click the **Star Icon** in the top-right corner of any system tile.
    *   The link will immediately appear in the **My Favorite Systems** dock at the top of the workspace.
3.  **SOP & Library Downloads:**
    *   Click **SOP & Documents** from the navigation bar.
    *   Search or filter by department. Click **Download SOP**.
    *   An audible beep confirms the action, and the download counter increments.
4.  **Profile Management:**
    *   Navigate to **My Profile**.
    *   Update your contact phone or Skype handle.
    *   Press **Save Profile**. Your action is logged securely in the branch archives.

---

### FLOW B: Human Resources Manager (Level 3)
```
[Login Screen] ──(Auth Level 3)──> [Bulletin Board] ──> [Create Post] ──> [Toggle "Critical Alert" Switch]
                                                                                      │
                                        ┌─────────────────────────────────────────────┘
                                        ▼
                         [Locks Agent Dashboard] ──> [Agent Reviews Policies] ──> [Accepts or Declines]
```

#### Step-by-Step Instructions:
1.  **Accessing Bulletins:** Log in with an HR-authorized account. Navigate to the **Bulletin Board** tab.
2.  **Dispatching Announcements:**
    *   Click **Create Announcement**.
    *   Enter Title, Body, and Department relevance.
    *   To issue a standard post, select "Normal".
3.  **Emergency Policy Lockout Flow (Critical Alert):**
    *   To demand immediate branch compliance, toggle the post's status to **CRITICAL**.
    *   The portal instantly locks out all connected users, presenting them with a persistent **Policy Acceptance Modal**.
    *   Agents cannot bypass this screen to access external dialers until they review the policies and choose an option:
        *   **Option A: Accept and Sign** — Checks all policy boxes, records an authorization stamp under their Employee ID, and restores full portal access.
        *   **Option B: Decline & Exit Gateway** — Rejects the terms. This triggers an alarm beep, shows a "Access Denied" toast, and logs the user out to secure the workstation.

---

### FLOW C: Super Admin (Level 4)
```
[Login] ──(Lvl 4)──> [Governance Panel] ──> [Onboard Employee] ──(Set default pass)
                            │
                            ├──> [Approve / Deny Password Reset Requests Queue]
                            │
                            └──> [View Live Audit Trails & Engagement Analytics Charts]
```

#### Step-by-Step Instructions:
1.  **Employee Roster Management:**
    *   Select **Governance Panel** from the navigation bar.
    *   Review the employee cards. To add a new hire, click **Onboard Employee**.
    *   Input Name, Email, Department, and Corporate ID. Press **Save Employee**.
2.  **Passcode Reset Pipeline:**
    *   If an agent forgets their password, they can click "Forgot Password" on the login screen to send an approval request.
    *   As Super Admin, navigate to **Governance Panel** -> **Reset Requests Queue**.
    *   Review the pending requests. Click **Approve Reset** (setting password back to default `callbox2026`) or **Deny Request**.
3.  **Security Audit Trail & Engagement Charts:**
    *   Click **Branch Analytics**.
    *   Review charts illustrating link interaction clicks, document downloads, and roster health.
    *   Scroll through the **Live Security Audit Trail** to audit a chronological, timestamped record of user actions.

---

## 5. PROCEDURES FOR RESOURCE LIBRARY & FILE UPLOADS

When HR needs to update dialer scripts or compliance manuals, follow these protocols:

1.  **Format Compliance:** Ensure documents are in PDF, DOCX, XLSX, or plain text format.
2.  **Registration Process:**
    *   Navigate to **SOP & Documents**.
    *   Click **Register New Resource**.
    *   Input the Document Title, Description, Department, and File Category.
    *   Provide the target link or internal path (e.g., `/public/docs/compliance_v2.pdf`).
    *   Click **Publish Document**.
3.  **Post-Publish Verification:** The document will instantly appear in the library with 0 downloads. Download tracking begins immediately.

---

## 6. HANDOVER OPERATIONAL CHECKLIST (IT & HR VERIFICATION)

Run this checklist during the formal handover meeting with the HR Manager:

- [ ] **Task 1: Authenticate Super Admin Profile**  
  *Log in with `admin@callboxinc.com` and password `callboxdavaoadmin` to confirm root permission tabs load correctly.*
- [ ] **Task 2: Onboard a Test Employee**  
  *In the Governance Panel, add a mock employee. Verify the new user appears on the roster list with Level 2 clearance.*
- [ ] **Task 3: Dispatch a Critical Compliance Alert**  
  *Write a new bulletin and mark it as CRITICAL. Verify the blocking compliance window locks the active session.*
- [ ] **Task 4: Test Emergency Decline Response**  
  *Inside the compliance modal, click "Decline & Exit Gateway". Confirm the session terminates, sounds an alarm, and logs out.*
- [ ] **Task 5: Review the Live Security Audit Stream**  
  *Log back in as Super Admin, open Branch Analytics, and verify that all test actions (onboarding, logging out, posting) are recorded.*

---

## 7. SYSTEM TROUBLESHOOTING & TECHNICAL DETAILS

*   **Offline Data Resilience:** This application uses double-sync architecture. If connection to the remote Supabase DB times out, all edits are stored locally in the browser's `localStorage` and synchronized automatically once connection is restored.
*   **Audio Engine Access:** In some browsers, sound is blocked until the user interacts with the page. Click anywhere on the login page to activate the sound engine.
*   **Session Lockouts:** Session expiry is absolute. If an employee complains of getting logged out mid-shift, check their inactivity status—the 15-minute inactivity tracker is working as intended.
