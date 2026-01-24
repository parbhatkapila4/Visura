
import { openrouterChatCompletion } from "@/lib/openrouter";
import { logger } from "@/lib/logger";
import { cached, getClassificationCacheKey } from "@/lib/cache";
import { hashContent } from "@/lib/versioned-documents";

export interface DocumentClassification {
  type: string;
  confidence: number;
  subtype?: string;
}

export async function classifyDocument(text: string): Promise<DocumentClassification> {
  const textHash = hashContent(text.substring(0, 15000));
  const cacheKey = getClassificationCacheKey(textHash);

  return cached(
    cacheKey,
    async () => {
      return classifyDocumentInternal(text);
    },
    24 * 60 * 60
  );
}

async function classifyDocumentInternal(text: string): Promise<DocumentClassification> {
  const sampleText = text.substring(0, 15000).toLowerCase();
  
  const signals: Record<string, RegExp[]> = {
    contract: [
      /contract|agreement|terms and conditions|party a|party b|whereas|hereby|witnesseth/i,
      /indemnification|liability|breach|termination|effective date/i,
      /signature|notary|legal binding|jurisdiction/i,
    ],
    invoice: [
      /invoice|bill to|ship to|invoice number|invoice date|due date/i,
      /item|quantity|unit price|subtotal|tax|total amount/i,
      /payment terms|net \d+|payment due/i,
    ],
    receipt: [
      /receipt|transaction id|payment method|card ending|cash|change/i,
      /thank you for your purchase|date:|time:|total paid/i,
    ],
    resume: [
      /resume|cv|curriculum vitae|objective|summary|experience|education/i,
      /skills|qualifications|work history|employment|references/i,
      /phone|email|linkedin|github|portfolio/i,
    ],
    report: [
      /report|executive summary|findings|recommendations|conclusion/i,
      /analysis|data|statistics|methodology|appendix/i,
    ],
    letter: [
      /dear|sincerely|yours truly|regards|to whom it may concern/i,
      /letter|correspondence|enclosed|please find/i,
    ],
    form: [
      /form|application|please fill|required field|submit/i,
      /name:|address:|phone:|email:|date of birth/i,
    ],
    certificate: [
      /certificate|certify|this is to certify|awarded to|date of issue/i,
      /valid until|expires|certification number/i,
    ],
    statement: [
      /statement|account statement|balance|transactions|debit|credit/i,
      /statement period|opening balance|closing balance/i,
    ],
    prescription: [
      /prescription|rx|medication|dosage|take|times daily|refills/i,
      /doctor|physician|pharmacy|pharmacist/i,
    ],
  };

  let maxScore = 0;
  let detectedType = "document";
  let confidence = 0.5;

  for (const [type, patterns] of Object.entries(signals)) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(sampleText)) {
        score++;
      }
    }
    const typeConfidence = score / patterns.length;
    if (typeConfidence > maxScore) {
      maxScore = typeConfidence;
      detectedType = type;
      confidence = Math.min(0.95, 0.5 + typeConfidence * 0.45);
    }
  }

  let subtype: string | undefined;
  if (detectedType === "contract") {
    if (/employment|job|work|employee/i.test(sampleText)) {
      subtype = "employment";
    } else if (/lease|rental|tenant|landlord/i.test(sampleText)) {
      subtype = "lease";
    } else if (/nda|non-disclosure|confidentiality/i.test(sampleText)) {
      subtype = "nda";
    } else if (/service|consulting|freelance/i.test(sampleText)) {
      subtype = "service";
    }
  }

  return {
    type: detectedType,
    confidence,
    subtype,
  };
}
