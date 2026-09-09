# MediKiosk Kiosk UI --- Complete Screen Specification

## Overview

MediKiosk is the patient-facing OPD self-check-in kiosk for the combined
SIH-26047 + SIH-26133 solution. It collects patient identity, consent,
structured clinical history, vitals, previous medical documents,
OCR-extracted information, and session metadata, then prepares a concise
clinician-facing case and visit QR.

The design is voice-first with touch/manual fallbacks. The central
friendly doctor mascot is the consistent MediKiosk care-assistant
persona, not the patient's actual doctor. The UI uses a soft
mint/teal/white healthcare aesthetic, rounded cards, gentle shadows,
generous whitespace, blurred clinic imagery, leaf motifs, and a small
persistent camera preview.

## Common UI Rules

### Voice-first interaction

The normal interaction is:

**Ask → Listen → Understand → Confirm → Store structured answer →
Continue**

The kiosk should automatically advance after a clear spoken response
instead of requiring a Continue tap after every question.

### Dual bottom captions

The bottom interaction area has two separate panels:

-   **MediKiosk:** exactly what the kiosk says.
-   **You:** what the kiosk heard/understood, or `Listening...`.

This is deliberately not a chat UI.

### Camera

A small camera preview remains visible in a corner. Normal status:

> Camera On --- You're in frame

If the patient moves away, the kiosk verbally asks them to return to
frame. Screen 14A is the dedicated recovery state.

### Clinical structure

The interview produces structured fields:

1.  Chief Complaint
2.  History of Present Illness
3.  Past History
4.  Drug / Allergy History
5.  Family History
6.  Personal History
7.  Review of Systems
8.  Prior Investigations

AYUSH concepts such as Prakriti, Vikriti, Agni, and Koshtha are derived
from normal patient-friendly questions rather than asked as technical
jargon.

### Hardware consistency

The physical kiosk has a tablet, front camera, hidden microphone,
internal speaker, horizontal document/OCR slot, fingerprint sensor,
measurement hardware, a dedicated wristband dispensing section, and a
separate weighing platform.

**Documents are inserted into a horizontal slot. They are never placed
on a flatbed scanner.**

**The kiosk generates the QR; the doctor-side system scans it.**

------------------------------------------------------------------------

# Screen-by-Screen Specification

## Screen 0 --- Idle

**Purpose:** Wait for the next patient.

**Content:** MediKiosk branding, friendly mascot, Care Closer to You
tagline, calm clinic background, and a prominent invitation to begin.

**Interaction:** Touch or supported voice wake/start.

**Next:** Screen 1.

------------------------------------------------------------------------

## Screen 1 --- Welcome

**Purpose:** Introduce the kiosk and explain that it will collect
information before the doctor consultation.

Suggested message:

> I'll help collect some information before you meet your doctor.

Briefly explain questions, measurements, documents, and preparation of
information for the doctor.

**Next:** Screen 2.

------------------------------------------------------------------------

## Screen 2 --- Language Selection

**Purpose:** Establish the patient's preferred language.

The patient can speak naturally, for example:

> I choose Hindi.

The kiosk should infer the intended language, switch the voice/UI
language, and automatically proceed without requiring another tap.

**Next:** Screen 3.

------------------------------------------------------------------------

## Screen 3 --- Consent

**Purpose:** Obtain consent before personal and clinical information is
collected.

Explain in simple language why information is collected and how it will
be used for the visit.

**Input:** Voice or touch.

**Failure:** Do not proceed into clinical collection without the
required consent.

**Next:** Screen 4.

------------------------------------------------------------------------

## Screen 4 --- Existing / New Patient

**Purpose:** Determine whether the patient already has a record.

Primary choices:

-   Existing Patient
-   New Patient

Voice answers should automatically route the patient.

**Existing → Screen 6.**

**New → Screen 5.**

------------------------------------------------------------------------

## Screen 5 --- New Patient / Account Offer

**Purpose:** Offer persistent record/account creation without making it
mandatory for the current encounter.

Important distinction:

**Skip for now means skip permanent account/record setup, not skip the
current kiosk session.**

The encounter still needs a session record, clinical summary, and visit
QR.

Options:

-   Create record
-   Skip for now

**Next:** Basic profile collection.

------------------------------------------------------------------------

## Screen 6 --- Find Existing Record

**Purpose:** Begin lookup of an existing hospital record.

Potential identifiers:

-   UHID
-   ABHA ID
-   Configured hospital identifier

**Next:** Screen 6B.

------------------------------------------------------------------------

## Screen 6B --- Authentication Input

**Purpose:** Enter the patient identifier.

Provide voice entry plus touch/manual entry such as a keypad.

**Next:** Screen 6C.

------------------------------------------------------------------------

## Screen 6C --- Verification / Searching

**Purpose:** Show that the kiosk is searching for the supplied record.

Patient-friendly message:

> Looking for your record...

Avoid technical API/database language.

**Found → Screen 7.**

**Not found → Screen 8.**

------------------------------------------------------------------------

## Screen 7 --- Existing Patient Found

**Purpose:** Confirm the retrieved patient is the correct person.

Show appropriate basic identifying information such as name, patient ID,
photograph, and demographics.

Ask for confirmation.

**Next:** Basic profile completion/confirmation.

------------------------------------------------------------------------

## Screen 8 --- Identification Failed

**Purpose:** Recover when the existing record cannot be found.

Suggested message:

> I couldn't find that record.

Offer retry, identifier correction, or an appropriate new-patient
fallback.

Avoid trapping the patient in an endless lookup loop.

------------------------------------------------------------------------

## Screen 9 --- Name

**Purpose:** Collect full name.

Prompt:

> What is your full name?

Support voice and touch keyboard.

**Next:** Screen 10.

------------------------------------------------------------------------

## Screen 10 --- Age

**Purpose:** Collect age.

Prompt:

> How old are you?

Support voice and numeric keypad. Validate clearly invalid values.

**Next:** Screen 11.

------------------------------------------------------------------------

## Screen 11 --- Gender

**Purpose:** Collect gender information required by the configured
clinical workflow.

Support voice and touch choices using respectful, clear labels.

**Next:** Screen 12.

------------------------------------------------------------------------

## Screen 12 --- Phone Number

**Purpose:** Collect phone number.

Support voice and numeric input. Confirm the interpreted number when
needed.

**Next:** Screen 13.

------------------------------------------------------------------------

## Screen 13 --- Profile Confirmation

**Purpose:** Confirm the basic patient profile before clinical
questioning.

Potential fields:

-   Name
-   Age
-   Gender
-   Phone
-   Patient/visit identifier

Patient can confirm or correct.

**Next:** Screen 14.

------------------------------------------------------------------------

## Screen 14 --- Photo Capture

**Purpose:** Capture the patient photograph.

Keep the camera preview small and integrated into the interface.

Prompt:

> Please look toward the camera.

Then indicate:

> You're in frame.

Use a clear capture animation.

**Next:** Screen 15.

------------------------------------------------------------------------

## Screen 14A --- Out of Frame

**Purpose:** Recover when the patient leaves the camera frame.

Show a small live preview and simple positioning guidance.

Suggested prompt:

> Please come a little closer and stay in frame.

Return to the active step when framing is restored.

------------------------------------------------------------------------

## Screen 15 --- Clinical Conversation

**Purpose:** Main clinical interview.

The mascot remains the central conversational focal point. This must
look like a guided conversation, not a chat application.

Collect the structured clinical fields:

-   Chief Complaint
-   HPI
-   Past History
-   Drug/Allergy History
-   Family History
-   Personal History
-   Review of Systems
-   Prior Investigations

The AI may derive AYUSH concepts from ordinary patient questions.

**Next:** Screen 16.

------------------------------------------------------------------------

## Screen 16 --- Listening

**Purpose:** Clearly indicate that it is the patient's turn to speak.

Use microphone indication and subtle waveform animation.

Caption:

> Listening...

**Next:** Screen 17 when speech is detected.

------------------------------------------------------------------------

## Screen 17 --- Processing / Understanding

**Purpose:** Give the system time to interpret the patient's answer.

Suggested message:

> Let me understand that...

Avoid technical AI/NLP wording.

**Next:** Screen 18.

------------------------------------------------------------------------

## Screen 18 --- I Heard...

**Purpose:** Confirm the system's interpretation before committing it to
the clinical record.

Example:

> I heard: "I've had chest pain since yesterday."

Then ask:

> Is that right?

Choices can be voice or touch:

-   Yes
-   No / Correct it

**Yes → next question.**

**No → Screen 19 or Screen 21.**

------------------------------------------------------------------------

## Screen 19 --- Touch / Manual Input

**Purpose:** Voice fallback.

Depending on the question, provide:

-   Keyboard
-   Numeric keypad
-   Text area
-   Buttons
-   Appropriate structured controls

Manual and voice answers must populate the same underlying data fields.

------------------------------------------------------------------------

## Screen 20 --- Choice Question

**Purpose:** Present structured choices where free-form speech is
unnecessary.

Examples:

-   Yes / No
-   Symptom presence
-   Frequency
-   Severity
-   Duration categories

Voice answers remain supported.

------------------------------------------------------------------------

## Screen 21 --- Retry / Unclear Answer

**Purpose:** Recover from low-confidence speech understanding.

Prefer:

> I didn't quite catch that. Could you say it again?

rather than technical speech-recognition errors.

Options:

-   Say again
-   Type/tap answer
-   Choose from options

------------------------------------------------------------------------

## Screen 22 --- Unknown / Not Sure

**Purpose:** Let the patient explicitly state uncertainty.

Examples include unknown medication names, previous diagnoses, or family
history.

Store unknown as **unknown**, not automatically as `No`.

------------------------------------------------------------------------

## Screen 23 --- Red-Flag Escalation

**Purpose:** Identify potentially important symptoms and surface them
for the clinician.

Example:

> This may need your doctor's attention.

Do not diagnose.

Capture the symptom and severity, mark it as a red flag, and prioritize
the patient in the doctor interface's **Needs Attention** area according
to the configured workflow.

------------------------------------------------------------------------

## Screen 24 --- Measurement Introduction

**Purpose:** Transition from conversation to physical measurements.

Suggested message:

> Now I'll take a few health measurements.

Explain briefly what will happen and what the patient needs to do.

**Next:** Screen 25.

------------------------------------------------------------------------

## Screen 25 --- BP Instructions

**Purpose:** Explain blood-pressure measurement.

Guide the patient on posture, arm position, stillness, and not talking
during measurement.

**Next:** Screen 26.

------------------------------------------------------------------------

## Screen 26 --- BP Positioning

**Purpose:** Show the correct physical positioning.

Use an illustration of the patient/arm/cuff and clear visual
instructions.

**Next:** Screen 27.

------------------------------------------------------------------------

## Screen 27 --- BP Measuring

**Purpose:** Active BP measurement.

Show a calm measurement-in-progress state.

Suggested message:

> Taking your blood pressure...

Avoid unnecessary movement/talking.

**Next:** Screen 28.

------------------------------------------------------------------------

## Screen 28 --- BP Result

**Purpose:** Show the measured BP.

The stored value should include:

-   Value
-   Source
-   Timestamp

Example source:

`kiosk_device`

The kiosk should not diagnose the patient from the reading.

**Next:** Screen 29 / additional measurement.

------------------------------------------------------------------------

## Screen 29 --- Additional Measurement / SpO2

The generated design for Screen 29 depicts an SpO2/Oxygen Saturation
measurement state.

**Purpose:** Guide another device measurement.

Depending on hardware, this can include:

-   Oxygen saturation
-   Pulse

Record value, source, and timestamp.

**Note:** The original numbering had drifted because Screen 29 was
initially anticipated as a measurement-failure state, but the actual
generated design became SpO2.

------------------------------------------------------------------------

## Screen 30 --- Document Introduction

**Purpose:** Explain optional/available previous-document collection.

Suggested message:

> If you have previous reports or medical documents, you can give them
> to me. I'll scan them for your doctor.

Hardware must be represented correctly: the patient feeds paper into the
**horizontal document/OCR slot below the tablet**.

------------------------------------------------------------------------

## Screen 31 --- Insert Document

**Purpose:** Teach the physical document insertion action.

Show:

1.  Hold the document
2.  Align it with the slot
3.  Feed it into the horizontal opening

Never depict a flatbed scanner.

------------------------------------------------------------------------

## Screen 32 --- Background Scanning

**Purpose:** Scan documents without blocking the clinical conversation.

This is a key interaction decision.

The patient should continue talking while scanning happens in the
background.

The normal mascot + dual-caption conversation UI remains visible.

Add only a small scan-progress component at the side/corner.

Preferred progress animation:

A small document-shaped cutout gradually fills with color like water
filling a glass.

It must remain peripheral and non-distracting.

------------------------------------------------------------------------

## Screen 33 --- Document Scanned

**Purpose:** Confirm successful capture.

Suggested message:

> Document received

Optionally show document type, page count, or scan quality.

Do not require unnecessary interaction after success.

------------------------------------------------------------------------

## Screen 34 --- OCR / Information Extraction

**Purpose:** Read and structure information from the scanned document.

Conceptual pipeline:

``` text
Image
→ OCR
→ Text extraction
→ Information extraction
→ Structured clinical data
→ Original document reference
```

Patient-friendly wording:

> I'm reading the information from your document.

Store the original document reference alongside extracted information
for verification.

------------------------------------------------------------------------

## Screen 35 --- Document Scan Failed

**Purpose:** Recover from an unreadable document.

Current approved options:

### Scan Again

Retry document scanning.

### Skip for Now

Skip **only the document**, not the entire patient session.

Preferred wording:

> I couldn't read that document clearly.

Then:

> Would you like to scan it again or skip it for now?

**Scan Again → Screen 31.**

**Skip for Now → Screen 36.**

------------------------------------------------------------------------

## Screen 36 --- Document Collection Complete

**Purpose:** Confirm that the document stage is complete.

Checklist concept:

-   Document Received
-   Information Extracted
-   Ready

Main message:

> All your documents are collected!

Then proceed to case preparation.

------------------------------------------------------------------------

## Screen 37 --- Preparing Your Case

**Purpose:** Assemble the clinician-ready case.

Combine:

-   Patient information
-   Conversation
-   Clinical history
-   Vitals
-   Existing records
-   Scanned documents
-   Extracted information

Suggested message:

> I'm now putting together all the information --- your conversation,
> health details, and documents --- so your doctor has a complete
> picture.

Show a processing/progress state.

------------------------------------------------------------------------

## Screen 38 --- Case Ready

**Purpose:** Confirm successful case preparation.

Main message:

> Your case is ready!

Explain that conversation, health details, and document information have
been combined.

Checklist:

-   Conversation Summary
-   Health Details
-   Documents
-   All Set

**Next:** Screen 39.

------------------------------------------------------------------------

## Screen 39 --- Visit QR Created

**Purpose:** Confirm creation of the visit QR.

### Current approved redesign

Do **not** make this a wristband-printing screen.

The central visual should be a QR-code logo/icon with a clear
confirmation:

> Your visit QR has been created!

Supporting text:

> Your doctor can scan this code to securely access your prepared case.

Security reassurance:

> Your information is secure and shared only with your treating care
> team.

The kiosk generates the QR. The doctor-side system/scanner scans it.

**Next:** Screen 40.

------------------------------------------------------------------------

## Screen 40 --- Get Your Wristband Ready

**Purpose:** Prepare the patient for physical wristband dispensing.

The physical kiosk has a dedicated wristband section from which the
wristband will emerge.

Once the QR is generated, instruct the patient to place their hand/arm
close to this section.

Main message:

> Get Your Wristband Ready

Supporting message:

> Your wristband with your visit QR will be dispensed automatically.

The screen should demonstrate, preferably with animation:

1.  Where the wristband will emerge
2.  Where the hand should be placed
3.  How the arm should be positioned
4.  That the palm should be up
5.  That the hand should remain steady

Suggested instruction:

> Place your hand here.

and:

> Hold your hand steady, palm up, close to the wristband slot.

This is a **hand-positioning / dispensing-preparation** screen, not a
printing screen.

------------------------------------------------------------------------

## Screen 41 --- Collect Your Wristband

**Purpose:** Confirm that the wristband has been dispensed and instruct
the patient to take it.

Main message:

> Collect Your Wristband

Supporting message:

> Your wristband has been dispensed successfully!

Show the wristband emerging from the dedicated dispenser slot and a
clear take/collect indication.

Patient instruction:

> Please take your wristband from the slot.

------------------------------------------------------------------------

## Screen 42 --- You're All Set

**Purpose:** Explain what happens after the wristband is collected.

Main message:

> You're All Set!

Supporting message:

> Your information has been securely sent to your care team.

Next-step guidance:

-   Please keep your wristband with you.
-   Take a seat and wait for your doctor to call you.
-   You will be notified shortly.

The checklist can show all stages complete:

-   Conversation Summary
-   Health Details
-   Documents
-   Visit QR Generated
-   Wristband Dispensed
-   Wristband Collected
-   All Set

This screen is the **next-instructions state**, not yet the final
session-reset state.

------------------------------------------------------------------------

## Screen 43 --- Session Complete

**Purpose:** Mark the patient-facing kiosk session as finished.

Main message:

> Thank You!

> Your check-in is complete.

Supporting message:

> We appreciate you for using MediKiosk. Wishing you a safe and healthy
> visit!

Actions:

-   Back to Home
-   Start New Check-in

The mascot can use a friendly completion gesture.

This is different from Screen 42:

-   **42:** tells the patient what to do next.
-   **43:** confirms the kiosk interaction is complete.

------------------------------------------------------------------------

## Screen 44 --- Reset to Idle

**Purpose:** Clear the previous session and return the kiosk to a ready
state.

Current concept:

> Ready for the Next Patient

Supporting message:

> Thank you for using MediKiosk.

> This kiosk will return to the home screen shortly.

A short countdown can be displayed:

> 5\
> Returning in 5 seconds...

After the countdown, clear all patient/session-specific UI state and
return to Screen 0.

Clear at minimum:

-   Patient identity
-   Photograph
-   Clinical answers
-   Voice transcript
-   Temporary document state
-   Measurements
-   QR/session identifier
-   Wristband state
-   Camera/session state

**Security requirement:** No previous patient's information should
remain visible after returning to Idle.

------------------------------------------------------------------------

# End-to-End Flow

``` text
0 Idle
↓
1 Welcome
↓
2 Language
↓
3 Consent
↓
4 Existing / New
├── Existing → 6 → 6B → 6C → 7
└── New → 5
        ↓
9 Name
↓
10 Age
↓
11 Gender
↓
12 Phone
↓
13 Profile Confirmation
↓
14 Photo
↓
15 Conversation
↕
16 Listening
↓
17 Processing
↓
18 Heard Confirmation
├── 19 Manual
├── 20 Choice
├── 21 Retry
└── 22 Unknown
↓
23 Red Flag when applicable
↓
24 Measurement Intro
↓
25 BP Instructions
↓
26 BP Position
↓
27 BP Measuring
↓
28 BP Result
↓
29 SpO2 / Additional Measurement
↓
30 Document Introduction
↓
31 Insert Document
↓
32 Background Scanning
↓
33 Document Scanned
↓
34 OCR / Extraction
↓
35 Failure if required
├── Scan Again → 31
└── Skip for Now → 36
↓
36 Document Collection Complete
↓
37 Preparing Your Case
↓
38 Case Ready
↓
39 Visit QR Created
↓
40 Get Wristband Ready
↓
41 Collect Wristband
↓
42 You're All Set
↓
43 Session Complete
↓
44 Reset
↓
0 Idle
```

# Data Contract

The kiosk ultimately produces structured patient/visit data including:

``` json
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
    "blood_pressure": {
      "value": "string",
      "source": "kiosk_device | self_reported | scanned_doc",
      "timestamp": "string"
    },
    "blood_sugar": {
      "value": "string",
      "source": "kiosk_device | self_reported | scanned_doc",
      "timestamp": "string"
    },
    "blood_group": {
      "value": "string",
      "source": "self_reported | scanned_doc"
    }
  },
  "prior_investigations_summary": "string",
  "red_flags": [
    {
      "symptom": "string",
      "severity": "string"
    }
  ],
  "scanned_documents": [
    {
      "doc_type": "string",
      "image_url": "string",
      "date": "string"
    }
  ]
}
```

The implementation can extend this with language, consent,
question/answer history, timestamps, input source, voice/transcription
metadata, OCR text, and document references.

# Doctor-Side Relationship

The kiosk prepares a clinician-facing case.

Red-flag patients are surfaced in the doctor queue under **Needs
Attention**.

Doctor queue states are:

-   New
-   Reviewed

A patient becomes **Reviewed** when the doctor presses:

> Confirm and Push to HIS

That action also clears Needs Attention and triggers the HIS push.

The kiosk itself does not diagnose or replace the doctor.

# Design Principles

1.  Voice first; touch/manual fallback.
2.  Central mascot, not chatbot bubbles.
3.  Always show what MediKiosk said and what it understood.
4.  Keep the camera preview small and contextual.
5.  Never use a flatbed scanner depiction.
6.  Document scanning should run in the background where possible.
7.  "Skip for Now" skips only the document.
8.  Ask patient-friendly questions; derive clinical/AYUSH concepts.
9.  Clearly distinguish self-reported, scanned, and device-measured
    data.
10. Never imply that the kiosk is the treating clinician.
11. QR is generated by the kiosk and scanned by the doctor-side system.
12. Screen 40 is about hand positioning near the wristband dispenser.
13. Screen 41 is about collecting the dispensed wristband.
14. Screen 42 gives next instructions.
15. Screen 43 marks the session complete.
16. Screen 44 clears the session and returns to Idle.
17. Physical hardware and UI must always describe the same patient
    action.
18. The previous patient's information must never persist on the idle
    screen.

# Physical Hardware Mapping

  Hardware                       Relevant UI
  ------------------------------ ------------------------------------------
  Tablet                         Entire kiosk interface
  Front camera                   Screens 14 / 14A and persistent preview
  Microphone                     Voice interaction
  Speaker                        Spoken prompts
  Horizontal document/OCR slot   Screens 30--36
  Fingerprint sensor             Identity/authentication where configured
  BP hardware                    Screens 24--28
  SpO2/pulse hardware            Screen 29
  Weighing platform              Measurement flow where configured
  Wristband dispenser            Screens 40--41
  QR/wristband output            Visit bridge to doctor-side workflow

## Final UX Goal

The patient should feel that a friendly assistant is guiding them
through a simple conversation:

**Arrive → Identify → Consent → Tell us what is wrong → Measure → Share
documents → Prepare case → Create visit QR → Receive wristband → Wait
for doctor → Finish.**

The system should remove unnecessary form-filling and manual chart
preparation while giving the doctor a structured, traceable, concise
view of the patient's pre-consultation information.

------------------------------------------------------------------------

**MediKiosk --- Care Closer to You**
