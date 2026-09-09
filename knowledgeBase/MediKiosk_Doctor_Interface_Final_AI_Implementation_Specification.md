# MediKiosk — Doctor Interface
## Final AI Implementation & UI Build Specification

**Use this document together with the supplied Doctor Interface UI design images.**

This is the functional/product source of truth. The images are the visual source of truth for layout, spacing, typography, cards, icons, composition, and visual styling.

---

# 1. PRODUCT CONTEXT

MediKiosk is a hospital OPD self-check-in system. The patient-facing kiosk collects identity, consent, structured clinical history, vitals, previous medical documents, OCR-extracted information, and visit/session information. It prepares a concise clinician-facing case and creates a visit QR.

The doctor-side application lets the doctor review that prepared case, inspect source documents, correct the AI-drafted clinical summary, confirm/push it to the HIS, and record the doctor's own consultation outcome.

The doctor interface is a **clinical review workstation**, not a generic analytics dashboard.

The kiosk does not diagnose or replace the doctor. Clinical decisions remain with the doctor.

---

# 2. APPROVED SCREEN ARCHITECTURE

Implement exactly this scope:

```text
DOCTOR INTERFACE
├── 1 LOGIN
│   ├── 1A HPR ID
│   ├── 1B OTP VERIFICATION
│   └── 1C OPD / COUNTER SELECTION
├── 2 QUEUE / HOME
│   ├── 2A DEFAULT QUEUE
│   ├── 2B NEEDS ATTENTION
│   ├── 2C JUST SCANNED
│   └── 2D EMPTY QUEUE
├── 3 PATIENT SUMMARY
│   ├── 3 NEW PATIENT SUMMARY
│   ├── 3A EDIT SUMMARY MODAL
│   ├── 3B DOCUMENT VIEWER
│   ├── 3D REVIEWED PATIENT
│   └── 3E RECORD OUTCOME MODAL
└── 4 SETTINGS
    ├── 4A ACCOUNT & WORKSPACE
    ├── 4B CLINICAL & WORKFLOW
    └── 4C DATA & SYNC
```

Do **not** add 4D or additional mandatory doctor screens.

Explicitly deferred:
- Notifications
- Security / auto-logout
- Display / Accessibility settings
- Full live HPR/ABDM integration

---

# 3. DESIGN LANGUAGE

The doctor interface belongs to the same MediKiosk product family as the patient kiosk, but it has a different personality.

**Kiosk:** friendly, voice-first, large touch targets, mascot-led, patient-facing.

**Doctor UI:** professional, desktop-first, dense enough for clinical work, fast to scan, structured, restrained, and without a large mascot.

Shared visual language:
- MediKiosk branding
- “Care Closer to You”
- mint/teal/white healthcare palette
- white/light neutral surfaces
- subtle teal/green accents
- restrained blue for information
- amber for warnings/sync
- red only for clinically important red flags
- rounded cards
- subtle shadows
- clean sans-serif typography
- thin borders
- polished spacing
- clear icons

Do not make it look like a generic SaaS admin dashboard or a government portal.

---

# 4. APPLICATION BEHAVIOR

Build a **real interactive application**, not static screenshots.

Required:
- navigation works
- buttons change state
- modals open/close
- forms edit data
- queue states respond to scanning
- patient status transitions
- settings affect the relevant UI
- sync state changes
- realistic mock data allows the entire hackathon demo without live hospital infrastructure

Use reusable components rather than one-off screen implementations.

Suggested shared components:
- AppShell
- Sidebar
- TopBar
- WorkspaceSelector
- ConnectionStatus
- PatientCard
- PatientHeader
- StatusPill
- RedFlagBanner
- VitalCard
- ClinicalSection
- SourceBadge
- EmptyState
- Modal
- Tabs
- DocumentCard
- DocumentViewer
- StickyActionFooter
- Toast
- Toggle
- SpecialistList
- SyncStatusCard
- SyncHistoryTable
- SearchInput
- QR scan control
- OTP input
- Date picker

---

# 5. LOGIN

## 5.1 Screen 1A — HPR ID

Purpose: authenticate the doctor.

Primary field:
- HPR ID / username

Actions:
- Send OTP
- Forgot HPR ID

Use a polished HPR-style healthcare login.

Layout target:
- approximately 32–35% left brand panel
- 65–68% login panel

Left-panel copy stays consistent across 1A/1B/1C:

**Same People. Better Tools. Healthier Communities.**

Include an NHA/ABDM trust/compliance indication, but it is **not** an alternate login method. Do not put an “OR” separator before it.

Live ABDM integration is not required for the hackathon; simulate the flow honestly.

## 5.2 Screen 1B — OTP Verification

Title:

**Verify your identity**

Example:

**Enter 6-digit OTP sent to +91 ******4219**

Use six OTP boxes with automatic focus movement.

Show:
- resend countdown
- Change HPR ID / Mobile
- Verify & Continue
- Back or stepper showing completed stages

Example:

**Resend OTP in 24s**

## 5.3 Screen 1C — OPD / Counter Selection

Title:

**Where are you working today?**

Fields:
- Department / OPD
- Counter / Desk

Example:
- General Medicine OPD
- Desk 4

If there is only one assignment, preselect it. If multiple assignments exist, provide selectors.

After selection, enter Queue/Home.

Workspace can later be switched from a compact header control.

---

# 6. QUEUE / HOME

## 6.1 Screen 2A — Default Queue

Default landing screen after login.

Header:
- General Medicine OPD · Desk 4
- District Hospital, Bhopal
- date
- time
- doctor name
- connection/sync status

Example doctor:
**Dr. Anjali Verma**

Sidebar:
- Queue
- Patients
- Settings

The “Patients” label may lead to the same queue/patient workflow; do not create a separate full Patients product area because it is not part of the approved architecture.

Main content:
- N waiting count
- search by token or UHID
- Scan Patient QR button
- queue cards

Each patient card:
- photo or monogram
- name
- token
- age/gender
- chief complaint snippet
- status

Only these statuses exist:
- **New**
- **Reviewed**

Do not create Consulted, Completed, In Consultation, etc.

## 6.2 QR scanning

The physical doctor-side scanner is a standard USB HID QR scanner and behaves like keyboard input.

For the demo, support either real keyboard/scanner input or a clearly usable simulated scan control.

When QR/token is scanned:
1. identify the patient
2. pin them into **Just Scanned**
3. show a success toast
4. do **not** automatically open the Patient Summary

Example toast:

**Wristband A1052 Scanned Successfully**

The doctor clicks the card to open the patient.

## 6.3 Screen 2B — Needs Attention

Show red-flag patients under:

**Needs Attention**

This is informational only. It is not an automated triage/reordering mechanism.

Example:
**Chest pain since yesterday**

When the patient becomes Reviewed, they should no longer remain in the active Needs Attention list.

## 6.4 Screen 2C — Just Scanned

Show above Needs Attention when active.

Example:
**Rohit Mehta · A1052 · 36/M**

Toast:
**Wristband A1052 Scanned Successfully**

Clicking the row/card opens Patient Summary.

After opening, clear the Just Scanned state according to the demo model.

## 6.5 Screen 2D — Empty Queue

Show:
- 0 Patients Waiting
- professional empty-state illustration
- explanation
- Scan Patient QR
- View queue/patients
- Check Settings
- last updated/autorefresh if implemented

---

# 7. SHARED PATIENT DATA MODEL

Use one shared patient record rather than duplicating data across screens.

Primary demo patient:

```json
{
  "patient": {
    "photo_url": "",
    "abha_id": "ABHA-XXXX-XXXX",
    "age": 36,
    "gender": "Male",
    "queue_token": "A1052",
    "uhid": "UHID778901",
    "name": "Rohit Mehta",
    "phone": "+91 98765 43210",
    "emergency_contact": {
      "name": "Neha Mehta",
      "relation": "Spouse",
      "phone": "+91 98765 43211"
    }
  },
  "status": "New",
  "chief_complaint": "Chest pain since yesterday.",
  "history_of_present_illness": "Chest pain started yesterday. Mild breathlessness is present. No nausea or vomiting reported.",
  "past_history": "Hypertension diagnosed 2 years ago. No diabetes. No previous surgeries. No hospitalizations in the last 5 years.",
  "drug_allergy_history": "Penicillin — Rash",
  "family_history": "Father has hypertension. Mother has type 2 diabetes. No family history of heart disease reported.",
  "personal_history": "Non-smoker. Occasional alcohol use. Sedentary desk job.",
  "review_of_systems": "Mild breathlessness and chest pain. No nausea or vomiting.",
  "prior_investigations_summary": "ECG on file (03 Sep 2026) — see attached. Blood Panel available (28 Aug 2026). No other investigations reported.",
  "vitals": {
    "blood_pressure": {
      "value": "148/92 mmHg",
      "source": "kiosk_device",
      "timestamp": "03 Sep 2026 09:42 AM"
    },
    "blood_sugar": {
      "value": "108 mg/dL",
      "source": "kiosk_device",
      "timestamp": "03 Sep 2026 09:44 AM"
    },
    "blood_group": {
      "value": "B+",
      "source": "self_reported"
    },
    "spo2": {
      "value": "97%",
      "source": "kiosk_device",
      "timestamp": "03 Sep 2026 09:45 AM"
    },
    "pulse": {
      "value": "84 bpm",
      "source": "kiosk_device",
      "timestamp": "03 Sep 2026 09:45 AM"
    },
    "temperature": {
      "value": "98.4°F",
      "source": "kiosk_device",
      "timestamp": "03 Sep 2026 09:46 AM"
    },
    "weight": {
      "value": "67 kg",
      "source": "kiosk_device",
      "timestamp": "03 Sep 2026 09:47 AM"
    }
  },
  "red_flags": [
    {
      "symptom": "Chest pain since yesterday",
      "severity": "Needs attention"
    }
  ],
  "documents": [
    {
      "id": "ecg",
      "doc_type": "ECG",
      "pages": 2,
      "date": "03 Sep 2026",
      "time": "09:08 AM"
    },
    {
      "id": "blood-panel",
      "doc_type": "Blood Panel",
      "subtitle": "Lab Report",
      "pages": 3,
      "date": "28 Aug 2026",
      "time": "02:15 PM"
    },
    {
      "id": "prescription",
      "doc_type": "Previous Prescription",
      "pages": 1,
      "date": "15 Aug 2026",
      "time": "11:20 AM"
    }
  ]
}
```

Create a few secondary patients so Default Queue, Reviewed, Needs Attention, and Empty Queue can all be demonstrated.

---

# 8. PATIENT SUMMARY

This is the core screen.

It should let a doctor understand the patient rapidly without opening multiple pages.

## Header

Show:
- patient photo
- name
- token
- age
- gender
- UHID
- ABHA-linked indicator
- current status

## Red flag

If present, show a prominent red area **above vitals**.

Example:

**Needs Attention**

**Chest pain since yesterday**

Do not turn this into a diagnosis.

Never show:
- Possible heart attack
- Likely cardiac event
- AI diagnosis
- AI treatment suggestion

## Vitals

Show all available:
- Blood pressure
- Blood sugar
- Blood group
- SpO₂
- Pulse
- Weight
- Temperature

Every value should show source and timestamp where available.

Examples:

**148/92 mmHg**  
Measured at kiosk · 9:42 AM

**B+**  
Self reported

Possible source labels:
- Measured at kiosk
- Self reported
- From scanned document

## Clinical section order

Always render:

1. Chief Complaint
2. History of Present Illness
3. Past History
4. Drug / Allergy History
5. Family History
6. Personal History
7. Review of Systems
8. Prior Investigations

Never silently remove an empty field.

Instead show:
- Not asked this session
- Patient said: I don't know
- Not applicable

Do not convert “unknown” into “No”.

## Layout

Preferred structure:

```text
Patient Header
↓
Needs Attention / Red Flag
↓
Vitals
↓
Chief Complaint + HPI
↓
Past History | Drug / Allergy
Family History | Personal History
Review of Systems | Prior Investigations
↓
AYUSH Assessment
↓
Previous Documents
↓
Sticky Action Footer
```

Chief Complaint + HPI should be prominent and full-width.

Drug/Allergy should have special visual treatment.

Example:
**Penicillin — Rash**

If there are no known allergies, explicitly show:
**NKDA**

## AYUSH

Collapsible section:
- Prakriti
- Vikriti
- Agni
- Koshtha

The section's default expansion is controlled by Settings.

## Documents

Show a bottom strip/list with:
- thumbnail
- document type
- date/time
- page count
- view action

Click opens Document Viewer.

---

# 9. PATIENT STATUS LIFECYCLE

Only:

```text
New → Reviewed
```

## New

Footer:

**Edit Summary**
**Confirm & Push to HIS**

## Reviewed

Footer:

**Edit Summary**
**Record Outcome**

Do not show Confirm & Push to HIS after review.

If an outcome has been recorded, show it read-only while retaining Reviewed status.

---

# 10. STICKY PATIENT ACTION FOOTER

The footer must be sticky at the viewport bottom while clinical content scrolls.

Use:
- solid surface
- subtle shadow
- thin top border
- comfortable padding

New:

```text
[ Edit Summary ]          [ Confirm & Push to HIS ]
```

Reviewed:

```text
[ Edit Summary ]          [ Record Outcome ]
```

---

# 11. EDIT SUMMARY MODAL

Purpose: let the doctor correct the AI-drafted clinical summary.

It is a modal over Patient Summary, not a separate page.

## Important interaction

Use **strict tab switching**.

Do not render all tab content stacked simultaneously.

Possible tabs:
- Patient Details
- Clinical History
- Vitals / Review

The modal must remain within the viewport and scroll internally when necessary.

## Locked identity

UHID:
- disabled
- subtle grey background
- lock icon

ABHA ID:
- disabled
- subtle grey background
- lock icon

Neither can be edited.

## Editable

- Chief Complaint
- History of Present Illness
- Past History
- Drug / Allergy History
- Family History
- Personal History
- Review of Systems
- Prior Investigations
- Blood Group

## Locked vitals

These are NOT editable:
- Blood pressure
- Blood sugar
- SpO₂
- Pulse
- Weight
- Temperature

Display them as locked/device-sourced.

If a reading is wrong, the intended real-world correction is remeasurement, not typing over it.

## Save

Buttons:
- Cancel
- Save Changes

Cancel discards all unsaved changes.

Save Changes is the only commit action.

Nothing writes before Save.

---

# 12. DOCUMENT VIEWER

Large modal/overlay over Patient Summary.

This is a full document viewer, not merely a thumbnail gallery.

Three-column structure:

```text
All Documents | Document Page | Document Details
```

Left:
- ECG
- Blood Panel
- Previous Prescription

Center:
- page image
- page navigation
- Page 1 of 2
- zoom
- fit
- rotate if appropriate

Right:
- document type
- date
- page count
- metadata
- actions

Allowed actions:
- Download PDF
- Print
- Add Note / Annotation
- Flag for Rescan / Mark Erroneous or Unreadable where appropriate

**Do not provide Delete Document.**

Close:
- Close button
- Esc
- safe backdrop dismissal

---

# 13. RECORD OUTCOME MODAL

Title:

**Record Outcome**

Subtext:

**Add consultation outcome, plan, and next steps for the patient.**

This is entirely the doctor's decision. There must be no AI recommendation.

## Fields

Default:

**Continue treatment at this facility**

Alternative:

**Refer to a specialist**

If referral selected:
- enable Department/Specialist selector
- make it required
- pinned specialists appear first

Follow-up:
- Follow-up needed
- date picker becomes enabled only when needed

Clinical note:
- free-text doctor-entered note

## Conditional rules

If Continue treatment:
- referral selector hidden or disabled/muted as N/A

If Refer:
- referral selector enabled and required

If Follow-up needed is off:
- date hidden/disabled

If on:
- date enabled and required

## Save

On Save:
1. save outcome
2. close modal
3. show bottom green toast

Exact intended feedback:

**✓ Outcome recorded and pushed to HIS. [Undo] (4s)**

Undo remains available briefly.

Do not add an extra confirmation modal.

---

# 14. REVIEWED PATIENT STATE

When Confirm & Push to HIS is pressed:

1. Commit the prepared summary.
2. Simulate HIS push.
3. Change `New → Reviewed`.
4. Clear active Needs Attention for that patient.
5. Remove Confirm & Push to HIS from the footer.
6. Show Record Outcome.
7. Show success feedback.

Example:

**Summary confirmed and pushed to HIS**

Reviewed Patient is a state of Patient Summary, not an unrelated page.

---

# 15. SETTINGS

Full-screen Settings reached from Queue/Home.

Only three sections:

1. Account & Workspace
2. Clinical & Workflow
3. Data & Sync

No other settings pages.

---

# 16. SETTINGS — ACCOUNT & WORKSPACE

Left side:
**Personal & Professional Credentials**

Show:
- doctor name
- HPR ID
- ABDM verification
- professional information

HPR:
- masked
- read-only
- lock icon

Example:

**HPR ID: HPR••••3456**  
**Verified via ABDM**

Department/OPD:
- assigned by hospital admin
- view-only

Right side:
**Physical Workspace & Schedule**

Show:
- hospital
- department
- current counter/desk
- workspace details
- Switch Workspace

Do not duplicate Current Counter/Desk in the credentials area.

---

# 17. SETTINGS — CLINICAL & WORKFLOW

Setting:

**Show AYUSH assessment by default**

Description:

**Show AYUSH assessment by default on Patient Summary.**

Toggle:
- On
- Off

This directly controls whether Patient Summary starts with AYUSH expanded.

Pinned Specialists card:

**Pinned Specialists**

Description:

**Select and manage your frequently referred specialists. Pinned specialists will appear at the top of the referral list in Record Outcome.**

Button:
**+ Add Specialist**

Demo:
- Cardiology
- Neurology
- Orthopedics
- Endocrinology

Allow removal. Reordering is useful if implemented.

Pinned specialists must appear first in the Record Outcome selector.

---

# 18. SETTINGS — DATA & SYNC

Show:
- Online/Offline
- HIS connection
- pending sync count
- Last synced
- Sync now
- pending sync list
- recent sync history

Example:

**● Online · 2 pending sync**

Never show “All data synced” while there are pending actions.

After successful sync:

**● Online · All data synced**

Pending:
**0**

Footer/status:
**All data synced**

## Offline behavior

For the demo:
- local actions may be saved
- pending actions appear in sync list
- Sync Now processes them
- Last synced updates
- pending count becomes 0

Potential pending actions:
- Confirm & Push
- Record Outcome

No live HIS backend is required.

---

# 19. SYNC CONSISTENCY

Use one shared sync state for top bar and settings.

State A:

```text
Top:    ● Online · 2 pending sync
Footer: 2 actions pending sync
```

State B:

```text
Top:    ● Online · All data synced
Footer: All data synced
```

Never allow contradictory indicators.

---

# 20. MOCK BACKEND / STATE ARCHITECTURE

Use a local mock repository/service.

Suggested:

```text
UI
 ↓
State Management
 ↓
Mock Service / Repository
 ↓
Local Storage
```

Operations:

```text
login()
verifyOtp()
getWorkspaces()
getQueue()
scanPatient(qr)
getPatient(patientId)
updatePatientSummary()
confirmAndPushToHIS()
recordOutcome()
undoOutcome()
getSettings()
updateSettings()
getSyncStatus()
syncPendingActions()
```

Keep the mock API boundary clean so real services can be connected later.

Do not claim live HPR/ABDM/HIS integration.

---

# 21. ROUTING

Suggested routes:

```text
/login
/login/otp
/login/workspace

/queue
/patient/:id

/settings/account
/settings/clinical
/settings/sync
```

Edit Summary, Document Viewer, and Record Outcome should normally be application modals/state overlays rather than unrelated full routes.

---

# 22. DEMO FLOW — MUST WORK END TO END

Use this as the primary judging/demo path:

1. HPR ID
2. OTP
3. General Medicine OPD / Desk 4
4. Queue shows 3 waiting
5. Click Scan Patient QR
6. Scan/enter `A1052`
7. Toast: “Wristband A1052 Scanned Successfully”
8. Rohit appears under Just Scanned
9. Do not auto-open
10. Click Rohit
11. Patient Summary opens
12. Needs Attention shows chest pain
13. Review vitals and clinical sections
14. Open ECG
15. Document Viewer opens
16. Flip ECG from Page 1 to Page 2
17. Close viewer
18. Open Edit Summary
19. Edit HPI
20. Verify BP is locked
21. Save Changes
22. Confirm & Push to HIS
23. Patient becomes Reviewed
24. Needs Attention clears
25. Record Outcome
26. Continue treatment at this facility
27. Follow-up needed
28. Select 17 Sep 2026
29. Add clinical note
30. Save
31. Toast: “✓ Outcome recorded and pushed to HIS. [Undo] (4s)”
32. Open Settings
33. Data & Sync
34. Show pending sync
35. Sync Now
36. Show All data synced

This is the main proof that the product is a connected workflow rather than a collection of screenshots.

---

# 23. CLINICAL SAFETY RULES

These are hard requirements.

### Never diagnose
Red flags are symptoms requiring attention, not diagnoses.

### Never prescribe
Do not generate medication, dosage, treatment, or referral recommendations.

### Never overwrite device vitals
Device readings are locked in Edit Summary.

### Never hide missing data
Every clinical field remains visible.

### Never convert unknown into no
“I don't know” must remain explicitly unknown.

### Preserve original documents
Do not provide destructive Delete Document functionality.

### Preserve source metadata
Vitals must show source/timestamp. Documents must preserve document type/date/pages.

### Doctor remains decision-maker
Outcome is manually selected/entered by the doctor.

---

# 24. ERROR STATES

Implement polished, non-blocking error states.

Login:
**We couldn't verify those details. Please check your HPR ID or OTP.**

QR:
**Patient not found**
with **Try scanning again**

Document:
**This document could not be loaded.**
with **Retry**

Sync:
**Sync couldn't be completed. Your changes are saved locally and will remain pending.**

Empty queue:
use Empty Queue state, not an error.

Use toasts rather than browser alert dialogs.

---

# 25. RESPONSIVE TARGET

Primary target:
- desktop/laptop doctor workstation
- polished at 1280px+
- ideal reference around 1440px

At smaller desktop widths:
- reduce gutters
- allow content scrolling
- keep sticky actions usable
- keep modals within viewport
- prevent text collisions

Do not prioritize mobile redesign.

---

# 26. BASELINE ACCESSIBILITY

Even though Display/Accessibility settings are out of scope, implement good defaults:
- keyboard navigation
- visible focus
- readable contrast
- clear labels
- tooltips for icon-only buttons
- Esc closes safe modals
- no critical information communicated by color alone

Do not create a separate accessibility settings page.

---

# 27. DESIGN-IMAGE INTERPRETATION RULE

When a supplied UI image and this specification appear to differ:

### Use the images for:
- visual composition
- spacing
- card shapes
- typography
- iconography
- color treatment
- visual hierarchy

### Use this document for:
- functionality
- navigation
- state transitions
- clinical rules
- data
- screen scope
- behavior

Do not invent features simply because a visual could support them.

Do not add screens outside the approved architecture.

---

# 28. QUALITY BAR

The finished product should feel like:

**A polished hospital clinical workstation built by a serious health-tech product team.**

It should not feel like:
- a generic SaaS template
- a CRUD university project
- a chatbot
- a government-portal mockup
- a chart-heavy analytics dashboard
- an AI pretending to be the doctor

Priority order:

1. Clinical readability
2. Fast scanning
3. Clear patient identity
4. Strong red-flag visibility
5. Source-traceable vitals
6. Original-document access
7. Safe editing boundaries
8. Clear status transitions
9. Reliable sync state
10. Smooth end-to-end demo

---

# 29. FINAL ACCEPTANCE CHECKLIST

## Login
- [ ] HPR ID works
- [ ] OTP works
- [ ] six-digit OTP UI works
- [ ] OPD/counter selection works
- [ ] ABDM is trust/compliance context, not alternate login
- [ ] live ABDM is not falsely claimed

## Queue
- [ ] queue loads
- [ ] search works
- [ ] QR scan works
- [ ] scan creates Just Scanned
- [ ] scan does not auto-open
- [ ] Needs Attention works
- [ ] red flags are informational
- [ ] only New and Reviewed statuses exist
- [ ] Empty Queue works
- [ ] Settings navigation works

## Patient Summary
- [ ] patient header
- [ ] red flag above vitals
- [ ] seven vitals
- [ ] source/timestamp
- [ ] eight clinical sections
- [ ] empty-field reasons
- [ ] AYUSH collapsible
- [ ] documents
- [ ] document viewer opens
- [ ] sticky footer

## Edit Summary
- [ ] modal opens
- [ ] strict tabs
- [ ] UHID locked
- [ ] ABHA locked
- [ ] clinical fields editable
- [ ] blood group editable
- [ ] device vitals locked
- [ ] Cancel discards
- [ ] Save commits

## Document Viewer
- [ ] multiple documents
- [ ] page navigation
- [ ] zoom
- [ ] metadata
- [ ] Download/Print demo
- [ ] Add Note / Annotation or rescan flag
- [ ] Delete Document absent
- [ ] close works

## Status
- [ ] New shows Confirm & Push
- [ ] Confirm & Push changes New → Reviewed
- [ ] Needs Attention clears
- [ ] Reviewed shows Record Outcome
- [ ] Confirm & Push disappears after review

## Outcome
- [ ] Continue treatment is default
- [ ] referral enables specialist field
- [ ] specialist required on referral
- [ ] follow-up date is conditional
- [ ] clinical note works
- [ ] Save closes
- [ ] success toast
- [ ] Undo appears briefly
- [ ] no AI recommendation

## Settings
- [ ] Account & Workspace
- [ ] HPR locked
- [ ] Department/OPD view-only
- [ ] workspace/counter on right
- [ ] Switch Workspace
- [ ] AYUSH toggle
- [ ] pinned specialists
- [ ] pinned specialists appear first in referral selector
- [ ] Data & Sync
- [ ] pending sync
- [ ] Sync Now
- [ ] status indicators consistent

## Final
- [ ] works without live hospital APIs
- [ ] realistic mock data
- [ ] all important interactions functional
- [ ] no lorem ipsum
- [ ] no contradictory statuses
- [ ] no unsupported screens
- [ ] visually follows supplied design references
- [ ] Login → Queue → Scan → Summary → Documents → Edit → Review → Outcome → Sync works end to end

---

# 30. FINAL BUILD INSTRUCTION

Build the complete **MediKiosk Doctor Interface** using this document plus the supplied UI reference images.

Do not merely recreate static screens. Build a connected, stateful, interactive application with realistic mock data and a complete hackathon demonstration.

Follow the images closely for visual fidelity.

Follow this document exactly for product behavior, scope, clinical safety, data, and state transitions.

Do not add unsupported product areas.

The final application should be immediately understandable to a doctor, polished enough for a Smart India Hackathon demonstration, and honest about mocked versus future live ABDM/HIS integrations.

**MediKiosk — Care Closer to You**
