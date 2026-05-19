/**
 * Legal Content Seed Data — All 14 Terms of Service Clauses
 * Sections 05, 06, and 07 contain explicit non-liability clauses that establish
 * AniXo as a link-indexing aggregator with no server-side content storage.
 */

export interface LegalSection {
  sectionId: string;
  title: string;
  order: number;
  content: string;
}

export const LEGAL_SECTIONS_SEED: LegalSection[] = [
  {
    sectionId: "acceptance",
    title: "Acceptance of Terms",
    order: 1,
    content: `By accessing, browsing, or using the AniXo platform ("Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"), along with our Privacy Policy and DMCA Policy, which are incorporated herein by reference. These Terms constitute a legally binding agreement between you ("User," "you," or "your") and AniXo ("we," "us," or "our").

If you do not agree to these Terms in their entirety, you must immediately discontinue use of the Service. Your continued use of AniXo following any modifications to these Terms constitutes your acceptance of such changes.

We reserve the right to update, amend, or modify these Terms at any time without prior notice. It is your responsibility to review these Terms periodically. The "Last Updated" date at the top of this page indicates when these Terms were last revised.`,
  },
  {
    sectionId: "description",
    title: "Description of Service",
    order: 2,
    content: `AniXo is a free-to-use, web-based platform that provides users with an organized index of anime content sourced from publicly available third-party providers. The Service functions solely as an aggregation and referral interface — it does not host, upload, store, cache, or distribute any video files, audio files, or copyrighted media on its own servers or infrastructure.

All audiovisual content accessible through AniXo is embedded via third-party players and hosted on external servers operated by independent parties over whom AniXo exercises no ownership, control, or editorial oversight. AniXo acts exclusively as an intermediary providing navigational convenience and does not claim any rights to the content made accessible through its interface.

The availability, quality, accuracy, and legality of content accessible through the Service is determined entirely by the respective third-party providers. AniXo makes no guarantees regarding the continued availability of any specific content or feature.

AniXo may include supplementary features such as user accounts, watchlists, and progress tracking. These features are provided as a convenience and do not alter the fundamental nature of AniXo as a link-aggregation and indexing service.`,
  },
  {
    sectionId: "eligibility",
    title: "User Eligibility",
    order: 3,
    content: `By using AniXo, you represent and warrant that you are at least thirteen (13) years of age, or the minimum age required by the laws of your jurisdiction to enter into a binding agreement. If you are under the age of eighteen (18), you may only use the Service under the supervision of a parent or legal guardian who agrees to be bound by these Terms.

You further represent that you are not barred from using the Service under any applicable law and that you will comply with all local, state, national, and international laws and regulations applicable to your use of the Service.

AniXo reserves the right to refuse service, terminate accounts, or restrict access to any user at its sole discretion, without obligation to provide a reason or prior notice.`,
  },
  {
    sectionId: "conduct",
    title: "User Conduct & Acceptable Use",
    order: 4,
    content: `You agree to use AniXo solely for lawful purposes and in a manner consistent with these Terms. Specifically, you agree not to:

(1) Reproduce, distribute, or publicly display any content from AniXo without prior written authorization.
(2) Attempt to circumvent, disable, or interfere with any security features, access controls, or technical measures of the Service.
(3) Use automated systems — including bots, scrapers, or crawlers — to access, extract, or collect data from the Service without express written permission.
(4) Transmit or upload any material that contains viruses, malware, or other harmful code that may damage or interfere with the Service.
(5) Impersonate any person or entity, or falsely state or misrepresent your affiliation with any person or entity.
(6) Use the Service for any commercial purpose or for the benefit of any third party without our prior written consent.
(7) Engage in any activity that could disable, overburden, or impair the proper functioning of the Service or its underlying infrastructure.

AniXo reserves the right to investigate and take appropriate legal action against any user who violates these provisions, including, without limitation, terminating access and reporting such violations to relevant law enforcement authorities.`,
  },
  {
    sectionId: "intellectual-property",
    title: "Intellectual Property Rights",
    order: 5,
    content: `The AniXo name, logo, user interface design, original graphics, and proprietary software code are the intellectual property of AniXo and are protected under applicable intellectual property laws. You may not reproduce, modify, distribute, or create derivative works from any proprietary AniXo materials without prior written authorization.

All anime titles, character names, artwork, trademarks, and other media content accessible through AniXo are the property of their respective copyright holders and licensors. AniXo does not claim ownership of any third-party content made accessible through the Service.

Nothing in these Terms grants you any right, title, or interest in the Service or its content beyond the limited right to use the Service in accordance with these Terms.

CRITICAL DISCLAIMER — NON-LIABILITY FOR THIRD-PARTY CONTENT: AniXo operates exclusively as a public link-indexing aggregator. It does not host, upload, reproduce, cache, store, stream, or transmit any video binary content, media files, audio streams, or copyrighted audiovisual works on its own servers, databases, or content delivery infrastructure. All video content accessible through AniXo is hosted, stored, and streamed directly from independent third-party servers unaffiliated with AniXo. AniXo's technical function is strictly limited to indexing publicly available URLs and providing navigational hyperlinks to content hosted on external servers. No copy of any third-party audiovisual work is ever placed, buffered, or processed on AniXo's infrastructure at any point in the content delivery chain. Accordingly, AniXo bears no copyright ownership, licensing obligation, or structural copyright liability for any third-party audiovisual content linked through its interface.`,
  },
  {
    sectionId: "third-party",
    title: "Third-Party Content Disclaimer",
    order: 6,
    content: `AniXo does not host, control, verify, endorse, or assume responsibility for any content, products, or services provided by third-party sources accessible through the Service. All embedded media, streaming links, and external content are provided by independent third-party platforms. AniXo exercises no ownership, control, supervision, or editorial involvement over any third-party content.

You acknowledge and agree that your access to and use of any third-party content through AniXo is entirely at your own risk. AniXo shall not be liable for any loss, damage, claim, or liability arising from your interaction with, reliance upon, or exposure to any third-party content, including but not limited to the accuracy, completeness, timeliness, legality, or quality thereof.

AniXo does not make any representations or warranties regarding the legality of any third-party content accessible through the Service. Users are solely responsible for determining whether their use of any content complies with applicable laws in their respective jurisdictions.

AniXo does not guarantee that any third-party content will be free from errors, inaccuracies, offensive material, or infringing content. Links to external websites and services do not constitute an endorsement or recommendation by AniXo of those resources or their operators.

STRUCTURAL LIABILITY EXEMPTION: AniXo's technical architecture is that of a pure aggregation and search-indexing service. It does not place, store, reproduce, cache, or transmit any copy of audiovisual works on its own servers or CDN infrastructure at any point in the content delivery chain. All media streaming, buffering, and delivery occurs exclusively between the user's browser or device and the independent third-party origin servers where such content is physically stored and served. AniXo's role is strictly limited to surfacing publicly accessible hyperlinks — functionally equivalent to the indexing and linking operations of a conventional web search engine. AniXo cannot be held structurally liable for the content, continued availability, accuracy, or legality of third-party materials linked through its interface, as it exercises no technical control over the storage, transmission, encoding, or availability of such content at any stage of delivery.`,
  },
  {
    sectionId: "dmca",
    title: "DMCA Compliance",
    order: 7,
    content: `AniXo respects the intellectual property rights of others and operates in compliance with the Digital Millennium Copyright Act (DMCA), codified at Title 17, United States Code, Section 512. We respond promptly to valid copyright infringement notices submitted by copyright owners or their authorized representatives.

If you believe that content accessible through AniXo infringes upon your copyright, please refer to our DMCA Policy page for detailed instructions on submitting a takedown notice, counter-notification, and other relevant procedures.

In accordance with the DMCA, AniXo maintains a policy of terminating, in appropriate circumstances, the accounts or access privileges of users who are determined to be repeat infringers.

DMCA SAFE HARBOR PROTECTION: AniXo qualifies for and expressly claims the statutory protections afforded by 17 U.S.C. § 512 of the Digital Millennium Copyright Act. Operating as an information location tool that indexes and links to publicly available content without hosting, reproducing, caching, or transmitting any copyrighted binary content on its own servers or infrastructure, AniXo's operations are fully consistent with the safe harbor provisions established under § 512(d) for qualifying service providers who provide information location tools such as directories, indexes, and hyperlinks. AniXo: (1) does not have actual knowledge of specific infringing material residing on third-party servers; (2) is not aware of facts or circumstances from which infringing activity is apparent; (3) does not receive a direct financial benefit from infringing activity over which it exercises any right or ability to control; (4) acts expeditiously upon receipt of a valid, DMCA-compliant takedown notice to remove or disable access to the linked content; and (5) has designated a DMCA agent with the United States Copyright Office as required by statute. All video streams, audio files, and media content are delivered exclusively from independent third-party origin servers over which AniXo exercises no operational control. AniXo's sole technical function in the content access chain is the provision of a navigational hyperlink — placing it squarely within the statutory definition of an eligible "service provider" entitled to DMCA safe harbor protection under both § 512(d) (information location tools) and § 512(a) (transitory digital network communications) as applicable.`,
  },
  {
    sectionId: "responsibility",
    title: "User Responsibility",
    order: 8,
    content: `You are solely responsible for your use of the Service and for ensuring that your use complies with all applicable laws and regulations in your jurisdiction. AniXo does not monitor, control, or assume responsibility for how users interact with the Service or the content accessible through it.

You agree to indemnify, defend, and hold harmless AniXo, its affiliates, officers, directors, agents, and employees from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including attorneys' fees) arising from or related to: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights, including intellectual property rights; or (d) any claim that your use of the Service caused damage to a third party.

This indemnification obligation shall survive the termination of these Terms and your use of the Service.`,
  },
  {
    sectionId: "liability",
    title: "Limitation of Liability",
    order: 9,
    content: `To the fullest extent permitted by applicable law, AniXo, its affiliates, officers, directors, employees, agents, and licensors shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages — including, but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses — arising out of or in connection with your use of, or inability to use, the Service, regardless of the theory of liability (contract, tort, strict liability, or otherwise), even if AniXo has been advised of the possibility of such damages.

In no event shall AniXo's total aggregate liability to you for all claims arising from or related to the Service exceed the amount you have paid to AniXo (if any) in the twelve (12) months preceding the claim, or one hundred U.S. dollars (USD $100.00), whichever is less.

Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages. In such jurisdictions, AniXo's liability shall be limited to the maximum extent permitted by law.`,
  },
  {
    sectionId: "warranties",
    title: "Disclaimer of Warranties",
    order: 10,
    content: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, whether express, implied, or statutory. AniXo expressly disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, and any warranties arising from course of dealing, usage, or trade practice.

AniXo does not warrant that: (a) the Service will be uninterrupted, timely, secure, or error-free; (b) the results obtained from the Service will be accurate, reliable, or complete; (c) the quality of any content, information, or material obtained through the Service will meet your expectations; or (d) any errors in the Service will be corrected.

AniXo does not guarantee that the Service will be available at all times or free from interruptions, delays, outages, or technical failures. Service availability may be affected by maintenance, updates, third-party provider issues, or circumstances beyond AniXo's reasonable control.

Nothing on the Service constitutes legal, financial, or professional advice of any kind. Any decisions made based on content or information accessed through AniXo are made at your sole discretion and risk.

You expressly understand and agree that your use of the Service is at your sole risk. Any material accessed, downloaded, or otherwise obtained through the Service is done at your own discretion and risk.`,
  },
  {
    sectionId: "termination",
    title: "Termination of Access",
    order: 11,
    content: `AniXo reserves the right, at its sole discretion and without prior notice or liability, to restrict, suspend, or terminate your access to all or any part of the Service for any reason, including but not limited to a breach of these Terms, suspected fraudulent or illegal activity, or extended periods of inactivity.

Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including, without limitation, ownership provisions, warranty disclaimers, indemnification obligations, and limitations of liability.

AniXo shall not be liable to you or any third party for any termination of your access to the Service.`,
  },
  {
    sectionId: "changes",
    title: "Changes to Terms",
    order: 12,
    content: `AniXo reserves the right to modify, amend, or replace these Terms at any time, at its sole discretion. Material changes will be indicated by updating the "Last Updated" date at the top of this page. What constitutes a material change will be determined at AniXo's sole discretion.

Your continued use of the Service following the posting of revised Terms constitutes your acceptance of and agreement to be bound by the updated Terms. If you do not agree to the modified Terms, you must discontinue your use of the Service immediately.

We encourage you to review these Terms periodically to remain informed of any updates. Your ongoing use of the Service represents your continued acceptance of these Terms.`,
  },
  {
    sectionId: "governing-law",
    title: "Governing Law & Dispute Resolution",
    order: 13,
    content: `These Terms shall be governed by and construed in accordance with applicable international and local laws, without regard to conflict of law principles. Jurisdiction and venue for any dispute, claim, or controversy arising out of or relating to these Terms or the use of the Service shall be determined based on applicable laws and the operational base of AniXo.

Any dispute shall be resolved through binding arbitration or in the courts of competent jurisdiction, as determined by applicable law. You agree to submit to the personal jurisdiction of such courts and waive any objection to the convenience of such forum. Any claim or cause of action arising from or related to the use of the Service must be filed within one (1) year after such claim or cause of action arose, or be forever barred.

If any provision of these Terms is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The failure of AniXo to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.`,
  },
  {
    sectionId: "contact",
    title: "Contact Information",
    order: 14,
    content: `If you have any questions, concerns, or inquiries regarding these Terms of Service, please contact us through the following channels:

General Inquiries: contact@anixo.online
DMCA & Copyright: dmca@anixo.online
Legal Department: legal@anixo.online

We aim to respond to all inquiries within 48 to 72 business hours. Please include a clear subject line and relevant details to ensure a timely response.

You may also submit inquiries directly through our Contact Us page, where our team monitors submissions and responds to verified legal and general queries.`,
  },
];
