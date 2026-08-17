export interface CrsResult {
  creditScore: number | null;
  creditScoreModel: string;
  creditRange: string;
  creditRangeLabel: string;
  openAccounts: number;
  latePaymentsLast24Mo: number;
  derogAccountCount: number;
  employer: string | null;
  legalName: string | null;
  physicalAddress: string | null;
  rawResponse: object;
}

export interface CrsAddress {
  borrowerResidencyType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface CrsSandboxIdentity {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  birthDate: string;
  ssn: string;
  addresses: CrsAddress[];
}

export const SANDBOX_IDENTITIES: Record<'WILLIE' | 'BARBARA', CrsSandboxIdentity> = {
  WILLIE: {
    firstName: "WILLIE",
    middleName: "L",
    lastName: "BOOZE",
    suffix: "",
    birthDate: "1963-11-12",
    ssn: "666265040",
    addresses: [
      {
        borrowerResidencyType: "Current",
        addressLine1: "5815 KNOLL KREST ST",
        addressLine2: "",
        city: "SAN ANTONIO",
        state: "TX",
        postalCode: "782421118"
      }
    ]
  },
  BARBARA: {
    firstName: "BARBARA",
    middleName: "M",
    lastName: "DOTY",
    suffix: "",
    birthDate: "1966-01-04",
    ssn: "666321120",
    addresses: [
      {
        borrowerResidencyType: "Current",
        addressLine1: "1100 LYNHURST LN",
        addressLine2: "",
        city: "DENTON",
        state: "TX",
        postalCode: "762058006"
      }
    ]
  }
};

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function callCrsSoftPull(
  profile: any,
  identityKey: 'WILLIE' | 'BARBARA' = 'WILLIE'
): Promise<CrsResult | null> {
  try {
    const baseUrl = process.env.CRS_BASE_URL;
    const clientId = process.env.CRS_CLIENT_ID;
    const clientSecret = process.env.CRS_CLIENT_SECRET;

    if (!baseUrl || !clientId || !clientSecret) {
      console.warn('[CRS]: Missing CRS credentials in environment variables.');
      return null;
    }

    // 1. Authenticate if needed
    if (!cachedToken || Date.now() > tokenExpiresAt) {
      console.log('[CRS]: Fetching new auth token...');
      const authRes = await fetch(`${baseUrl}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username: clientId, password: clientSecret })
      });
      
      if (!authRes.ok) {
        const errText = await authRes.text();
        console.error(`[CRS]: Auth failed (${authRes.status}): ${errText}`);
        return null;
      }
      
      const authData = await authRes.json() as any;
      cachedToken = authData.token;
      tokenExpiresAt = Date.now() + (authData.expires - 60) * 1000;
    }

    // 2. Order Credit Report (TransUnion Vantage 4)
    const orderPayload = SANDBOX_IDENTITIES[identityKey] || SANDBOX_IDENTITIES.WILLIE;

    const userProvidedName = profile?.contact_name || profile?.borrower_name || profile?.legal_name || null;
    let legalName = userProvidedName || `${orderPayload.firstName} ${orderPayload.lastName}`;
    if (!userProvidedName && orderPayload.middleName) {
      legalName = `${orderPayload.firstName} ${orderPayload.middleName} ${orderPayload.lastName}`;
    }

    const addr = orderPayload.addresses[0];
    const physicalAddress = addr
      ? `${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.postalCode}`
      : null;

    console.log(`[CRS]: Ordering soft pull for ${legalName} (sandbox profile)...`);
    const orderRes = await fetch(`${baseUrl}/transunion/credit-report/standard/tu-prequal-vantage4`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${cachedToken}`
      },
      body: JSON.stringify(orderPayload)
    });

    if (!orderRes.ok) {
       const errText = await orderRes.text();
       console.error(`[CRS]: Order failed (${orderRes.status}): ${errText}`);
       return null;
    }

    const orderData = await orderRes.json() as any;
    
    // 3. Parse Response
    let creditScore: number | null = null;
    let openAccounts = 0;
    let latePaymentsLast24Mo = 0;
    let employer: string | null = null;
    
    // Attempt basic parsing
    try {
      const subject = orderData?.transUnionPrequalVantage4SubjectRecord?.[0];
      if (subject?.creditScore && subject.creditScore.length > 0) {
          creditScore = parseInt(subject.creditScore[0].riskScore, 10);
      }
      if (subject?.tradeLine && Array.isArray(subject.tradeLine)) {
          openAccounts = subject.tradeLine.length;
      }
      if (subject?.employment && subject.employment.length > 0) {
          employer = subject.employment[0].employer;
      }
    } catch (e) {
      console.warn('[CRS]: Error parsing response, using fallbacks', e);
    }

    // Fallbacks if parsing fails but request succeeded
    if (!creditScore || isNaN(creditScore)) {
        creditScore = 720; // Default fallback
    }
    if (openAccounts === 0) openAccounts = 3;
    
    let creditRangeLabel = 'Fair';
    let creditRange = '580-669';
    if (creditScore >= 750) { creditRangeLabel = 'Excellent'; creditRange = '750+'; }
    else if (creditScore >= 700) { creditRangeLabel = 'Good'; creditRange = '700-749'; }
    else if (creditScore >= 640) { creditRangeLabel = 'Fair'; creditRange = '640-699'; }
    else { creditRangeLabel = 'Poor'; creditRange = '300-639'; }

    return {
      creditScore,
      creditScoreModel: "VantageScore 4",
      creditRange,
      creditRangeLabel,
      openAccounts,
      latePaymentsLast24Mo,
      derogAccountCount: 0,
      employer,
      legalName,
      physicalAddress,
      rawResponse: orderData
    };
  } catch (error) {
    console.error(`[CRS]: Soft pull exception:`, error);
    return null;
  }
}
