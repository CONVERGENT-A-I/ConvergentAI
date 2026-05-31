"use client";
import Navbar from "@/components/navbar";

const tocItems = [
  { id: "section-1", label: "WHAT INFORMATION DO WE COLLECT?" },
  { id: "section-2", label: "HOW DO WE PROCESS YOUR INFORMATION?" },
  { id: "section-3", label: "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?" },
  { id: "section-4", label: "DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?" },
  { id: "section-5", label: "HOW DO WE HANDLE YOUR SOCIAL LOGINS?" },
  { id: "section-6", label: "HOW LONG DO WE KEEP YOUR INFORMATION?" },
  { id: "section-7", label: "DO WE COLLECT INFORMATION FROM MINORS?" },
  { id: "section-8", label: "WHAT ARE YOUR PRIVACY RIGHTS?" },
  { id: "section-9", label: "CONTROLS FOR DO-NOT-TRACK FEATURES" },
  { id: "section-10", label: "DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?" },
  { id: "section-11", label: "DO WE MAKE UPDATES TO THIS NOTICE?" },
  { id: "section-12", label: "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" },
  { id: "section-13", label: "HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?" },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const prose = "text-zinc-300 leading-8 tracking-wide text-justify word-spacing-wide";
const sectionHead = "text-xl font-bold text-white mb-5 scroll-mt-32";
const subHead = "text-lg font-semibold text-white mt-8 mb-3";
const shortNote = "italic text-brand-green mb-4 text-sm";
const bullet = "list-disc pl-6 space-y-3 marker:text-brand-green";

const tableRows = [
  { cat: "A. Identifiers", ex: "Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name", col: "" },
  { cat: "B. Protected classification characteristics under state or federal law", ex: "Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data", col: "" },
  { cat: "C. Commercial information", ex: "Transaction information, purchase history, financial details, and payment information", col: "" },
  { cat: "D. Biometric information", ex: "Fingerprints and voiceprints", col: "" },
  { cat: "E. Internet or other similar network activity", ex: "Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements", col: "" },
  { cat: "F. Geolocation data", ex: "Device location", col: "" },
  { cat: "G. Audio, electronic, sensory, or similar information", ex: "Images and audio, video or call recordings created in connection with our business activities", col: "" },
  { cat: "H. Professional or employment-related information", ex: "Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us", col: "" },
  { cat: "I. Education Information", ex: "Student records and directory information", col: "" },
  { cat: "J. Inferences drawn from collected personal information", ex: "Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual's preferences and characteristics", col: "NO" },
  { cat: "K. Sensitive personal Information", ex: "", col: "NO" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-brand-green/30 selection:text-white">
      <Navbar />
      <main className="flex-1 pt-60 pb-24 w-full">
        <div className="w-full max-w-4xl mx-auto px-5 sm:px-8 md:px-12">

          {/* Header */}
          <div className="mb-14 border-b border-white/10 pb-8">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 uppercase">Privacy Notice</h1>
            <p className="text-brand-green font-medium">Last updated May 17, 2026</p>
          </div>

          {/* Intro */}
          <p className={`${prose} text-base mb-5`}>
            This Privacy Notice for ConvergentAI, Inc. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;), including when you:
          </p>
          <ul className={`${bullet} mb-6 text-zinc-300`}>
            <li>Visit our website at <a href="https://convergentai.tech" className="text-brand-green hover:underline">https://convergentai.tech</a> or any website of ours that links to this Privacy Notice</li>
            <li>Download and use our mobile application (ConvergentAI), or any other application of ours that links to this Privacy Notice</li>
            <li>Engage with us in other related ways, including any marketing or events</li>
          </ul>
          <div className="bg-white/5 border border-white/10 p-5 rounded-xl mb-10">
            <p className="text-sm text-zinc-300 leading-7">
              <strong className="text-white">Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services.
            </p>
          </div>

          {/* Summary */}
          <h2 id="summary" className="text-2xl font-bold tracking-wide mb-5 uppercase text-white border-b border-white/10 pb-2">Summary of Key Points</h2>
          <p className="italic text-zinc-400 mb-6 leading-7">
            This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our{" "}
            <button onClick={() => scrollTo("toc")} className="text-brand-green hover:underline underline-offset-4 italic cursor-pointer">table of contents</button>{" "}
            below to find the section you are looking for.
          </p>
          <ul className="space-y-3 list-none pl-0 mb-12">
            <li className="bg-white/[0.02] p-4 rounded-lg border border-white/5 text-zinc-300 text-sm leading-7">
              <strong className="text-white">What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about{" "}
              <button onClick={() => scrollTo("section-1")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">personal information you disclose to us</button>.
            </li>
            <li className="bg-white/[0.02] p-4 rounded-lg border border-white/5 text-zinc-300 text-sm leading-7">
              <strong className="text-white">Do we process any sensitive personal information?</strong> Some of the information may be considered &quot;special&quot; or &quot;sensitive&quot; in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.
            </li>
            <li className="bg-white/[0.02] p-4 rounded-lg border border-white/5 text-zinc-300 text-sm leading-7">
              <strong className="text-white">Do we collect any information from third parties?</strong> We may collect information from public databases, marketing partners, social media platforms, and other outside sources. Learn more about{" "}
              <button onClick={() => scrollTo("section-1")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">information collected from other sources</button>.
            </li>
            <li className="bg-white/[0.02] p-4 rounded-lg border border-white/5 text-zinc-300 text-sm leading-7">
              <strong className="text-white">How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. Learn more about{" "}
              <button onClick={() => scrollTo("section-2")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">how we process your information</button>.
            </li>
            <li className="bg-white/[0.02] p-4 rounded-lg border border-white/5 text-zinc-300 text-sm leading-7">
              <strong className="text-white">In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Learn more about{" "}
              <button onClick={() => scrollTo("section-3")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">when and with whom we share your personal information</button>.
            </li>
            <li className="bg-white/[0.02] p-4 rounded-lg border border-white/5 text-zinc-300 text-sm leading-7">
              <strong className="text-white">What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about{" "}
              <button onClick={() => scrollTo("section-8")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">your privacy rights</button>.
            </li>
            <li className="bg-white/[0.02] p-4 rounded-lg border border-white/5 text-zinc-300 text-sm leading-7">
              <strong className="text-white">How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a data subject access request, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.
            </li>
            <li className="bg-brand-green/10 text-brand-green p-4 rounded-lg border border-brand-green/20 text-sm font-medium">
              <strong>Want to learn more about what we do with any information we collect?</strong> Review the Privacy Notice in full below.
            </li>
          </ul>

          {/* TOC */}
          <h2 id="toc" className="text-2xl font-bold tracking-wide mb-5 uppercase text-white border-b border-white/10 pb-2 scroll-mt-32">Table of Contents</h2>
          <ol className="list-decimal pl-6 space-y-2 mb-16">
            {tocItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className="text-brand-green hover:text-white transition-colors duration-200 text-sm font-medium text-left hover:underline underline-offset-4 cursor-pointer"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ol>

          {/* Sections */}
          <div className="space-y-14">

            {/* 1 */}
            <section id="section-1" className="scroll-mt-32">
              <h3 className={sectionHead}>1. WHAT INFORMATION DO WE COLLECT?</h3>
              <h4 className={subHead}>Personal information you disclose to us</h4>
              <p className={shortNote}>In Short: We collect personal information that you provide to us.</p>
              <p className={`${prose} mb-4`}>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
              <p className={`${prose} mb-4`}><strong className="text-white">Sensitive Information.</strong> We do not process sensitive information.</p>
              <p className={prose}>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</p>
              <h4 className={subHead}>Information automatically collected</h4>
              <p className={shortNote}>In Short: Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</p>
              <p className={`${prose} mb-4`}>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.</p>
              <p className={prose}>Like many businesses, we also collect information through cookies and similar technologies.</p>
            </section>

            {/* 2 */}
            <section id="section-2" className="scroll-mt-32">
              <h3 className={sectionHead}>2. HOW DO WE PROCESS YOUR INFORMATION?</h3>
              <p className={shortNote}>In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</p>
              <p className={prose}>We process your personal information for a variety of reasons, depending on how you interact with our Services, including to provide, maintain, and improve our Services, to communicate with you, and to comply with applicable laws and regulations.</p>
            </section>

            {/* 3 */}
            <section id="section-3" className="scroll-mt-32">
              <h3 className={sectionHead}>3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h3>
              <p className={shortNote}>In Short: We may share information in specific situations described in this section and/or with the following third parties.</p>
              <p className={`${prose} mb-4`}>We may need to share your personal information in the following situations:</p>
              <ul className={`${bullet} text-zinc-300 text-sm leading-8`}>
                <li><strong className="text-white">Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                <li><strong className="text-white">Affiliates.</strong> We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Notice. Affiliates include our parent company and any subsidiaries, joint venture partners, or other companies that we control or that are under common control with us.</li>
                <li><strong className="text-white">Business Partners.</strong> We may share your information with our business partners to offer you certain products, services, or promotions.</li>
                <li><strong className="text-white">Offer Wall.</strong> Our application(s) may display a third-party hosted &quot;offer wall.&quot; A unique identifier, such as your user ID, will be shared with the offer wall provider in order to prevent fraud and properly credit your account with the relevant reward.</li>
              </ul>
            </section>

            {/* 4 */}
            <section id="section-4" className="scroll-mt-32">
              <h3 className={sectionHead}>4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h3>
              <p className={shortNote}>In Short: We may use cookies and other tracking technologies to collect and store your information.</p>
              <p className={`${prose} mb-4`}>We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</p>
              <p className={`${prose} mb-4`}>We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences).</p>
              <p className={prose}>To the extent these online tracking technologies are deemed to be a &quot;sale&quot;/&quot;sharing&quot; under applicable US state laws, you can opt out by submitting a request as described below under section{" "}
              <button onClick={() => scrollTo("section-10")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">&quot;DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?&quot;</button></p>
            </section>

            {/* 5 */}
            <section id="section-5" className="scroll-mt-32">
              <h3 className={sectionHead}>5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h3>
              <p className={shortNote}>In Short: If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.</p>
              <p className={`${prose} mb-4`}>Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or X logins). Where you choose to do this, we will receive certain profile information about you from your social media provider, including your name, email address, friends list, and profile picture, as well as other information you choose to make public.</p>
              <p className={prose}>We will use the information we receive only for the purposes that are described in this Privacy Notice. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider.</p>
            </section>

            {/* 6 */}
            <section id="section-6" className="scroll-mt-32">
              <h3 className={sectionHead}>6. HOW LONG DO WE KEEP YOUR INFORMATION?</h3>
              <p className={shortNote}>In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</p>
              <p className={`${prose} mb-4`}>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).</p>
              <p className={prose}>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.</p>
            </section>

            {/* 7 */}
            <section id="section-7" className="scroll-mt-32">
              <h3 className={sectionHead}>7. DO WE COLLECT INFORMATION FROM MINORS?</h3>
              <p className={shortNote}>In Short: We do not knowingly collect data from or market to children under 18 years of age.</p>
              <p className={prose}>We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent&apos;s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@convergentai.tech" target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">info@convergentai.tech</a>.</p>
            </section>

            {/* 8 */}
            <section id="section-8" className="scroll-mt-32">
              <h3 className={sectionHead}>8. WHAT ARE YOUR PRIVACY RIGHTS?</h3>
              <p className={shortNote}>In Short: You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</p>
              <p className={`${prose} mb-4`}><strong className="text-white">Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time by contacting us using the contact details provided in the section{" "}
              <button onClick={() => scrollTo("section-12")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">&quot;HOW CAN YOU CONTACT US ABOUT THIS NOTICE?&quot;</button>{" "}below.</p>
              <p className={`${prose} mb-4`}>However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.</p>
              <h4 className={subHead}>Account Information</h4>
              <p className={prose}>If you would at any time like to review or change the information in your account or terminate your account, you can contact us. Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.</p>
            </section>

            {/* 9 */}
            <section id="section-9" className="scroll-mt-32">
              <h3 className={sectionHead}>9. CONTROLS FOR DO-NOT-TRACK FEATURES</h3>
              <p className={`${prose} mb-4`}>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (&quot;DNT&quot;) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.</p>
              <p className={prose}>California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for recognizing or honoring DNT signals, we do not respond to them at this time.</p>
            </section>

            {/* 10 */}
            <section id="section-10" className="scroll-mt-32">
              <h3 className={sectionHead}>10. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h3>
              <p className={shortNote}>In Short: If you are a resident of the US, you may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information.</p>
              <h4 className={subHead}>Categories of Personal Information We Collect</h4>
              <p className={`${prose} mb-6`}>The table below shows the categories of personal information we have collected in the past twelve (12) months.</p>
              {/* Mobile: stacked cards | Desktop: table */}
              <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 border-b border-white/10 text-white">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider w-1/3">Category</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider">Examples</th>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center w-24">Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tableRows.map((row) => (
                      <tr key={row.cat} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white align-top">{row.cat}</td>
                        <td className="px-6 py-4 text-zinc-400 align-top leading-7">{row.ex}</td>
                        <td className={`px-6 py-4 text-center font-bold align-top ${row.col === "NO" ? "text-zinc-500" : "text-zinc-700"}`}>
                          {row.col}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile stacked cards */}
              <div className="md:hidden space-y-3">
                {tableRows.map((row) => (
                  <div key={row.cat} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="font-semibold text-white text-sm leading-snug">{row.cat}</span>
                      {row.col && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          row.col === "NO" ? "bg-zinc-800 text-zinc-400" : "bg-zinc-800 text-zinc-400"
                        }`}>{row.col}</span>
                      )}
                    </div>
                    {row.ex && <p className="text-zinc-400 text-xs leading-6">{row.ex}</p>}
                  </div>
                ))}
              </div>

              <p className={`${prose} mt-8 mb-4`}>We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:</p>
              <ul className={`${bullet} text-zinc-300 text-sm leading-7 mb-6`}>
                <li>Receiving help through our customer support channels;</li>
                <li>Participation in customer surveys or contests; and</li>
                <li>Facilitation in the delivery of our Services and to respond to your inquiries.</li>
              </ul>

              <p className={`${prose} mb-3`}><strong className="text-white">Sources of Personal Information</strong><br />Learn more about the sources of personal information we collect in{" "}
              <button onClick={() => scrollTo("section-1")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">&quot;WHAT INFORMATION DO WE COLLECT?&quot;</button></p>
              <p className={`${prose} mb-3`}><strong className="text-white">How We Use and Share Personal Information</strong><br />Learn more about how we use your personal information in the section,{" "}
              <button onClick={() => scrollTo("section-2")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">&quot;HOW DO WE PROCESS YOUR INFORMATION?&quot;</button></p>
              <p className={`${prose} mb-6`}><strong className="text-white">Will your information be shared with anyone else?</strong><br />We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Learn more about how we disclose personal information to in the section,{" "}
              <button onClick={() => scrollTo("section-3")} className="text-brand-green hover:underline underline-offset-4 cursor-pointer">&quot;WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?&quot;</button></p>

              <h4 className={subHead}>Your Rights</h4>
              <p className={`${prose} mb-4`}>You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:</p>
              <ul className={`${bullet} text-zinc-300 text-sm leading-7 mb-6`}>
                <li>Right to know whether or not we are processing your personal data</li>
                <li>Right to access your personal data</li>
                <li>Right to correct inaccuracies in your personal data</li>
                <li>Right to request the deletion of your personal data</li>
                <li>Right to obtain a copy of the personal data you previously shared with us</li>
                <li>Right to non-discrimination for exercising your rights</li>
                <li>Right to opt out of the processing of your personal data if it is used for targeted advertising, the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects</li>
              </ul>

              <h4 className={subHead}>How to Exercise Your Rights</h4>
              <p className={`${prose} mb-4`}>
                To exercise these rights, you can contact us by submitting a{" "}
                <a
                  href="https://app.termly.io/dsar/1acd48eb-09ac-4991-bd12-43b98d86a2d7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-green hover:underline underline-offset-4"
                >
                  data subject access request
                </a>
                , by emailing us at{" "}
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=info@convergentai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-green hover:underline underline-offset-4"
                >
                  info@convergentai.tech
                </a>
                , or by referring to the contact details at the bottom of this document.
              </p>
              <p className={prose}>Under certain US state data protection laws, you can designate an authorized agent to make a request on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with applicable laws.</p>
            </section>

            {/* 11 */}
            <section id="section-11" className="scroll-mt-32">
              <h3 className={sectionHead}>11. DO WE MAKE UPDATES TO THIS NOTICE?</h3>
              <p className={shortNote}>In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.</p>
              <p className={prose}>We may update this Privacy Notice from time to time. The updated version will be indicated by an updated &quot;Revised&quot; date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</p>
            </section>

            {/* 12 */}
            <section id="section-12" className="scroll-mt-32">
              <h3 className={sectionHead}>12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h3>
              <p className={`${prose} mb-6`}>If you have questions or comments about this notice, you may contact us by post at:</p>
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl inline-block">
                <p className="font-semibold text-white mb-1">ConvergentAI, Inc.</p>
                <p className="text-zinc-300 text-sm">2209 Chamberlain Ave., Unit B</p>
                <p className="text-zinc-300 text-sm">Chattanooga, TN 37404</p>
                <p className="text-zinc-300 text-sm">United States</p>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=info@convergentai.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-green text-sm hover:underline mt-2 block"
                >
                  info@convergentai.tech
                </a>
              </div>
            </section>

            {/* 13 */}
            <section id="section-13" className="scroll-mt-32">
              <h3 className={sectionHead}>13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h3>
              <p className={prose}>
                Based on the applicable laws of your country or state of residence in the US, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a{" "}
                <a
                  href="https://app.termly.io/dsar/1acd48eb-09ac-4991-bd12-43b98d86a2d7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-green hover:underline underline-offset-4"
                >
                  data subject access request
                </a>
                .
              </p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
