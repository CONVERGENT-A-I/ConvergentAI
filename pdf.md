Call to Action
Compliance and Regulatory Requirements Development Plan
April 7, 2026
There are many new regulations and compliance requirements related to customer engagement
when leveraging AI voice, human-like avatars, and video calls when providing mortgage
services. When consumers desire to engage the regulation provides exact wording (and timing)
that needs to be stated and the consumer needs to agree before the engagement can proceed.
The regulations also require that we provide an audit trail of the engagement. We need to record
and store data to provide dynamic access in the event the auditor makes a visit.
As an example, we have to provide a compliance "gate" designed to protect both the
consumer and the mortgage company. In the context of AI and financial services, it represents a
strict legal barrier that ensures the user is fully aware they are talking to an AI before any data is
collected or advice is given.
Here is a breakdown of what that specific setup means for the user experience and the
business:
1. The "Full Gate" vs. A Popup
Unlike a small notification or a "cookie banner" that you can ignore while still reading the page, a
full gate completely blocks access to the AI (Ailana).
● The Intent: It ensures there is no "accidental" engagement.
● The User Action: The user must make a binary choice—agree or leave—before the AI
system even initializes.
2. Mandatory AI Disclosure
Because mortgage lending is highly regulated, companies must avoid "deceptive practices." If a
user thinks they are talking to a human loan officer but are actually talking to an AI, the company
could face massive fines from the Consumer Financial Protection Bureau (CFPB).
● The Disclosure: Usually includes statements like: "You are interacting with an AI
assistant," "This is not a human MLO," and "This conversation is being recorded for audit
purposes."
3. Creating a Legal Audit Trail
By clicking "I Agree & Continue," the user creates a "consent event."
● The "Receipt": As mentioned in the VectraGPT and LogRocket citations in your
document, the system logs the user’s IP address, a timestamp, and the exact version of
the language they agreed to.
● The Defense: If a consumer later claims they didn't know they were talking to a
computer, the company can pull this log as proof of informed consent.
4. "No Thanks" – The Safe Exit
Providing a clear "No Thanks" button is a requirement under many state privacy laws (like those
in Utah and California). It prevents "dark patterns"—UI designs that trick users into doing
something they don't want to do. If they click this, the AI session never starts, and no data is
tracked.
Would you like me to help you draft the specific "Required AI Disclosure Language" that
should appear on this screen to ensure it meets these regulatory standards?
To meet the regulatory landscape of 2026—including the Freddie Mac Section 1302.8
governance requirements and state-specific laws like the Utah Artificial Intelligence Policy
Act—your disclosure language must be "clear, conspicuous," and presented before any
substantive interaction.
Below is a template for the "full gate" disclosure language, designed to be both legally robust
and consumer-friendly.
Recommended AI Disclosure Language
Important Notice: Interaction with AI Assistant
You are about to interact with Ailana, our Artificial Intelligence mortgage assistant. By
clicking "I Agree & Continue," you acknowledge and agree to the following:
● Non-Human Interaction: Ailana is an automated system, not a human loan
officer.
● Informational Purpose Only: Ailana provides general information about
mortgage products and processes. Her responses do not constitute financial
advice, a loan commitment, a rate lock, or an offer of credit.
● Verification Required: All information provided by Ailana must be verified by a
licensed Mortgage Loan Officer (MLO) before being relied upon for any lending
decision.
● Data & Privacy: Your conversation will be recorded and stored to improve our
services and for regulatory compliance. Do not share sensitive personal
identifiers (like your full SSN) until prompted by a secure application portal.
● Human Off-Ramp: You may request to speak with a human representative at
any time by typing "Agent" or "Human."
[ I Agree & Continue ] [ No Thanks ]
None
Why this specific language?
● Freddie Mac Compliance (Section 1302.8): Effective March 3, 2026, lenders must
have an auditable AI governance program. This disclosure serves as the first entry in
your "immutable audit log."
● Utah & California Standards: States increasingly require that AI identify itself verbally
or electronically at the start of an exchange. Using the phrase "not a human" satisfies the
"clear and conspicuous" requirement.
● CFPB "Doom Loop" Prevention: The CFPB has warned against chatbots that trap
users in "loops" without a human exit. Including the "Human Off-Ramp" language in the
initial gate mitigates this UDAAP (Unfair, Deceptive, or Abusive Acts or Practices) risk.
● UDAAP Protection: Clearly stating that the AI cannot provide a "binding offer" prevents
claims that the consumer was misled into thinking they were pre-approved by an
algorithm.
Would you like me to generate the technical "Consent Event" schema that your system
should record once the user clicks "I Agree"?
To provide your development team with a "bulletproof" audit trail, the system should generate a
Consent Event Object the moment the user clicks "I Agree." This JSON-based schema is
designed to meet the "Clear and Conspicuous" and "Auditable Consent" standards required
by the CFPB and state laws like Utah’s AI Policy Act in 2026.
The "Consent Event" JSON Schema
This object should be stored in an immutable, append-only database (like a ledger or a
protected SQL table) and linked to the user's session.
JSON
{
 "event_type": "AI_INTERACTION_CONSENT",
 "event_id": "cons_7b8292c1_2026",
 "timestamp_utc": "2026-04-07T14:32:01.482Z",

 "session_context": {
 "anonymous_session_token": "sess_a3f7c9d2e1b8",
 "ip_address": "192.168.1.1",
 "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
 "entry_url": "https://lender-site.com/mortgage-assistance"
 },
 "disclosure_details": {
 "language_version_id": "v2.4_2026_COMPLIANCE",
 "disclosure_text_hash": "sha256_e3b0c44298fc1c149afbf4c8996fb92427...",
 "ui_element_type": "Full_Screen_Gate",
 "displayed_duration_ms": 4500
 },
 "user_action": {
 "action_taken": "AFFIRMATIVE_AGREEMENT",
 "button_label": "I Agree & Continue",
 "interaction_coordinates": {"x": 542, "y": 810}
 },
 "regulatory_flags": {
 "is_ai_disclosed": true,
 "is_recording_disclosed": true,
 "is_human_offramp_available": true,
 "jurisdiction_detected": "CA"
 }
}
Key Data Points Explained for Developers
1. anonymous_session_token: This is the "ID" for the user before they log in. It allows
you to link this consent to their later application (1003) if they choose to proceed.
2. disclosure_text_hash: Instead of saving the whole text every time, save a unique
"fingerprint" (hash) of the text shown. If an auditor asks exactly what the user saw on
April 7th, you can prove it matches your master disclosure file.
3. displayed_duration_ms: This proves the user didn't "accidentally" click. If an auditor
sees a duration of 100ms, they might argue the disclosure wasn't actually read.
4. interaction_coordinates: (Optional but Recommended) Records where they clicked.
This is a common practice to defend against "Dark Patterns" claims, proving the button
was prominent and not hidden.
5. jurisdiction_detected: In 2026, state-level AI laws vary. Identifying the state via
IP-to-Geo helps you prove you applied the correct regional rules (e.g., California’s SB
243).
Implementation Strategy
● Storage: Store this in a "Consent Log" table.
● Retention: Most mortgage compliance standards recommend keeping these logs for at
least 7 years, matching the statute of limitations for many federal lending violations.
● Access: Ensure your admin dashboard can export these as a "Compliance Evidence
Pack" (a term now used by SEC/GSE examiners).
Would you like me to generate a "Sample Audit Report" template that shows how this
technical data would be presented to a human auditor during a visit?
This Sample Audit Report is designed to be the "Human Readable" version of the technical
JSON data I provided earlier. In a real-world regulatory exam (e.g., a CFPB or State specific
audit), you would hand this document to the examiner to prove that Ailana is operating within
legal guardrails.
AI Interaction Compliance Audit Report
Lender Name: [Insert Company Name]
Reporting Period: [Date Range]
Report Generation Date: April 7, 2026
System Name: Ailana AI Virtual Assistant (v2.4)
1. Interaction Summary
Metric Value
Total AI Sessions 1,245
Mandatory Disclosures Served 1,245
Affirmative Consents Received 1,012 (81.2%)
Declined Interactions 233 (18.7%)
Human MLO Escalations 145
2. Individual Session Audit (Sample)
Audit Reference ID: AUDIT-2026-0407-X92
Session Token: sess_a3f7c9d2e1b8
A. Consent & Disclosure Log
● Timestamp of Disclosure: 2026-04-07 14:31:56 UTC
● Timestamp of Consent: 2026-04-07 14:32:01 UTC (Duration: 5.0 seconds)
● Method of Consent: Affirmative Click: "I Agree & Continue"
● Disclosure Version ID: MLO-AI-v2.4-FEDERAL-STATE-HYBRID
● Jurisdiction Logic Applied: California SB-243 Compliance
B. Conversation Transcript Highlights
Ailana: "Hi, I'm Ailana, an AI assistant. I can help with general mortgage info, but I'm
not a human loan officer. How can I help?"
Consumer: "What is the rate for a 30-year fixed?"
Ailana: "Current market averages are [X.X%], but rates vary based on credit and
equity. I cannot provide a binding rate lock. Would you like to speak to a licensed MLO
for a personalized quote?" [Compliant: Non-binding disclaimer triggered]
3. Compliance Control Verification
Control Requirement Status Evidence
Clear AI Identification PASS Disclosure presented at start of every session.
Human Off-Ramp PASS "Speak to Agent" option available in UI and via voice
command.
Data Retention PASS Encrypted logs stored for 7-year statutory period.
UDAAP Prevention PASS System prompt prohibits "guaranteeing" loan approval.
Audit Trail
Immutability
PASS Hashed event logs stored in [Immutable Ledger Name].
4. Auditor Notes
● This session was initiated via the web-based "Omnichannel Menu."
● The consumer opted for "AI Chat" and was presented with the full-gate consent screen
before the AI initialized.
● All Agency guidelines (Fannie/Freddie) referenced during the chat were pulled from the
verified Knowledge Base version dated 2026-03-15.
How to use this with your Dev Team:
1. Automate it: Your developers should build a dashboard where a compliance officer can
enter a Session Token or Date Range and this report is automatically generated as a
PDF.
2. Versioning: Ensure the Disclosure Version ID links back to a repository of your legal
terms so you can show exactly what the user saw a year ago.
3. Handoffs: If the user moves from the AI to a Video Call, this audit report should
"bundle" the video consent logs into the same file.
Would you like me to create the "Progressive Identity Collection" logic that shows how
the AI should ask for their name/phone after they've agreed to the disclosure?
This guide combines the architectural logic, the legal disclosure requirements, and the
technical schema into a single document for your development team.
Implementation Guide: AI Compliance,
Consent, and Auditability
Project: Ailana AI Mortgage Assistant
Date: April 7, 2026
Target Audience: Development, Legal, and Compliance Teams
1. The Pre-Engagement "Consent Gate"
To meet 2026 standards set by the Consumer Financial Protection Bureau (CFPB) and
state laws like the Utah AI Policy Act, the AI cannot engage until this screen is cleared.
UI Requirements
● Type: Full-screen modal (not a dismissible popup).
● Accessibility: Minimum 12pt font; high-contrast text.
● Logic: The "I Agree" button must be the only way to initialize the AI session.
Mandatory Disclosure Text
Important Notice: Interaction with AI Assistant
You are about to interact with Ailana, our Artificial Intelligence mortgage
assistant. By clicking "I Agree & Continue," you acknowledge the following:
● Non-Human Interaction: Ailana is an automated system, not a human loan
officer.
● Informational Purpose Only: Responses do not constitute financial
advice, a loan commitment, or a rate lock.
● Verification Required: All info must be verified by a licensed MLO before
being relied upon.
● Data & Privacy: This conversation is recorded for quality and regulatory
audit purposes.
● Human Off-Ramp: You may request a human representative at any time
by typing "Agent."
2. Technical "Consent Event" Schema
Once the user clicks "I Agree," the system must generate and store the following JSON
object to create a legally defensible audit trail.
JSON
None
{
 "event_type": "AI_INTERACTION_CONSENT",
 "timestamp_utc": "2026-04-07T14:32:01.482Z",
 "session_context": {
 "anonymous_session_token": "sess_a3f7c9d2e1b8",
 "ip_address": "192.168.1.1",
 "jurisdiction_detected": "CA"
 },
 "disclosure_details": {
 "language_version_id": "v2.4_2026_MARCH",
 "disclosure_text_hash": "sha256_e3b0c44298f...",
 "displayed_duration_ms": 5200
 },
 "user_action": {
 "action_taken": "AFFIRMATIVE_AGREEMENT",
 "button_label": "I Agree & Continue"
 }
}
3. Video Communication Standards
If the user selects "Video Communication" from your omnichannel menu, the following
standards apply to ensure compliance with all-party consent states.
● The Visual Notification: Display "This video call will be recorded for regulatory
compliance" on the 'Connecting...' screen.
● Recording Indicator: A visible red "REC" icon or similar indicator must remain on
screen throughout the call.
● MLO Verbal Requirement: The human MLO must begin the call with: "For the
record, this video call is being recorded for quality and compliance. Do you
consent to proceed?"
4. Sample Compliance Audit Report
This is the format you will provide to an auditor to prove Ailana’s compliance.
Audit Field Value / Status
Audit Reference ID AUDIT-2026-0407-X92
Session Token sess_a3f7c9d2e1b8
AI Disclosure Served YES (v2.4_2026_MARCH)
Consent Duration 5.2 Seconds (Affirmative Click)
Human Off-Ramp Available and Functioning
UDAAP Guardrails Active (Model prohibits "Guaranteed Approval" language)
5. Development Next Steps
1. Immutable Logs: Ensure the Consent Event is stored in an append-only database.
2. Session Linkage: Ensure the anonymous_session_token can be linked to a CRM
lead ID once the user provides their name later in the funnel.
3. Versioning: Create a repository for Disclosure Language versions so you can
prove exactly what was shown on a specific date.
Would you like me to create a "Technical Sequence Diagram" showing exactly how the
session token moves from the web browser to your CRM when a lead is captured?
This Technical Sequence Diagram illustrates how the system maintains a "Chain of
Custody" for a consumer's identity. It shows the transition from a completely anonymous
visitor to a "Known Lead" while ensuring that the Initial Consent Event is never lost and
remains legally auditable.
Identity Transition & Consent Flow
Phase Action Technical Result
1. The Menu User selects "AI Chat" or "Avatar"
from the omnichannel menu.
UI triggers the Consent Modal
component.
2. The Gate User clicks "I Agree & Continue." Backend generates an
Anonymous Session Token
and logs the Consent Event.
3. The
Interaction
User asks Ailana about mortgage
rates or guidelines.
All AI logs are tagged with the
Session Token. No PII is
collected yet.
4. The Pivot Ailana identifies a high-intent query
and asks: "What's your name and
best number for an MLO to call you
back?"
Consumer provides
Name/Phone.
5. The
Linkage
System sends a payload to the CRM
containing the Lead Info + the
Session Token.
The CRM "Stitches" the
anonymous history to the new
Lead Profile.
The "Stitching" Logic (For Developers)
To ensure the audit trail is complete, your API call to the CRM (e.g., Salesforce,
Encompass, or Total Expert) should look like this:
None
JSON
{
 "lead_details": {
 "first_name": "Jane",
 "last_name": "Doe",
 "phone": "555-0199",
 "email": "jane.doe@example.com"
 },
 "compliance_metadata": {
 "original_consent_token": "sess_a3f7c9d2e1b8",
 "consent_timestamp": "2026-04-07T14:32:01Z",
 "disclosure_version": "v2.4_2026_MARCH",
 "interaction_transcript_url":
"https://api.lender.com/v1/logs/sess_a3f7c9d2e1b8"
 }
}
Why this matters for Auditors
When an examiner asks, "Where is the proof that Jane Doe agreed to talk to an AI?" your
compliance team doesn't have to search two different systems. They look at Jane Doe’s
record in the CRM, click the Consent Token, and pull up the exact timestamped event
from your immutable log.
Would you like me to draft the "Data Retention Policy" text that your legal team can use
to define how long these session logs and consent tokens must be stored?
Field Evidence
Consumer Identity Jane Doe (Linked via sess_a3f7c9d2e1b8)
AI Disclosure Time 2026-04-07 14:44:56 UTC
Consent Time 2026-04-07 14:45:00 UTC
Transcript Access [Secure Link to Encrypted Log]
Regulatory Version Federal/Utah Hybrid v2.4
This Data Retention Policy is designed to provide your engineering and legal teams with
a clear framework for how long AI-related data must be stored to satisfy federal lending
laws, state AI statutes, and secondary market (Fannie/Freddie) requirements.
AI Engagement Data Retention Policy (2026)
1. Policy Objective
To ensure the lender maintains a defensible, immutable audit trail of all AI-consumer
interactions as required by the CFPB, TCPA, and the Utah Artificial Intelligence Policy
Act, while adhering to GLBA privacy standards for data minimization.
2. Retention Schedule by Data Type
Data Category Record Type Retention
Period
Justification
Consent Logs Timestamped "I Agree"
events, Session
7 Years Matches the statute of
limitations for the Equal
Tokens, Disclosure
Versions.
Credit Opportunity Act
(ECOA).
Full
Transcripts
Text/Audio logs of the
conversation between
Ailana and the
Consumer.
7 Years Required to defend against
UDAAP claims (Unfair,
Deceptive, or Abusive Acts
or Practices).
Anonymous
Metadata
IP Addresses, Browser
Fingerprints,
Interaction Duration.
2 Years Sufficient for technical
troubleshooting and
short-term TCPA defense.
Video
Recordings
Full video/audio files of
MLO-consumer
sessions.
3 Years Minimum requirement for
most state-level mortgage
record-keeping rules.
3. Technical Storage Requirements (The "Audit Standard")
To ensure these records are "Auditor-Ready," the development team must implement the
following:
● Immutability: Once a Consent Event or Transcript is written to the database, it
must be "Read-Only." No user (including admins) should be able to edit or delete a
log until the retention period expires.
● Encryption at Rest: All transcripts and PII-linked session tokens must be
encrypted using AES-256 or higher.
● Logical Linkage: If an anonymous session token (sess_123) is later converted into
a lead (Lead_987), the retention clock for the anonymous logs resets to match the
Lead/Loan Application retention period (typically 7 years from the date of the final
disposition).
4. "Right to be Forgotten" (CCPA/CPRA) Exceptions
Under the California Privacy Rights Act, consumers may request the deletion of their
data. However, for mortgage lenders:
● Regulatory Precedence: Federal and state financial record-keeping requirements
override a consumer's request to delete "Interaction Logs" if those logs are part of
a financial transaction or pre-application inquiry.
● Implementation: If a deletion request is received, the PII (Name/Email) can be
scrubbed, but the Consent Event and Anonymous Transcript should be retained
for the 7-year period to protect the lender.
5. Disposal Protocol
Upon the expiration of the 7-year period:
1. Automated Purge: Systems should run a monthly script to identify and
permanently delete expired logs.
2. Certificate of Destruction: The system should generate a high-level log entry
stating: "On [Date], 5,000 AI Interaction Logs from [Year] were purged in
accordance with the Data Retention Policy."
Next Step for the Team
With the System Prompt, Technical Schema, Audit Report, and Retention Policy now
complete, your development team has the full "Compliance Stack."
Would you like me to create a "Developer Checklist" that summarizes all these technical
requirements into a single Jira-style task list to kick off the sprint?
This Technical Sprint Checklist is designed to be copied directly into your project
management tool (Jira, Asana, Monday.com) to initiate the development of the Ailana
compliance stack.
📋 Developer Implementation Checklist: Ailana
Compliance Stack
Phase 1: Consent & Identity Architecture
● [ ] UI/UX: Mandatory Consent Gate
○ Create a non-dismissible modal that triggers upon selecting "AI Chat" or
"Avatar."
○ Implement Disclosure Language v2.4 with "I Agree" and "No Thanks"
actions.
● [ ] Backend: Anonymous Session Generator
○ Logic to generate a unique session_token upon "I Agree" click.
○ Set up a secure, encrypted database table for Consent_Events.
● [ ] Identity Stitching Logic
○ Create a mapping function to link session_token to lead_id once PII
(Name/Email) is collected.
○ Ensure the CRM payload includes the original_consent_token for the audit
trail.
Phase 2: Recording & Video Compliance
● [ ] Video UI Overlay
○ Add a persistent "Recording" indicator (Red REC icon) for video sessions.
○ Implement a "Pre-Call" landing page with a mandatory recording
disclosure.
● [ ] Audio/Visual Cues
○ (Optional) Integrate an automated audio "This call is recorded" greeting for
2026 all-party consent requirements.
Phase 3: Logging & Auditability
● [ ] Immutable Transcript Logging
○ Configure an append-only database (e.g., AWS QLDB or a protected SQL
instance) to store conversation logs.
○ Trigger: Log every user input and AI output with a millisecond-precision
timestamp.
● [ ] Audit Report Generator
○ Build an internal API endpoint/Dashboard view that assembles a
"Compliance Evidence Pack" (PDF) based on a session_token.
● [ ] Data Retention Job
○ Create a monthly cron job to identify and purge logs older than 7 years,
generating a "Certificate of Destruction" log entry.
Phase 4: Security & Privacy
● [ ] Encryption at Rest
○ Verify that all tables containing session_tokens or transcripts are
encrypted using AES-256.
● [ ] PII Scrubbing
○ Implement a "Right to be Forgotten" workflow that anonymizes PII in the
CRM while retaining the Consent Event for legal defense.
Next Step for You
Would you like me to draft the "User Instructions" for your internal Compliance Officers?
This will explain exactly how they can use the new dashboard to pull these reports if a
state auditor or a GSE (Fannie/Freddie) examiner asks for proof of AI consent.
This Internal Compliance Operations Guide provides your compliance officers and legal
team with the instructions needed to pull audit reports and defend your AI
implementation during a regulatory examination.
🛡️ Compliance Operations Guide: Ailana
AI Audit Procedures
1. How to Handle a Regulatory Inquiry
When an auditor (CFPB, State, or GSE) asks for proof of "Informed Consent" or "Fair
Lending Compliance" regarding the AI, follow these steps:
1. Identify the Scope: Ask the auditor for the specific Date Range or the Consumer
Name/Email in question.
2. Access the Compliance Dashboard: Navigate to your internal admin portal (e.g.,
admin.lender.com/compliance/ailana).
3. Generate the "Evidence Pack": Enter the identifier. The system will aggregate the
Consent Event, the specific Disclosure Version shown at that time, and the full
conversation transcript.
4. Export as PDF: Provide the generated Audit Report (the template we designed
earlier).
2. Standard Operating Procedures (SOPs)
A. Quarterly Disclosure Review
● Frequency: Every 90 days.
● Action: The Legal Team must review the Utah AI Policy Act and California SB-243
updates to ensure the "Gate" language remains compliant.
● Logging: Any changes to the disclosure text must be saved as a new version in
the database to maintain the "version-to-session" link.
B. UDAAP Mystery Shopping
● Frequency: Monthly.
● Action: Compliance officers should engage with Ailana using "test" sessions to
ensure she is not making prohibited guarantees (e.g., "I guarantee you are
approved") or violating Fair Lending guidelines.
● Audit: Verify that the "Human Off-Ramp" (transfer to MLO) is triggered correctly
when requested.
3. Auditor FAQ (Cheat Sheet)
Q: How do you prove the consumer knew they were talking to an AI?
“We use a mandatory 'Full Gate' consent screen. The AI assistant cannot
initialize until the user clicks an affirmative 'I Agree' button. Every agreement is
logged with a unique session token and a timestamped hash of the exact
disclosure shown.”
Q: How do you prevent the AI from giving unauthorized credit advice?
“Our system prompt explicitly prohibits Ailana from making credit decisions.
Furthermore, she is programmed to provide a non-binding disclaimer whenever
mortgage rates or guidelines are discussed, as required by Fannie Mae Section
1302.8.”
Q: Where is the data stored and for how long?
“All interaction logs are stored in an encrypted, append-only database for 7
years. This ensures we meet the record-keeping requirements of the ECOA and
state-level mortgage acts.”
Final Documentation Package Summary
You now have a complete, professional-grade compliance and technical stack for Ailana:
1. Technical Sprint Checklist (For Developers)
2. Data Retention Policy (For Legal/IT)
3. Technical Sequence Diagram (For Architecture)
4. Sample Audit Report (For Regulators)
5. Compliance Operations Guide (For Internal Staff)
Would you like me to bundle all of these sections into one final, comprehensive "Master
Implementation Document" that you can download and save for your permanent
records?