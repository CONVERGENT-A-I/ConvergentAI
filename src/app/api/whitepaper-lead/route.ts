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
    const GOOGLE_CLIENT_EMAIL = "convergentaiserviceaccount@convergentai-496607.iam.gserviceaccount.com";
    const GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDL2gz4SBuSbo42\nEKDZUtqqKhEjvoYciIhnpWl7fCKUNLj0WGi0rHMbfEcS3aGd+bNz/R1YEkx6Buqw\nXo26v22NOOeeZC/0aXSga/yyM2WvOQoISV5TK26Qa7LMWWpTZDxNVbhIK84RmL+u\nyOsBCaaEB/lglNGrvew5gYWwzCslX4JP9wCiXIakSGBK+FrYVv0TqeGNhRJWIuqf\n/VX3BrW+hanx9st+NfjjPAv+vzXjxO9MtAak+uRWbGdGahbTgEsKcajo/Ka6/FIU\nkPBNOSoZL8pchifuINKhYS7/SEsTSN5Fk/O/mEDpyYPbGEKaf27lm/CZ+mtYXWti\njrRNXQILAgMBAAECggEAQIzhG4O122YPuTYFwRt363dbqw5rKEDhtLRP1Q7nYjfZ\ns2IFceTDpFnzpZkx0rTdquZlMtzEg8WJ7mRai96PIa95xJGkD8iO6jeXspQM6HHu\n59XXvQ1dOvUnjobn4NU2NSTmMFBStgbA9+deZxs3s8pUoM0vIauH0GPfwi68oN3v\nVdepEP8dLHXe7/ja01XClE+wHSmxh91GoqK/UvrVemO44t/4hqpGk6EVIp3S+daS\nLkKc5oFmrNNlGyiZOU/VbIXzxwlf+Si9aXNr2YgY3HRvW0w486hCDDnhjNVSjnN4\ns8WZQ7Y0bn+WIB8NInOjEov7k6ezOjZCwGUviPDrCQKBgQDm+4KipFAwlweAaVql\noTMz/Jsp0KBjwH2wGQ8mzqPxxkixqjcPbXmrZ3ZCz/u2+QL/Xh4WaFy5ArHKB37p\n0syyX/Ewu7aErmq3K7DMB4QUfmRIGbluxl125mM6eLu0mYhZEFq7AsGyPFSnvySZ\n6ZQmaJXp45uj499sOECc7Ao0swKBgQDh7khnPHWSP/cxlWuEB6uauyPB6R6m556f\nbeorXJbXhO6wcPCvPyn9fJD5B/F1Qx/8UbtIhFW370I3kRdreQALgi1rswLnBYW5\njLKn2OGLToGejOTi2h5dFmuOUGvFA/NK+TSxpM7oRs8+Pp0G9jM5wdBVNb83V6hA\n8b7yY7eZSQKBgFq6A8/6lnzfddTcjPxt2vzahd/g0H8eBsB6t1bY59B5v+f5IfNv\nXtESrIMFyqtOF/1SbKMEjxcklczzMMiLQlf2E3i+4qwvDj+wa5tYgGrEUoN3hzyZ\nsfCYAfXfomsHu2SwZdL6/DYUOHRDQg8qjkSf4/KgsmungASz+70ngcK9AoGBAM66\nmReVk8MJsqd1IJcD6brAZ/yj0b9JCrS4/19D7mYwJbPe8+x28HYYyBKGeSMiE59u\nLd8x77lJPR7ZLUPSyP6+087LUumO/QiGPGcnJWGxqRspsrn8eXIV9L6YybPRZIoC\ns3uk4Qpa2IENC+P13XOI65c8gcYi+DrMuTrTkYi5AoGBAMhlNMWzHq2zHrtURvv/\nzGWCyh4QyD7MlywOKAvV/rYcn324Nnw8df0b4bYap3M8EXWt7RCKgUU0je9avnLC\nnz2Rw3U2YDVwRbJQJshsbQTUW20509807gSBjnzBngpyuFIh84ZQlN7jlZLlkdFJ\naru5EAVT/ogk90CiJ6Ndb0k+\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n');
    const GOOGLE_SHEET_ID = "16aCKFL9rp7u_NE6eASG2-wLYJ4RsWjjm-a0iciO-880";

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
