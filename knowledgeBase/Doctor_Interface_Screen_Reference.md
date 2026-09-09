# Doctor Interface — Screen-by-Screen Design Reference

This document covers every screen and modal in the doctor interface, decided across all planning sessions. Use it as the source of truth while designing each screen's UI individually. Open questions are called out explicitly at the end — nothing here is silently assumed beyond what's stated.

---

## 1. Login

**Type:** Full screen
**Purpose:** Authenticates the doctor so each person only ever sees their own queue.

**Design direction:** Matches the real Healthcare Professionals Registry (HPR) login experience under ABDM — HPR ID/username plus a mobile OTP — since the whole system is already built around ABDM/FHIR/ABHA, and HPR is the national, doctor-side counterpart to a patient's ABHA ID. It also explicitly covers AYUSH practitioners, which fits AIIA as the sponsoring institution.

**Fields:**
- HPR ID / username input
- "Send OTP" action → mobile OTP input (6-digit)
- "Forgot HPR ID" link (can be a dead link for the demo)

**Flow:** Enter HPR ID → receive OTP → enter OTP → redirect to Queue / Home on success.

**Hackathon scope note:** Full live ABDM integration requires sandbox registration — build this screen to visually and behaviorally match the real HPR login (so the demo is honest about the model), but treat live integration as a roadmap item, not something wired up for judging day.

---

## 2. Queue / Home

**Type:** Full screen — the default landing screen after login
**Purpose:** Lets the doctor find and open a specific patient. Since the doctor only opens a summary at point of contact (not ahead of time), this screen's job is mainly navigation and light situational awareness, not active pre-visit triage.

**Elements:**
- Header: doctor's name, department, date, "N waiting" count
- Search bar — by token number or UHID
- QR scan entry point — a flat USB HID scanner at the desk; scanning pins that patient into a "Just scanned" section at the top (does not auto-open the summary)
- **"Needs attention" section** — red-flag patients pinned here. **Informational only** (per the resolved default above) — not used for reordering who gets seen next, since the doctor doesn't browse this ahead of the patient arriving
- **"Just scanned" section** — appears the instant a QR is scanned, clears once the doctor opens that card
- General queue list — each card shows patient name/token/age/gender, chief complaint snippet, and a status pill: **New** or **Reviewed** (only two statuses — a third "Consulted" state was considered and dropped)
- Settings entry point (icon, top or side)

**States to design:**
- Default (patients waiting, no flags/scans active)
- With a pinned red-flag card
- With a pinned "just scanned" card
- Empty (no patients currently waiting)

---

## 3. Patient Summary

**Type:** Full screen — the core screen of the whole interface
**Purpose:** Opened when the patient is physically present or freshly QR-scanned. Serves as the doctor's structured view of everything the kiosk captured, and is the one screen where all downstream actions happen. Its available actions change based on the patient's current status — **the screen doesn't force separate touchpoints; a doctor can confirm and record the outcome in one sitting or come back to it later, the UI just reflects whatever state the patient is currently in.**

**Header:**
- Patient photo, token number, name, age, gender, ABHA-linked indicator
- Red-flag badge (if applicable) — pinned at the very top of the content, above vitals, never buried

**Vitals row** (each value shown with its source and timestamp — e.g. "Measured at kiosk · 9:42 am" vs "Self reported"):
- Blood pressure, blood sugar, blood group
- SpO₂, pulse, weight, temperature (reconciled from the kiosk's fuller data model — include all of these even if not every session captures them)

**Clinical sections** (in order): Chief Complaint → History of Present Illness → Past History → Drug/Allergy History → Family History → Personal History → Review of Systems → Prior Investigations

**Field display rule (applies to every field above):** never omit a field. A populated field renders normally. An empty field still shows, muted, with the *reason* it's empty — "Not asked this session," "Patient said: I don't know," or "Not applicable" — rather than blank space or silent removal.

**AYUSH section:** A collapsible block containing Prakriti, Vikriti, Agni, Koshtha. Expanded or collapsed by default per the doctor's Settings preference.

**Scanned documents:** Thumbnails at the bottom; tapping one opens the Document Viewer.

**Actions (status-dependent):**
- **Status = New:** "Edit summary" and "Confirm & push to HIS" (confirming sets status to Reviewed)
- **Status = Reviewed, no outcome logged yet:** "Record outcome" becomes available (Edit summary may remain available too — see open questions)
- **Status = Reviewed, outcome logged:** outcome shown read-only (see open questions on whether it's editable)

---

## 4. Edit Summary (modal)

**Type:** Modal, opens on top of Patient Summary
**Purpose:** Lets the doctor correct or annotate the AI-drafted summary before it's treated as final.

**Design decision:** Modal editor was chosen deliberately over inline editing or a separate full-screen edit mode — strongest visual separation between "viewing" and "editing" a clinical record.

**Behavior:**
- All clinical text fields (chief complaint, HPI, past history, etc.) are editable
- **Vitals (BP, blood sugar, SpO₂, pulse, weight, temperature) are NOT editable here** — they're device-sourced; a wrong reading should be fixed by re-measuring, not typed over
- Blood group IS editable — it's self-reported
- "Cancel" discards all changes and closes; "Save changes" is the only action that commits anything — nothing writes until it's pressed

---

## 5. Document Viewer (modal)

**Type:** Modal/overlay, opens from the Patient Summary's document thumbnails
**Purpose:** Lets the doctor browse the patient's scanned documents in full detail.

**Design decision:** Full page-flip viewer, not thumbnails-only. Since the kiosk hands off multiple separate scanned images rather than one combined PDF, the viewer treats each image as one "page" in the flip sequence.

---

## 6. Record Outcome (modal)

**Type:** Modal, opens from Patient Summary once status is Reviewed
**Purpose:** Lets the doctor log what happened after the consultation — entirely their own decision, never an AI suggestion.

**Fields:**
- Continue treatment at this facility (default option)
- Refer to a specialist — dropdown of departments; any specialists pinned in Settings appear first
- Follow-up needed — date picker
- Free-text clinical note

**Save behavior (Option C, as decided):** Saves immediately on selection — no separate confirm step, since this is the doctor's own direct input, not AI-drafted content needing a safety check. Immediately after saving, a brief **"Saved — Undo?"** prompt appears for a few seconds, giving a short window to reverse a mis-tap without adding friction to the common case.

---

## 7. Settings

**Type:** Full screen, reached from Queue / Home
**Purpose:** Doctor-level preferences and account/sync visibility. Scoped down to three categories for the hackathon build; three others (Notifications, Security/auto-logout, Display/Accessibility) are explicitly deferred to roadmap — see open questions.

**Account section (view-only):**
- HPR ID — masked, with a "Verified via ABDM" badge. Not editable here; the real HPR portal remains the source of truth for this credential
- Department/OPD — view-only, assigned by hospital admin, not doctor-editable

**Clinical & workflow section:**
- Toggle: "Show AYUSH assessment by default" (on/off) — this is what the Patient Summary's AYUSH section reads from
- Pinned specialists for referral — add/remove list; these appear first in the Record Outcome modal's referral dropdown

**Data & sync section:**
- "Last synced" timestamp + manual "Sync now" button
- Pending-sync count and list — shows any actions (Confirm & push, Record outcome) still waiting to reach the HIS, most relevant when the Tauri app has been offline

---

## Open Questions — Not Yet Resolved

These were surfaced while consolidating everything above. None are assumed answered — resolve them before or while designing the relevant screen.

1. **Red-flag visibility ahead of the doctor** — proceeding with "informational only, no pre-visit triage role" as the default per this conversation. Reception/triage staff visibility into red flags before the patient reaches the doctor is a roadmap idea, not built now. Flag if this default is wrong.
2. **Is "Record outcome" editable after the Save/Undo window closes?** Not yet decided — is it locked once saved, or can a doctor reopen and change it later (e.g., they meant to select a different specialist)?
3. **Is "Edit summary" still available after a patient is Reviewed?** The flow above assumes yes (a doctor might notice something worth correcting even after confirming), but this hasn't been explicitly decided.
4. **Should consent status be visible anywhere on the doctor's screens?** The kiosk captures a consent record, but no screen in this document currently surfaces it to the doctor. Worth a decision on whether that matters here.
5. **Notifications, Security/auto-logout, and Display/Accessibility settings** — deliberately deferred from the hackathon build (per your selection). Auto-logout in particular is worth revisiting for a real deployment, given the shared-desk / sensitive-health-data context already documented as a project requirement.
6. **Live HPR/ABDM login integration** — deferred to roadmap; the hackathon Login screen matches the real UX but doesn't call live ABDM APIs.
