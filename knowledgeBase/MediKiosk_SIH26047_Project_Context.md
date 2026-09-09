# MediKiosk — SIH 2026, Problem Statement 26047
## Project Context Document (for AI-assisted development)

This document consolidates everything documented on the team's Confluence space plus every architecture and design decision made in planning conversations. It is written to give an AI coding assistant complete, accurate context before writing any code.

---

## 1. Product Identity

- **Problem Statement:** SIH26047 — "Patient Case-Taking Software"
- **Sponsoring body:** Ministry of Ayush / All India Institute of Ayurveda (AIIA)
- **Product name in use:** **MediKiosk** (tagline: "Care Closer to You"; secondary tagline: "Healthier People Brighter Tomorrows"). The team's Business Model page also refers to the product as **"SwasthyaSetu"** in competitor-comparison tables — ⚠️ **this naming is inconsistent across the Confluence space and should be resolved before external-facing materials are finalized.**
- **One-line pitch:** *"We don't replace the consultation. We remove the repetitive work around it."*
- **Core value proposition:** MediKiosk prepares the patient before the consultation and helps them follow the doctor's instructions afterward — while keeping the doctor in control throughout.
- **Positioning — explicitly NOT:** a replacement for doctors, an AI diagnosis machine, a generic healthcare chatbot, an AYUSH-only platform, or a system that forces patients through a second queue.

---

## 2. The Problem (official framing)

Indian public hospital OPDs are severely overburdened: tertiary government hospitals see 4,000–10,000 patients/day, with consultations averaging **2–5 minutes** (among the shortest globally, BMJ Open 2017). Classical medical teaching holds that history alone yields a correct diagnosis in **70–80% of cases**. Within the compressed consultation window, doctors cannot properly elicit history, examine, review prior records, diagnose, counsel, and prescribe — leading to under-elicitation, missed comorbidities, and diagnostic error.

**AYUSH institutions face an additional layer:** Ayurvedic history-taking requires assessing *Prakriti, Vikriti, Agni, Koshtha, Ahara-Vihara, Nidana, Samprapti* — a far more extensive framework than standard intake, effectively impossible within OPD time limits.

**Compounding problem — record fragmentation:** patients carry paper prescriptions, lab reports, and discharge summaries from multiple providers, often handwritten, multilingual, and chronologically disordered. ABDM (Ayushman Bharat Digital Mission) provides national digital health infrastructure (ABHA, interoperability standards), but the "first-mile" problem remains: nobody digitizes and structures this before the clinical encounter.

**Why existing approaches fall short:**
- Hospital registration systems capture only demographic/appointment data, no clinical history
- Mobile/tele-triage apps require smartphone literacy, connectivity, pre-enrolment — excludes elderly, rural, low-literacy, first-visit patients (most of the OPD population)
- Manual nurse-led triage doesn't scale and reproduces the same bottleneck
- Generic document scanners don't structure or organize content
- No system explains doctor-approved post-consultation instructions back to patients in a way they'll retain

**Specific constraints any solution must satisfy** (from the Confluence "Problem Statement" page):
- Must not make the patient feel the doctor is being replaced by a machine
- Must reduce repetitive information collection without removing necessary doctor-patient interaction
- Must distinguish patient-reported info, previous-record info, device measurements, and system-generated organization from each other
- Must prevent irrelevant conversational content from overwhelming the clinically relevant case
- AI-generated structuring must be editable and verifiable by the doctor — never treated as diagnosis
- Should use the patient's existing waiting/registration time, not create a second queue
- Must provide multilingual, doctor-approved post-consultation guidance without independently inferring dosage/timing/treatment
- Must support privacy, consent, and secure handling of health information

---

## 3. System Architecture — Three Layers

The system is explicitly architected as **three connected layers**, not two:

```
Kiosk → Shared System / Core → Doctor Interface → Consultation / Referral / Follow-up → Updated Patient Record
```

### 3.1 Kiosk Interface (patient-facing data collection)
Everything captured during a patient session is structured and passed to the shared system.

**Patient & Session Data**
- Patient photograph (captured by kiosk camera)
- UHID / ABHA ID (when available)
- Age, gender, basic details
- Queue token / visit information
- Language preference
- Consent status and consent record

**Patient Interaction Data**
- Every question shown to the patient
- Patient's answer to each question
- Voice input/recording (where enabled) + transcribed voice response
- Touch or manually entered answers
- Regional-language responses
- Session timestamp and source of each response

**Clinical Information Collected**
- Chief complaint
- Current symptoms and history of present illness
- Past medical history
- Drug/allergy history
- Family history
- Personal history
- Review of systems
- **AYUSH-specific information: Prakriti, Vikriti, Agni, Koshtha**

**Vitals & Measurements**
- Blood pressure
- Blood glucose
- Blood group (when available)
- Future device readings: SpO₂, temperature, pulse, weight
- Value, source, and timestamp for each reading

**Previous Medical Records**
- Prescription images, lab reports, previous medical records
- Scanned document metadata
- OCR-extracted text and structured information
- Original document reference for verification

### 3.2 Doctor Interface (clinical review and decision layer)
Receives the complete case from the shared system.

**Patient Case View:** photo, basic details, UHID/ABHA ID, queue/consultation status, chief complaint, current symptoms, relevant history, allergies, family history, vitals, AYUSH info.

**Medical History & Documents:** previous visits, previous prescriptions/reports, OCR-extracted info, chronological medical timeline, links to original scanned documents, previous investigation summaries.

**AI-Assisted Case Information:** structured report of previous history, structured report of current complaint/symptoms, consolidated case summary, **important missing information flagged**, **contradictory answers/data inconsistencies flagged**, abnormal readings and red-flag information, important info highlighted for doctor attention.

**Doctor Review & Verification:** review all info, edit incorrect/incomplete info, verify extracted document info, add clinical observations, confirm final case before consultation — patient-provided, system-extracted, and doctor-verified information must remain distinguishable at all times.

**Consultation & Next Action:** record consultation outcome, continue treatment at current facility, **create a referral to a specialist/facility**, record follow-up requirements, update the patient's longitudinal record.

### 3.3 Shared System / Core (the layer connecting kiosk and doctor)
- **Patient Record Management** — create/retrieve records, maintain UHID/ABHA-linked records, connect multiple visits to the same patient, maintain longitudinal history
- **Clinical Data Management** — convert kiosk inputs into a common structured format, store Q&A data/transcripts/vitals/clinical fields with source and timestamp, combine current visit with previous history
- **Document Management** — store originals + OCR/extraction results, link to patient/visit, keep extraction traceable to source
- **Case Processing & Summary** — generate structured report, organize into doctor-facing case, run completeness/consistency checks, surface red flags
- **Security, Consent & Access** — authentication, session management, role-based access, consent tracking, access control, audit trail
- **Referral & Follow-up** — store referral decisions, destination, status; track follow-up; update record after each care action
- **Integration** — HIS integration support, ABDM/ABHA connectivity, common data layer between kiosk and doctor interface

---

## 4. Doctor Interface — Detailed Design Decisions (from planning sessions)

These are concrete UX/engineering decisions already made, ready to implement.

### 4.1 Queue / Home Screen
- **Scope:** each doctor has their own separate screen/queue (not shared across a department)
- Search by token number or UHID
- QR scanner at the doctor's desk: a flat scanner where the **patient places their QR code on it** (device planned: **USB HID keyboard-wedge barcode/QR scanner** — behaves like a keyboard, no drivers needed, works identically in a browser or in Tauri's webview — no specific model chosen yet)
- **QR scan behavior (decided):** pins the scanned patient to the top of the queue in a "Just scanned" section — does **not** auto-open the full summary
- **Card statuses (decided, simplified):** only **"New"** and **"Reviewed"** — a separate "Consulted" state was considered and explicitly dropped as redundant
- **Status trigger (decided):** only the explicit **"Confirm and push to HIS"** action sets a card to Reviewed — simply opening/viewing a card does NOT change its status (this is deliberate: protects against system lag or accidental open/exit falsely marking a card reviewed)
- **"Needs attention" section (decided):** red-flag patients are pinned here at the top of the queue; the card automatically clears out of this section once it becomes Reviewed
- Optional secondary UI element: a subtle "last opened at [time]" hint per card (not a status change) so a doctor who got interrupted mid-review has a memory aid

### 4.2 Patient Summary Screen
Structured exactly per the required clinical format: **Chief Complaint → History of Present Illness → Past History → Drug/Allergy History → Family History → Personal History → Review of Systems → Prior Investigations**, plus vitals (with source + timestamp shown per reading — e.g. "Measured at kiosk · 9:42 am" vs "Self reported"), a red-flag banner pinned above all other content when applicable, and scanned document thumbnails.
- Two actions only: **"Edit summary"** and **"Confirm and push to HIS"** — deliberately minimal, since the summary must remain an editable draft, never presented as an autonomous diagnosis

### 4.3 Edit Interaction (decided: Option C — modal editor)
Tapping "Edit summary" opens a **modal/popup overlay**, not inline editing and not a separate full-screen edit mode. Rationale chosen: strongest visual separation between "viewing" and "editing" state for a clinical record.
- Vitals (BP, blood sugar) are **not editable** in the modal since they are device-sourced — a wrong reading should be fixed by re-measuring, not by typing over it
- Blood group **is** editable since it's self-reported
- "Cancel" discards all changes and closes; "Save changes" is the only action that commits — nothing writes until pressed

### 4.4 Document Viewer (decided)
**Full page-flip viewer** to browse multiple scanned pages — not thumbnail-only. Implementation note: the kiosk will likely hand off multiple separate scanned images (not one combined PDF), so the viewer should treat each image as one "page" in the flip sequence.

### 4.5 Data Contract — Doctor-Facing Summary (draft schema)
```json
{
  "patient": {
    "photo_url": "string",
    "abha_id": "string | null",
    "age": "number",
    "gender": "string",
    "queue_token": "string"
  },
  "chief_complaint": "string",
  "history_of_present_illness": "string",
  "past_history": "string",
  "drug_allergy_history": "string",
  "family_history": "string",
  "personal_history": "string",
  "review_of_systems": "string",
  "vitals": {
    "blood_pressure": { "value": "string", "source": "kiosk_device | self_reported | scanned_doc", "timestamp": "string" },
    "blood_sugar": { "value": "string", "source": "kiosk_device | self_reported | scanned_doc", "timestamp": "string" },
    "blood_group": { "value": "string", "source": "self_reported | scanned_doc" }
  },
  "prior_investigations_summary": "string",
  "red_flags": [{ "symptom": "string", "severity": "string" }],
  "scanned_documents": [{ "doc_type": "string", "image_url": "string", "date": "string" }]
}
```
⚠️ **Reconciliation needed:** this schema was drafted before the fuller kiosk data model (Section 3.1) was available. The kiosk's actual data model additionally includes **SpO₂, pulse, weight, temperature, consent records, and AYUSH-specific fields (Prakriti/Vikriti/Agni/Koshtha)** which are not yet reflected in the schema above — reconcile before building the real API contract.

---

## 5. Kiosk Interface — Full Screen Inventory (44 screens, as designed on Confluence)

The kiosk uses a **doctor mascot character** (a friendly animated illustrated doctor, referred to as "MediKiosk Doctor") as the central visual/conversational presence — **not an orb or abstract shape.** Every screen includes a **live viewfinder** (camera self-view, "You're in frame" indicator) and **live captions** of both what the kiosk says and what it hears the patient say ("Listening..." transcript box).

| # | Screen | Notes |
|---|---|---|
| 0 | Idle screen | Two states: **State A** (nobody nearby — low-attention, subtle animation) and **State B** (presence sensor detects someone — doctor becomes attentive, greets, invites approach). Idle screen also cycles through a silent 6-scene explainer loop when no one is present (deliberately minimal — no jargon, no ABHA/consent details, no QR codes at this stage; understandable in 2–3 seconds). Session should only begin on explicit patient action (Start button or voice), never automatically from presence detection alone (safety decision, avoids accidental session start) |
| 1 | Welcome | Doctor mascot, "Welcome to MediKiosk! I'll help you get ready for your doctor consultation," 4 icon callouts (share health info / get check-up ready / upload reports / faster consultation), Start button, "Change language" and "Accessibility" options |
| 2 | Language selection | "Which language would you like to use?" — voice or tap. Options shown: English, Hindi, Bengali, Marathi, Tamil, Telugu |
| 3 | Consent | "Before we begin, I'd like your permission to collect some information about your health and prepare it for your doctor." Explains why (understand condition, use medical reports, share with doctor only, keep data safe). Three explicit actions: **"I have a question"**, **"I agree / Continue"**, **"Do not agree / Exit the kiosk"** |
| 4 | Existing / New Patient | Branch point |
| 5A | New Patient — Create Record or Continue Without | **Design decision (documented discussion):** does NOT force account creation. Two options: **"Create my patient record"** (persists for future visits) vs **"Continue for this visit"** (temporary session only, not a persistent profile). Explicit architectural distinction: a **persistent patient record** (name, UHID/ABHA, history, previous encounters) is different from a **temporary encounter/session** (session ID, today's answers/measurements/documents/summary/QR) — even "continue without a record" still creates a session internally, since answers/documents/measurements/QR/doctor-summary all need to attach to *something*. Terminology preference: "patient record/profile," not "account" (avoids consumer-app connotations) |
| 6A | Existing Patient — Identifier entry | ⚠️ **Changed mid-design:** originally UHID/ABHA identification; team decided to use **phone number only for now**, with UHID/ABHA marked "coming soon" |
| 6B | Enter Identifier | — |
| 6C | Verifying / Searching | — |
| 7 | Existing Patient Found | — |
| 8 | Identification Failed | — |
| 9–11 | Basic Profile / Age / Gender | ⚠️ **Marked to be skipped** — team decided these questions are asked by the doctor during prescription, so should not be duplicated/mixed into the kiosk flow |
| 12 | Phone Number | — |
| 13 | Profile Confirmation | — |
| 14 | Viewfinder | Camera self-view confirmation screen |
| 15 | Conversation / Question | Main clinical interview screen |
| 16 | Listening | Marked "irrelevant" (superseded/merged elsewhere) |
| 17 | Processing / Understanding | — |
| 18 | "I Heard..." Confirmation | Lets the patient confirm what the kiosk transcribed before proceeding |
| 19 | Touch Input | Manual entry fallback |
| 20 | Choice-Based Question | — |
| 21 | Didn't Understand / Retry | — |
| 22 | Unknown / Not Applicable | "Which option applies to you?" — **I don't know / Not applicable / I'm not able to recall right now / Prefer not to say**, with a tip: "You can always share this information later with your doctor." (This directly answers the anticipated judge question "why isn't there an 'I don't know' option for medical-history questions?") |
| 23 | Clinical Safety / Red-Flag Escalation | — |
| 24–29 | Measurements Introduction, BP Instructions, BP Positioning, BP Measuring, BP Result, Measurement Failed | ⚠️ Marked "not relevant currently" by the team (deprioritized) |
| 30 | Document Introduction | — |
| 31 | Place Document | ⚠️ **Open discussion, unresolved:** current screen implies the patient waits for the scan to finish; team is considering having the scan run **concurrently** with the rest of the question flow instead of blocking |
| 32 | Scanning | If concurrent scanning is adopted, this screen becomes unnecessary — replaced by a small in-progress indicator elsewhere on screen |
| 33 | Document Scanned | — |
| 34 | OCR Processing | — |
| 35 | Document Problem | — |
| 36 | Document Collection Complete | — |
| 37 | Preparing Your Case | "I'm now putting together all the information — your conversation, health details, and documents — so your doctor has a complete picture," with a progress bar |
| 38 | Case Ready | — |
| 39 | QR Generated | — |
| 40 | Wristband Printing | — |
| 41 | Collect Your Wristband | — |
| 42 | You're All Set / Proceed to Consultation | — |
| 43 | Session Complete | — |
| 44 | Reset / Returning to Idle | — |

**Confirmed-implemented (resolves earlier open questions):** live captions ✅, camera viewfinder ✅ (shown on relevant screens, e.g. "Camera On" / "You're in frame"), consent screen ✅ (with a clear "why we collect this" explanation and an explicit decline/exit path), language selection ✅, an "I don't know / prefer not to say" option for clinical questions ✅.

**Still open / unresolved across the kiosk design:**
- Concurrent vs. sequential document scanning (screens 31–32, explicitly flagged by the team as "Discuss this")
- Screens 9–11 are marked to skip, but it's not yet confirmed how age/gender reach the doctor interface if not captured at the kiosk at all
- Screens 24–29 (vitals measurement flow) marked "not relevant currently" — conflicts with the data contract, which expects the kiosk to capture blood pressure and blood sugar; needs reconciling
- No AYUSH-specific screen has been shown yet, despite Prakriti/Vikriti/Agni/Koshtha being part of the documented clinical data model (Section 3.1) — this is a known gap raised in planning discussion and still needs a concrete screen design

---

## 6. Tech Stack

- **Frontend:** Next.js
- **Backend:** Django
- **Desktop shell:** Tauri — chosen specifically for **offline capability**, so a doctor can still review a cached summary without live connectivity. This requires real design work beyond just picking Tauri: local caching (e.g. bundled SQLite) of the currently-open patient, a **pending-sync queue** for actions taken offline (including "Confirm and push to HIS"), and a visible sync-status indicator so a doctor knows whether an action has actually reached the hospital system or is still pending.
- **QR hardware:** USB HID keyboard-wedge scanner (plug-and-play, no drivers, works in any browser context including Tauri's webview)

### Recommended HIS integration approach (not yet implemented)
- Use **FHIR** as the data exchange format — this is both what the official PS specifies and what ABDM/India's national digital health stack is built on
- Don't attempt bespoke integration with an arbitrary/generic hospital system — build and demo against **one real, open-source, FHIR/HL7-compatible HIS: Bahmni (built on OpenMRS)**, which is genuinely used in Indian government and AYUSH-linked hospitals. This gives a credible, checkable live integration instead of a purely fictional one.
- Don't build a custom patient-to-doctor queue/routing system — defer department/doctor assignment to the hospital's existing registration process, exactly as it happens today
- Add a **"suggested specialist referral" flag** (not automatic routing) when the kiosk's conversation surfaces something suggesting a specialist need (e.g. chest pain → possible cardiology) — a human (reception/triage staff) acts on it, the system never auto-routes
- Route the "Confirm and push to HIS" action through the same offline pending-sync pattern described above; show the doctor a clear confirmation once the push actually succeeds, not just that the button was clicked

---

## 7. Safety Principles (explicit, documented)

1. No autonomous diagnosis
2. AI output is always a draft
3. Doctor verifies all clinical summaries
4. Red flags trigger human attention (never automated action)
5. Source documents remain traceable (every piece of info tagged with its origin: patient-reported / previous record / device measurement / system-organized / doctor-verified)
6. Consent precedes any sensitive processing
7. The system must not independently infer medication dosage, timing, or treatment decisions — doctor-approved instructions are always the source of truth for anything communicated back to the patient

---

## 8. Anticipated Judge / Adoption Questions (from Confluence Q&A page)

A representative sample the team has already prepared for — useful for the AI IDE to understand real product constraints, not just features:
- What happens if the AI misunderstands a patient's answer (accents, Hindi/Hinglish, dialects, background noise)?
- Why would an elderly or digitally illiterate person trust an AI machine with their health information?
- What happens if the kiosk records the wrong vital signs?
- What happens if the patient gives incomplete or deliberately incorrect information?
- How does MediKiosk integrate with existing hospital systems?
- How are you preventing hallucinations, and what's the fallback mechanism?
- How accurate are your measurements compared with certified medical devices, and how are sensors calibrated?
- What makes this different from a tablet with a Google Form?
- What's the estimated cost per kiosk / per patient, and what's the hospital's ROI?
- Why isn't Eka Care (or a similar existing app) enough?
- How are you protecting sensitive health data, and handling consent and deletion requests?
- What happens without electricity?
- What happens if the doctor disagrees with the AI's summary?
- If the kiosk makes a mistake, who is accountable — designer, hospital, software, or patient?

---

## 9. Business Model, Stakeholders & Market Context

**Four core stakeholders:** Patients (primary end user) → Doctors (primary professional user) → Hospitals (organizational deployer/customer) → Government (institutional/large-scale adopter enabling wider deployment).

**Revenue model options considered:** B2B SaaS subscription (per doctor/clinic), Kiosk-as-a-Service (hardware lease + software subscription + AMC), Hospital Enterprise Licensing, Government/Institutional procurement contracts, Pay-per-Consultation, API/Integration-as-a-Service for existing HMS/EMR/telemedicine companies, Healthcare Operations Analytics (premium dashboard subscription), White-Label licensing.

**Competitors identified:** Health ATM/Health Kiosk companies, Dozee (contactless vital monitoring), Higi (self-service health screening), Karma Healthcare (telemedicine kiosks for underserved areas), Apollo/large hospital networks, generic hospital self-service kiosks. None of these combine conversational AI history-taking + document OCR + AYUSH-specific assessment + ABDM/FHIR integration in one platform.

**Kiosk hardware cost estimate (component-based BOM, production planning figures):**
- 43-inch kiosk: ~₹1.1–1.4 lakh per unit
- 32-inch kiosk: ~₹85,000–1.15 lakh per unit
- Major components: touch display, embedded computer, 1080p camera, heart rate + SpO₂ sensor, weight system, temperature sensor, OCR/document scanner, thermal printer, wiring/integration electronics

---

## 10. Roadmap, Milestones & Risk Management

**Feature priority (documented):**
- 🔴 **Must have:** patient onboarding + consent, voice+touch history capture, structured clinical history, document upload/scan, physician-ready summary, doctor edit/confirm workflow
- 🟠 **Should have:** adaptive follow-up questions, OCR + clinical entity extraction, chronological medical timeline, multilingual interaction, rule-based red-flag detection
- 🟢 **Differentiators:** AYUSH-specific history mode, referral continuity, follow-up tracking, facility/service navigation, analytics dashboard

**Roadmap principle:** *"Build one complete working patient-to-doctor journey first, then add intelligence and differentiation around it."* Explicit rule: *"Never allow individual modules to become more polished than the end-to-end product is functional."*

**8 milestones defined:** (1) Problem & Workflow Freeze, (2) UX & Data Design, (3) Core MVP, (4) AI Intelligence, (5) Safety & Accessibility, (6) Integration Architecture, (7) Validation, (8) Final SIH Delivery.

**Key risks and mitigations documented:** AI behaving like a diagnostic system (mitigation: strictly intake/structuring, doctor decides), incorrect OCR (source evidence + confidence indicators + physician verification), noisy hospital speech recognition (push-to-talk + touch fallback), multilingual errors (validate a limited language set first), false/missed red flags (conservative rules + human review), integration complexity (mock/sandbox APIs, standards-ready architecture), scope creep (strict MVP → Intelligence → Differentiators prioritization).

**Success metrics/KPIs tracked:** Intake Completion Time, History Completeness, Doctor Review Time, Doctor Edit Rate, Document Extraction Coverage, OCR Quality, Timeline Quality, Accessibility Completion, Language Usability, Red-Flag Recall, False Alert Rate, User Satisfaction. Note: *prototype metrics must be labeled as simulated/prototype validation unless obtained through an approved real clinical study.*

**Demo headline metric (decided in planning):** open the pitch citing the PS's own statistic (2–5 min average Indian OPD consultation, BMJ Open 2017), then give a **live stopwatch proof** on stage — a rehearsed, honestly-timed "before" (manual chart review) vs "after" (doctor reading the prepared summary screen) comparison.

---

## 11. Known Open Issues / Discrepancies to Resolve

These are real, unresolved gaps or conflicts surfaced across planning — worth deliberately deciding before building further:

1. **Product naming inconsistency:** "MediKiosk" vs "SwasthyaSetu" used in different Confluence pages — pick one.
2. **Doctor-facing schema (Section 4.5) is missing fields** the kiosk's actual data model promises (SpO₂, pulse, weight, temperature, consent record, AYUSH fields) — needs reconciling into one real API contract.
3. **AYUSH screen is undesigned:** the clinical data model explicitly includes Prakriti/Vikriti/Agni/Koshtha, but no kiosk screen for capturing this has been designed yet.
4. **Vitals scope conflict:** screens 24–29 (BP/vitals measurement flow) are marked "not relevant currently" by the team, but the doctor-facing data contract and Section 3.1 both expect the kiosk to capture blood pressure and blood sugar — clarify whether vitals capture is in or out of current scope.
5. **Concurrent vs. sequential document scanning** (screens 31–32) — explicitly flagged as an open discussion, not decided.
6. **Age/Gender capture removed from kiosk (screens 9–11 skipped)** — need to confirm how this data still reaches the doctor interface if not collected at the kiosk.
7. **Patient satisfaction risk (raised, not yet resolved):** reducing the doctor's questioning time may make patients feel under-attended to, since the doctor will visibly ask fewer questions once the summary is already prepared.
8. **Doctor trust/resistance risk (raised, not yet resolved):** doctors may perceive the system as making their diagnosis dependent on a machine, risking resistance to adoption — separate from and in addition to the "AI as draft, doctor decides" safety principle already documented.
9. **"Consulted" status merge:** doctor interface now only tracks New/Reviewed (Consulted was dropped) — confirm this is compatible with any downstream reporting/analytics that might have expected a third state.

---

*Document compiled from team Confluence documentation and project planning conversations, for use as development context.*
