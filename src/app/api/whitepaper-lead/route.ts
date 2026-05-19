import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
// import { promises as fs } from "fs";
// import path from "path";

interface WhitepaperLead {
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  submittedAt: string;
}

// const LEADS_FILE = path.join(process.cwd(), "whitepaper-leads.json");

// async function readLeads(): Promise<WhitepaperLead[]> {
//   try {
//     const data = await fs.readFile(LEADS_FILE, "utf-8");
//     return JSON.parse(data);
//   } catch {
//     return [];
//   }
// }

// async function writeLeads(leads: WhitepaperLead[]): Promise<void> {
//   await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, title, organization, email, phone } = body;

    // Validate required fields
    if (!name || !title || !organization || !email) {
      return NextResponse.json(
        { error: "Name, title, organization, and email are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const lead: WhitepaperLead = {
      name: name.trim(),
      title: title.trim(),
      organization: organization.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      submittedAt: new Date().toISOString(),
    };

    // --- GOOGLE SHEETS INTEGRATION ---
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
      console.error("[Whitepaper API] Missing Google Sheets environment variables.");
      return NextResponse.json(
        { error: "Google Sheets integration is not configured." },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Append to Sheet (Assumes a sheet named "Sheet1" exists)
    // Structure: [Timestamp, Name, Title, Organization, Email, Phone]
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Sheet1!A1:F1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            lead.submittedAt,
            lead.name,
            lead.title,
            lead.organization,
            lead.email,
            lead.phone,
          ],
        ],
      },
    });

    console.log(`[Whitepaper Lead] ${lead.name} saved to Google Sheets.`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving whitepaper lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
