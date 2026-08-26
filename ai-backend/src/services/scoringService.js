const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function calculateFallbackScore(reports) {
  let score = 0;
  
  // 1. (reportCount, capped at 10, × 3)
  const reportCount = Math.min(reports.length, 10);
  score += reportCount * 3;

  // 2. (25 if any report tag is "injury", "trapped", or "medical", else 0)
  const criticalTags = ['injury', 'trapped', 'medical'];
  const hasCriticalTag = reports.some(r => criticalTags.includes(r.tag));
  if (hasCriticalTag) score += 25;

  // 3. (20 if any report isEmergency === true, else 0)
  const hasEmergency = reports.some(r => r.isEmergency === true);
  if (hasEmergency) score += 20;

  // 4. (15 if reportCount from verified/app sources > reportCount from anonymous SMS, else 5)
  const appSources = reports.filter(r => r.source === 'app' || r.source === 'offline_sync').length;
  const smsSources = reports.filter(r => r.source === 'sms').length;
  if (appSources > smsSources) {
    score += 15;
  } else {
    score += 5;
  }

  // 5. (15 if the oldest unresolved report in the cluster is older than 30 minutes, else 0)
  const now = Date.now();
  const thirtyMins = 30 * 60 * 1000;
  const hasOldReport = reports.some(r => {
    if (!r.createdAt) return false;
    let time = r.createdAt.toMillis ? r.createdAt.toMillis() : new Date(r.createdAt).getTime();
    return (now - time) > thirtyMins;
  });
  if (hasOldReport) score += 15;

  score = Math.min(score, 100);

  // Fallback skills
  const skillsSet = new Set();
  const textBlob = reports.map(r => (r.text || '').toLowerCase()).join(' ');
  
  if (textBlob.includes('medical') || textBlob.includes('bleeding') || textBlob.includes('injury')) {
    skillsSet.add('medical');
  }
  if (textBlob.includes('drowning') || textBlob.includes('water') || textBlob.includes('flood')) {
    skillsSet.add('swimming');
  }
  if (textBlob.includes('trapped') || textBlob.includes('rubble')) {
    skillsSet.add('search_and_rescue');
  }
  if (textBlob.includes('road blocked') || textBlob.includes('drive')) {
    skillsSet.add('driving');
  }
  if (textBlob.includes('food') || textBlob.includes('hungry') || textBlob.includes('water')) {
    skillsSet.add('food_distribution');
  }
  
  reports.forEach(r => {
    if (r.tag === 'medical' || r.tag === 'injury') skillsSet.add('medical');
    if (r.tag === 'food_water') skillsSet.add('food_distribution');
    if (r.tag === 'flood') skillsSet.add('swimming');
  });

  return {
    priorityScore: score,
    neededSkills: Array.from(skillsSet),
    severitySummary: `Fallback Summary: Cluster of ${reports.length} report(s). ${hasCriticalTag ? 'Critical incident reported.' : 'General emergency.'}`,
    confidence: "fallback_only",
    scoringMethod: "rule_based_fallback"
  };
}

async function getAIScore(reports) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
    console.warn("No OpenAI API key found, using fallback directly.");
    return calculateFallbackScore(reports);
  }

  const reportsText = reports.map((r, i) => `Report ${i+1}: Source: ${r.source}, Tag: ${r.tag}, Emergency: ${r.isEmergency}, Text: ${r.text || 'N/A'}`).join('\n');

  const prompt = `You are a disaster response AI. Analyze the following cluster of emergency reports and provide a priority assessment.
Reports:
${reportsText}

Instructions:
1. "severitySummary": Provide a 1-2 sentence plain-language summary of what is happening.
2. "priorityScore": Provide a score from 0 to 100. Weigh the number of reports, mentions of injury/trapped/medical, vulnerable groups (children, elderly, disabled), and urgency language.
3. "neededSkills": Provide an array of strings representing skills needed by volunteers (e.g. "medical", "swimming", "driving", "search_and_rescue", "translation", "food_distribution").
4. "confidence": Must be "high", "medium", or "low". Return "low" if the report text is vague, contradictory, or if you are uncertain.

Respond ONLY with a valid JSON object of this shape:
{
  "severitySummary": "string",
  "priorityScore": number,
  "neededSkills": ["string"],
  "confidence": "high" | "medium" | "low"
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout as requested

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    }, { signal: controller.signal });

    clearTimeout(timeoutId);

    const result = JSON.parse(response.choices[0].message.content);
    
    if (typeof result.priorityScore !== 'number' || !result.severitySummary || !Array.isArray(result.neededSkills) || !result.confidence) {
      throw new Error("Invalid JSON structure from AI");
    }

    return {
      severitySummary: result.severitySummary,
      priorityScore: result.priorityScore,
      neededSkills: result.neededSkills,
      confidence: result.confidence,
      scoringMethod: "ai"
    };
  } catch (error) {
    console.warn("AI Scoring failed or timed out. Falling back to rule-based scorer.", error.message);
    return calculateFallbackScore(reports);
  }
}

module.exports = { calculateFallbackScore, getAIScore };
