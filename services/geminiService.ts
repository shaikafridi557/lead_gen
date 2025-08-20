import { GoogleGenAI, Type } from "@google/genai";
import type { Lead, GroundingSource, SocialMedia } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A placeholder image URL for leads.
const PLACEHOLDER_IMAGE = "https://images.pexels.com/photos/163064/play-stone-network-networked-163064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

/**
 * Extracts a value from a block of text based on a regex pattern.
 * @param block The text block to search within.
 * @param regex The regular expression with a capturing group for the value.
 * @returns The captured value or an empty string if not found.
 */
function extractValue(block: string, regex: RegExp): string {
  const match = block.match(regex);
  const value = match ? match[1].trim() : '';
  return value.toLowerCase() === 'n/a' ? '' : value;
}

/**
 * Parses a natural language text response from the Gemini model into a structured array of Lead objects.
 * This parser is designed to be robust against variations in the model's output format.
 * @param text The text response from the AI.
 * @returns An array of parsed Lead objects.
 */
function parseLeadsFromText(text: string): Lead[] {
  const leads: Lead[] = [];
  // Split the text into blocks that likely represent individual leads.
  // This regex looks for a number followed by a period or closing parenthesis, which often marks a list item.
  const leadBlocks = text.split(/\n\s*(?=\d[.)]|\*\*Business Name:)/).filter(block => block.trim());

  leadBlocks.forEach(block => {
    const name = extractValue(block, /\*\*Business Name:\*\*\s*(.+)/i);
    if (!name) return; // Skip blocks without a business name.

    const socialMedia: SocialMedia = {
      facebook: extractValue(block, /-\s*Facebook:\s*(.+)/i),
      linkedin: extractValue(block, /-\s*LinkedIn:\s*(.+)/i),
      instagram: extractValue(block, /-\s*Instagram:\s*(.+)/i),
      twitter: extractValue(block, /-\s*Twitter:\s*(.+)/i),
    };

    leads.push({
      name,
      category: extractValue(block, /\*\*Category:\*\*\s*(.+)/i),
      address: extractValue(block, /\*\*Address:\*\*\s*(.+)/i),
      phone: extractValue(block, /\*\*Phone:\*\*\s*(.+)/i),
      website: extractValue(block, /\*\*Website:\*\*\s*(.+)/i),
      email: extractValue(block, /\*\*Email:\*\*\s*(.+)/i),
      priority: extractValue(block, /\*\*Priority:\*\*\s*(High|Medium|Low)/i) as Lead['priority'],
      notes: extractValue(block, /\*\*Notes:\*\*\s*(.+)/is), // Use 's' flag to match across newlines
      socialMedia,
      imageUrl: PLACEHOLDER_IMAGE,
    });
  });

  return leads;
}


export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (query.length < 3) {
    return [];
  }
  try {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the user's partial query "${query}", generate up to 5 concise and relevant search query suggestions for finding business leads for a web development and digital marketing agency.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                            description: "A search query suggestion"
                        }
                    }
                }
            },
            thinkingConfig: { thinkingBudget: 0 } // Disable thinking for low latency
        },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result.suggestions || [];
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return []; // Return empty array on error
  }
}

export async function generateOutreachMessage(lead: Lead): Promise<string> {
  const { name, category, notes, website } = lead;

  const prompt = `
You are a sales representative for "code.serve", a premier digital marketing and web development agency.
Your task is to write a short, professional, and personalized outreach email (around 75-100 words) to a potential client.

**Client Details:**
- **Business Name:** ${name}
- **Category:** ${category}
- **Key Insight:** ${notes}
- **Website:** ${website || 'Not available'}

**Instructions:**
1.  Start with a polite and professional greeting.
2.  Briefly introduce yourself and "code.serve".
3.  Reference their business directly and mention the key insight you've discovered (e.g., "I noticed your restaurant is highly rated, but you don't seem to have a dedicated website yet."). This shows you've done your research.
4.  Briefly state how "code.serve" can help (e.g., "We specialize in creating beautiful, high-performance websites for businesses like yours...").
5.  End with a soft call-to-action, like asking if they'd be open to a brief chat.
6.  Do not include a subject line or your signature. Just write the body of the message.
7.  Maintain a helpful and respectful tone, not an aggressive sales pitch.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating outreach message:", error);
    throw new Error("Failed to generate the outreach message. The AI may be temporarily unavailable.");
  }
}


export async function generateLeadsStream(
  query: string, 
  count: number, 
  onLeadsUpdate: (leads: Lead[]) => void, 
  onSourcesUpdate: (sources: GroundingSource[]) => void
): Promise<Lead[]> {
  const prompt = `Conduct a comprehensive search for the user's query: "${query}".
Your objective is to identify and compile a list of ${count} high-quality business leads.

For each lead, you MUST provide the following information in this exact structured format. If a piece of information is not available after a thorough search, explicitly state 'N/A'.

**Business Name:** [The full name of the business]
**Category:** [e.g., Coffee Shop, Marketing Agency, etc.]
**Address:** [The full street address]
**Phone:** [The primary phone number]
**Website:** [The official website URL]
**Email:** [A contact email address. Check the business website's contact page. Prioritize finding this.]
**Social Media:**
- Facebook: [URL]
- LinkedIn: [URL]
- Instagram: [URL]
- Twitter: [URL]
**Priority:** [High, Medium, or Low]
**Notes:** [A brief, one-sentence rationale for the priority score based on their online presence.]
`;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        systemInstruction: `You are a lead generation expert for a premier digital marketing and web development agency named "code.serve". Your mission is to find businesses that are prime candidates for our services (e.g., new websites, website redesigns, app development, SEO, social media marketing).

Analyze each potential lead's online presence. Assign a 'Priority' based on their needs:
- **High Priority:** Businesses with a weak or non-existent online presence (e.g., no website, a very outdated website, no social media activity). They need immediate help.
- **Medium Priority:** Businesses with a decent but improvable online presence (e.g., a functional website that isn't mobile-friendly, some social media but inconsistent).
- **Low Priority:** Businesses that already have a strong, modern online presence.

For the 'Notes' field, provide a concise, actionable insight that explains your priority rating. For example: "High Priority: This popular restaurant has a Facebook page but no official website, making them an ideal client for a new site." or "Medium Priority: Website is functional but not mobile-responsive and lacks a clear call-to-action."

You must prioritize official sources like Google Business Profiles, official company websites, and reputable directories. **Finding a contact email is a critical priority.** Search thoroughly on the business's website, especially on 'Contact Us' or footer sections. Verify information across sources when possible.
Deliver data in the exact format requested, ensuring every field is populated with real-world data or marked 'N/A' if truly unavailable.`
      },
    });

    let fullText = '';
    const allGroundingChunks: any[] = [];
    for await (const chunk of responseStream) {
      fullText += chunk.text;
      const leads = parseLeadsFromText(fullText);
      onLeadsUpdate(leads);

      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        allGroundingChunks.push(...groundingChunks);
      }
    }
    
    const sources: GroundingSource[] = allGroundingChunks
      .map((chunk: any) => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || 'Unknown Source'
      }))
      .filter((source: GroundingSource) => source.uri); // Filter out empty sources
    
    // De-duplicate sources by URI as they might be repeated in chunks
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());
    onSourcesUpdate(uniqueSources);

    return parseLeadsFromText(fullText); // Return final list for completion check

  } catch (error) {
    console.error("Error generating leads with Gemini:", error);
    if (error instanceof Error && error.message.includes('API key')) {
        throw new Error("API key is not valid. Please check your configuration.");
    }
    throw new Error("The AI failed to generate leads using Google Search. Please try again.");
  }
}