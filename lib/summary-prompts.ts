
export function getTypeSpecificPrompt(docType: string, estimatedPages: number, isChunk?: boolean): string {

        if (isChunk) {
                const basePrompt = `Create a concise, informative summary of this document chunk with the following sections. Extract key information from this chunk. Aim for 200-400 words total.

### Executive Summary
Provide a brief overview (2-3 sentences) of what this chunk covers and its main points.

### Key Points & Findings
List 3-5 most important points or findings from this chunk. Each point should be clear and specific.

### Important Details & Specifications
Include key details from this chunk: dates, amounts, names, or specific information mentioned.

### Risks & Concerns
Identify any risks or concerns mentioned in this chunk. If none, state "No significant risks identified."

### Action Items & Recommendations
List any actions or recommendations mentioned in this chunk. If none, state "No specific action items."

### Key Takeaways & Insights
Provide 2-3 key insights or important points from this chunk.`;

                return basePrompt;
        }

        const basePrompt = `Create a comprehensive, detailed, and purely informative summary with the following sections. Be EXTREMELY thorough and extract ALL information from the document. Aim for 2,000-3,000 words total.

### Executive Summary
Provide a comprehensive overview (200-300 words) of what this document is about, its main purpose, key themes, and critical takeaways. Include detailed information about the document's content, structure, and significance.

### Key Points & Findings
List and elaborate on 10-15 most important points, facts, or findings from the document. Each point should be explained in detail with context, examples, and supporting information. Be comprehensive and informative.

### Important Details & Specifications
Include ALL critical details: dates, deadlines, amounts, parties involved, requirements, specifications, technical details, legal terms, financial figures, statistics, and any other critical information. Be thorough and detailed.

### Risks & Concerns
Identify and explain all risks, concerns, warnings, potential issues, and challenges mentioned in the document. Provide detailed analysis of each risk with context and implications. If none, state "No significant risks identified."

### Action Items & Recommendations
List and elaborate on all specific actions, next steps, recommendations, and implementation strategies from the document. Include detailed guidance, deadlines, and requirements for each action item. If none, state "No specific action items."

### Key Takeaways & Insights
Provide 8-12 key insights, conclusions, patterns, themes, and implications from this document. Include detailed explanations, connections between concepts, and practical applications. Be comprehensive and informative.

### Additional Information
Include any other relevant information, background context, related concepts, examples, case studies, or supplementary details that help understand the document better. Be thorough and extract all relevant information.`;

        const typeSpecificPrompts: Record<string, string> = {
                'LEGAL/CONTRACT': `Create a comprehensive contract summary with these sections:

### Executive Summary
Provide a clear overview of the contract type, parties involved, and main purpose.

### Key Terms & Conditions
List the most important terms: payment amounts, duration, obligations, deliverables, and key dates.

### Financial Details
Include all monetary information: contract value, payment schedule, penalties, fees, and financial obligations.

### Rights & Obligations
Detail what each party must do, what they're entitled to, and any restrictions or requirements.

### Critical Risks & Liabilities
Identify termination clauses, liability limits, IP ownership, dispute resolution, and any concerning terms.

### Action Items
List any required actions, deadlines, or next steps. Include signature requirements or review deadlines.

### Recommendation
Provide a clear recommendation: Sign, Negotiate, or Reject, with brief reasoning.`,

                'FINANCIAL/BOND': `Create a comprehensive financial instrument summary:

### Executive Summary
Overview of the instrument type, issuer, and primary purpose.

### Financial Specifications
Include principal amount, interest rate, maturity date, coupon frequency, and credit rating.

### Key Features
Detail any special features: callable, convertible, secured, or other unique characteristics.

### Risk Analysis
Assess default risk, interest rate risk, liquidity risk, market risk, and credit risk factors.

### Performance Metrics
Include yield, duration, credit spread, and any historical performance data if available.

### Investment Recommendation
Provide a clear recommendation: Invest, Avoid, or Review Further, with reasoning based on risk-return profile.`,

                'PRODUCT/TECHNICAL': `Create a comprehensive product/technical document summary:

### Executive Summary
Overview of the product, feature, or technical concept and its primary value proposition.

### Key Features & Capabilities
List the main features, functionalities, or technical specifications that make this significant.

### Implementation Details
Include timeline, budget requirements, team size needed, technology stack, and resource requirements.

### Technical Requirements
Detail any dependencies, infrastructure needs, integration requirements, or technical constraints.

### Risks & Challenges
Identify feasibility concerns, timeline risks, resource constraints, technical limitations, or market challenges.

### Success Metrics
Include KPIs, success criteria, expected outcomes, or performance targets mentioned in the document.

### Recommendation
Provide recommendation: Build, Prioritize, or Reject, with reasoning based on feasibility and value.`,

                'RESEARCH/ANALYSIS': `Create a comprehensive research/analysis summary:

### Executive Summary
Overview of the research topic, main research question, and primary findings.

### Methodology
Describe the research approach, sample size, data collection methods, and study period.

### Key Findings
List the most important findings, insights, or conclusions from the research.

### Data & Statistics
Include significant numbers, percentages, statistical significance, trends, and quantitative results.

### Limitations & Considerations
Identify methodology limitations, potential biases, data quality concerns, or applicability constraints.

### Implications
Explain what these findings mean in practical terms and how they might be applied.

### Recommendation
Provide assessment: Trust & Apply, Review Further, or Question Methodology, with reasoning.`,

                'MEETING NOTES': `Create a comprehensive meeting notes summary:

### Executive Summary
Overview of the meeting purpose, main topics discussed, and key outcomes.

### Participants & Context
List attendees, meeting date, and any important context about the meeting.

### Key Decisions
Document all decisions made, approvals given, or directions agreed upon.

### Discussion Points
Summarize the main topics discussed, different viewpoints presented, and important conversations.

### Action Items
List all action items with owners, deadlines, and specific tasks. Include follow-up requirements.

### Blockers & Concerns
Identify any blockers, unresolved issues, missing information, or concerns raised.

### Next Steps
Outline follow-up meetings, deadlines, and what needs to happen next.`,

                'MARKETING': `Create a comprehensive marketing document summary:

### Executive Summary
Overview of the marketing plan, campaign, or strategy and its primary objectives.

### Strategy & Approach
Describe the marketing strategy, target audience, positioning, and key messaging.

### Budget & Resources
Include total budget, budget allocation, timeline, team requirements, and resource needs.

### Channels & Tactics
List marketing channels, specific tactics, campaigns, and promotional activities planned.

### Success Metrics
Detail KPIs, conversion goals, engagement targets, ROI expectations, and measurement methods.

### Risks & Challenges
Identify budget constraints, competition, market challenges, or execution risks.

### Recommendation
Provide recommendation: Execute, Revise, or Reject, with reasoning based on strategy and feasibility.`,

                'HR/PEOPLE': `Create a comprehensive HR/people document summary:

### Executive Summary
Overview of the HR document type, purpose, and main focus (hiring, policy, review, etc.).

### Key Details
Include position details, salary/compensation, headcount, timeline, department, and reporting structure.

### Requirements & Qualifications
List required skills, experience, education, certifications, or other qualifications.

### Process & Timeline
Detail the hiring process, review timeline, decision dates, or implementation schedule.

### Risks & Considerations
Identify budget constraints, timeline risks, retention concerns, compliance issues, or market challenges.

### Action Items
List specific actions: interviews to schedule, approvals needed, documents to prepare, or next steps.

### Recommendation
Provide recommendation: Approve, Review Further, or Reject, with reasoning.`,

                'NOVEL/CREATIVE': `5 sections. MAX 200 words TOTAL. MAX 3 bullets per section. MAX 12 words per bullet.

### TL;DR
- Story summary
- Key theme
- Read/skip/recommend

### Key Elements
- Theme, characters, setting, genre

### Critical Insights
- Message, character development, plot

### Action Items
- Actions or "None"

### Bottom Line
- Yes/No/Maybe`,

                'PROJECT/PROPOSAL': `Create a comprehensive project/proposal summary:

### Executive Summary
Overview of the project, its objectives, and expected outcomes or deliverables.

### Project Scope
Detail what the project includes, deliverables, features, and what's out of scope.

### Budget & Timeline
Include total budget, budget breakdown, project timeline, milestones, and key dates.

### Resources & Team
List team requirements, roles needed, external resources, and dependencies.

### Risks & Mitigation
Identify project risks, potential blockers, resource constraints, and mitigation strategies.

### Success Criteria
Detail how success will be measured, KPIs, acceptance criteria, and expected outcomes.

### Recommendation
Provide recommendation: Approve, Revise, or Reject, with reasoning based on feasibility and value.`,
        };


        if (isChunk) {
                return basePrompt;
        }
        return typeSpecificPrompts[docType] || basePrompt;
}
