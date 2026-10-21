import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { createRequire } from "module";

const CLAUSES = [
  [
    "1. DEFINITIONS",
    'In this agreement, "Services" means the services described in Schedule 1, and "Fees" means the amounts set out in Schedule 2. Terms not otherwise defined bear their ordinary commercial meaning.',
  ],
  [
    "2. TERM",
    "This agreement commences on the Effective Date and continues for twelve months unless terminated earlier in accordance with clause 9. Renewal is by written agreement of both parties.",
  ],
  [
    "3. OBLIGATIONS OF THE SUPPLIER",
    "The Supplier shall perform the Services with reasonable skill and care, and shall comply with all applicable laws and regulations in the performance of its obligations under this agreement.",
  ],
  [
    "4. FEES AND PAYMENT",
    "The Customer shall pay the Fees within thirty days of receipt of a valid invoice. Interest accrues on late payment at 2% above base rate from the due date until payment in full.",
  ],
  [
    "5. CONFIDENTIALITY",
    "Each party shall keep confidential all information disclosed to it by the other party and shall not disclose it to any third party without prior written consent, except where required by law.",
  ],
  [
    "6. DATA PROTECTION",
    "Each party shall comply with applicable data protection legislation and shall implement appropriate technical and organisational measures against unauthorised processing of personal data.",
  ],
  [
    "7. INTELLECTUAL PROPERTY",
    "All intellectual property rights in the Deliverables vest in the Customer on payment in full of the Fees. The Supplier retains all rights in its pre-existing materials and tools.",
  ],
  [
    "8. LIABILITY",
    "The aggregate liability of either party under this agreement shall not exceed $1,000,000, except in respect of death or personal injury caused by negligence or any liability that cannot lawfully be limited.",
  ],
  [
    "9. INDEMNITY",
    "The Supplier shall indemnify the Customer against all losses arising from any claim that the Deliverables infringe the intellectual property rights of a third party.",
  ],
  [
    "10. TERMINATION",
    "Either party may terminate this agreement on net 30 days written notice, or immediately if the other party commits a material breach that is not remedied within fourteen days of notice.",
  ],
  [
    "11. FORCE MAJEURE",
    "Neither party is liable for failure to perform caused by an event beyond its reasonable control, provided it notifies the other party promptly and uses reasonable efforts to resume performance.",
  ],
  [
    "12. ASSIGNMENT",
    "Neither party may assign or transfer this agreement without the prior written consent of the other party, such consent not to be unreasonably withheld or delayed.",
  ],
  [
    "13. NOTICES",
    "Notices must be in writing and delivered by hand, by recorded delivery, or by email to the address stated in Schedule 3, and are deemed received on the next business day.",
  ],
  [
    "14. ENTIRE AGREEMENT",
    "This agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations and understandings, whether written or oral.",
  ],
  [
    "15. GOVERNING LAW",
    "This agreement is governed by the laws of England and Wales and the parties submit to the exclusive jurisdiction of the English courts in respect of any dispute arising out of it.",
  ],
];

const RETURNED_EDITS = {
  "8. LIABILITY":
    "The aggregate liability of either party under this agreement shall not exceed $5,000,000, except in respect of death or personal injury caused by negligence or any liability that cannot lawfully be limited.",
  "10. TERMINATION":
    "Either party may terminate this agreement on net 45 days written notice, or immediately if the other party commits a material breach that is not remedied within fourteen days of notice.",
};

const require = createRequire(import.meta.url);
const { jsPDF } = require("jspdf");

function build(path, format, edits = {}) {
  const doc = new jsPDF({ unit: "pt", format });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  const body = W - M * 2;
  let y = M + 24;
  let page = 1;

  const furniture = () => {
    doc.setFontSize(8);
    doc.text("Acme Corp / Confidential", M, M - 18);
    doc.text(String(page), W / 2, H - 28, { align: "center" });
    doc.setFontSize(11);
  };
  furniture();

  doc.setFontSize(14);
  doc.text("MASTER SERVICES AGREEMENT", M, y);
  y += 30;
  doc.setFontSize(11);

  for (const [heading, original] of CLAUSES) {
    const text = edits[heading] ?? original;
    const lines = [heading, ...doc.splitTextToSize(text, body)];
    for (const line of lines) {
      if (y > H - 64) {
        doc.addPage();
        page++;
        y = M + 24;
        furniture();
      }
      doc.text(line, M, y);
      y += 15;
    }
    y += 10;
  }

  writeFileSync(path, Buffer.from(doc.output("arraybuffer")));
  return page;
}

const dir = join(process.cwd(), "public", "samples");
mkdirSync(dir, { recursive: true });

const sent = build(join(dir, "agreement-sent.pdf"), "letter");
const returned = build(join(dir, "agreement-returned.pdf"), "a4", RETURNED_EDITS);

console.log(
  `public/samples/ -> agreement-sent.pdf (Letter, ${sent}pp), ` +
    `agreement-returned.pdf (A4, ${returned}pp, 2 clauses edited)`
);
