const express = require('express');
const router = express.Router();

/**
 * Week 13: AI API Integration into a Web Application
 * Features:
 *  - Auto-generate task descriptions
 *  - Smart priority reasoning
 *  - Deadline & effort estimation
 *  - Subtasks checklist generation
 *  - Graceful degradation & responsible fallback
 */

// Heuristic fallback generator when AI API key is missing or service is offline
function generateHeuristicResponse(title, category = 'General') {
  const cleanTitle = (title || 'Task').trim();
  const lower = cleanTitle.toLowerCase();

  let priority = 'Medium';
  let priorityReason = 'Standard priority for general engineering workflow.';
  let estimatedHours = 3;
  let daysToAdd = 3;
  let detectedCategory = category;

  if (lower.includes('bug') || lower.includes('fix') || lower.includes('crash') || lower.includes('urgent') || lower.includes('security') || lower.includes('vuln')) {
    priority = 'High';
    priorityReason = 'Urgent attention required: Contains critical stability or security implications.';
    estimatedHours = 2;
    daysToAdd = 1;
    detectedCategory = 'Maintenance / Bugfix';
  } else if (lower.includes('docker') || lower.includes('deploy') || lower.includes('ci/cd') || lower.includes('k8s') || lower.includes('compose')) {
    priority = 'High';
    priorityReason = 'DevOps infrastructure task with system-wide deployment impact.';
    estimatedHours = 5;
    daysToAdd = 2;
    detectedCategory = 'DevOps / Infrastructure';
  } else if (lower.includes('refactor') || lower.includes('docs') || lower.includes('readme') || lower.includes('cleanup') || lower.includes('style')) {
    priority = 'Low';
    priorityReason = 'Non-blocking enhancement; can be completed during scheduled maintenance windows.';
    estimatedHours = 2;
    daysToAdd = 7;
    detectedCategory = 'Code Quality';
  } else if (lower.includes('api') || lower.includes('database') || lower.includes('auth') || lower.includes('schema') || lower.includes('cache')) {
    priority = 'Medium';
    priorityReason = 'Core backend capability requiring standard validation and testing.';
    estimatedHours = 4;
    daysToAdd = 4;
    detectedCategory = 'Backend API';
  }

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + daysToAdd);
  const suggestedDeadline = deadlineDate.toISOString().split('T')[0];

  const subtasks = [
    `Analyze requirements and dependencies for "${cleanTitle}"`,
    `Implement core changes with error boundaries and unit tests`,
    `Perform verification, audit execution logs, and document implementation`
  ];

  const description = `Implementation objective: Execute "${cleanTitle}" following clean code standards. Ensure proper error handling, schema validation, and logging across execution boundaries.`;

  return {
    title: cleanTitle,
    description,
    priority,
    priorityReason,
    estimatedHours,
    suggestedDeadline,
    subtasks,
    category: detectedCategory,
    source: 'intelligent-heuristic-engine',
    fallbackActive: true,
    disclaimer: 'Generated via built-in intelligent NLP heuristic engine (Responsible AI fallback active).'
  };
}

// POST /api/ai/suggest - Generate AI task enhancement
router.post('/suggest', async (req, res) => {
  const { title, context, category } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Task title is required for AI generation' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // 1. If Gemini API key is configured, call Google Gemini REST API
  if (geminiApiKey) {
    try {
      const prompt = `You are an expert technical project assistant. Analyze the task title: "${title}".
Context/Notes: "${context || 'None'}"
Respond ONLY with a valid JSON object (no markdown code fences, no extra text) with these exact keys:
{
  "title": "${title}",
  "description": "A concise, professional 1-2 sentence description explaining the goal and acceptance criteria",
  "priority": "High" | "Medium" | "Low",
  "priorityReason": "Brief reason why this priority was assigned",
  "estimatedHours": number between 1 and 16,
  "suggestedDeadline": "YYYY-MM-DD (realistic future date based on urgency)",
  "subtasks": ["Actionable subtask 1", "Actionable subtask 2", "Actionable subtask 3"],
  "category": "Frontend | Backend | DevOps | Security | Testing | Documentation"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          return res.json({
            success: true,
            source: 'gemini-1.5-flash',
            fallbackActive: false,
            data: parsed
          });
        }
      } else {
        console.warn(`⚠️ Gemini API returned HTTP ${response.status}. Degrading gracefully to heuristic fallback.`);
      }
    } catch (aiErr) {
      console.warn(`⚠️ Gemini API call error: ${aiErr.message}. Degrading gracefully to heuristic fallback.`);
    }
  }

  // 2. If OpenAI API key is configured as an alternative
  if (openaiApiKey) {
    try {
      const prompt = `Analyze task: "${title}". Return valid JSON with keys: title, description, priority (High/Medium/Low), priorityReason, estimatedHours, suggestedDeadline (YYYY-MM-DD), subtasks (array of 3 strings), category.`;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
          return res.json({
            success: true,
            source: 'openai-gpt-4o-mini',
            fallbackActive: false,
            data: parsed
          });
        }
      }
    } catch (openAiErr) {
      console.warn(`⚠️ OpenAI API call error: ${openAiErr.message}. Degrading gracefully to heuristic fallback.`);
    }
  }

  // 3. Graceful degradation: Responsible AI fallback
  // Returns high quality, context-aware suggestions without failing the user or crashing the app
  const fallbackData = generateHeuristicResponse(title, category);
  return res.json({
    success: true,
    source: 'intelligent-heuristic-fallback',
    fallbackActive: true,
    data: fallbackData
  });
});

// GET /api/ai/status - AI service health and degradation readiness
router.get('/status', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  res.json({
    status: 'Ready',
    providers: {
      gemini: { configured: hasGemini, model: 'gemini-1.5-flash' },
      openai: { configured: hasOpenAI, model: 'gpt-4o-mini' },
      responsibleFallback: {
        active: true,
        description: 'Contextual NLP heuristic engine ensures 100% uptime with zero API key dependencies'
      }
    },
    currentMode: hasGemini ? 'Google Gemini AI' : hasOpenAI ? 'OpenAI GPT' : 'Responsible Smart Fallback Engine'
  });
});

module.exports = router;
