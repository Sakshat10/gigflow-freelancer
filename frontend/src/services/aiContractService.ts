// AI Contract Generation Service
// This service uses AI to improve user inputs while maintaining legal safety

interface ContractInput {
  projectName: string;
  scope: string;
  timeline?: string;
}

interface AIImprovedContent {
  projectName: string;
  scope: string;
  timeline: string;
}

const SYSTEM_PROMPT = `You are an expert legal writing assistant for freelancers.

Your job is to rewrite raw user inputs into:
- Professional
- Grammatically correct
- Clear and neutral business language

Rules:
- Do NOT add new obligations
- Do NOT invent legal clauses
- Do NOT change meaning
- Do NOT provide legal advice
- Only rewrite and clarify the provided text

Return ONLY a JSON object with these exact keys:
{
  "projectName": "improved project name",
  "scope": "improved scope description",
  "timeline": "improved timeline description"
}`;

export const improveContractContent = async (input: ContractInput): Promise<AIImprovedContent> => {
  try {
    // For now, we'll use a mock AI improvement
    // In production, replace this with actual OpenAI API call
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock AI improvements
    const improved: AIImprovedContent = {
      projectName: improveProjectName(input.projectName),
      scope: improveScope(input.scope),
      timeline: improveTimeline(input.timeline || ""),
    };
    
    return improved;
  } catch (error) {
    console.error("AI improvement error:", error);
    // Fallback to original input if AI fails
    return {
      projectName: input.projectName,
      scope: input.scope,
      timeline: input.timeline || "",
    };
  }
};

// Mock improvement functions (replace with actual AI in production)
const improveProjectName = (input: string): string => {
  if (!input) return input;
  
  // Capitalize first letter, clean up
  const cleaned = input.trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const improveScope = (input: string): string => {
  if (!input) return input;
  
  // Basic improvements
  let improved = input.trim();
  
  // Fix common issues
  improved = improved.replace(/builded/gi, "built");
  improved = improved.replace(/\bwebsite\b/gi, "website");
  improved = improved.replace(/\bapp\b/gi, "application");
  
  // Ensure proper capitalization
  if (improved.length > 0) {
    improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  }
  
  // Ensure ends with period
  if (!improved.endsWith('.') && !improved.endsWith('!') && !improved.endsWith('?')) {
    improved += '.';
  }
  
  return improved;
};

const improveTimeline = (input: string): string => {
  if (!input) return "";
  
  const cleaned = input.trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Payment terms mapping (fixed clauses)
export const getPaymentClause = (paymentStructure: string): string => {
  const paymentClauses: Record<string, string> = {
    "50% Upfront / 50% on Completion": 
      "A non-refundable deposit of 50% is required to commence work. The remaining 50% is due upon successful completion of the project.",
    
    "100% Upfront": 
      "Full payment is required before commencement of work.",
    
    "Hourly (Billed Weekly)": 
      "Services will be billed on an hourly basis and invoiced weekly. Payment is due within 7 days of invoice receipt.",
  };
  
  return paymentClauses[paymentStructure] || paymentClauses["50% Upfront / 50% on Completion"];
};

// For production: Uncomment and configure this function
/*
export const improveContractContentWithOpenAI = async (input: ContractInput): Promise<AIImprovedContent> => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Improve this contract content:\n\nProject Name: ${input.projectName}\n\nScope: ${input.scope}\n\nTimeline: ${input.timeline || "Not specified"}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });
  
  if (!response.ok) {
    throw new Error("OpenAI API request failed");
  }
  
  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  
  return {
    projectName: content.projectName || input.projectName,
    scope: content.scope || input.scope,
    timeline: content.timeline || input.timeline || "",
  };
};
*/
