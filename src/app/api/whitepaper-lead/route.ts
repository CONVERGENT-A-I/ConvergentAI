import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface WhitepaperLead {
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  submittedAt: string;
}

const LEADS_FILE = path.join(process.cwd(), "whitepaper-leads.json");

async function readLeads(): Promise<WhitepaperLead[]> {
  try {
    const data = await fs.readFile(LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeLeads(leads: WhitepaperLead[]): Promise<void> {
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

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

    // Append to leads file
    const leads = await readLeads();
    leads.push(lead);
    await writeLeads(leads);

    console.log(`[Whitepaper Lead] ${lead.name} — ${lead.organization} (${lead.email})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving whitepaper lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
