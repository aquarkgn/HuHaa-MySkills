// 旧模式：整技能对象翻译，依赖 ANTHROPIC_API_KEY（需密钥，按全局规则使用前需询问）。
// 推荐使用 packages/server/src/index.mjs 的 translateText（Google 免费 + md5 缓存）。
// 本模块保留以兼容 /api/translate 的 id 旧模式调用，新代码勿直接依赖。
export async function translateSkill(skill, targetLang = 'zh-CN') {
  if (targetLang !== 'zh-CN' || skill.i18n?.name_zh) return skill;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[translator] ANTHROPIC_API_KEY not set, skipping translation');
    return skill;
  }

  const prompt = `Translate these skill metadata to Chinese (简体中文). Return JSON only, no markdown.

Current metadata:
- name: ${skill.name}
- description: ${skill.description || '(none)'}
- category: ${skill.category || '(none)'}

Return JSON format (translate only the values):
{
  "name_zh": "中文名称",
  "description_zh": "中文描述",
  "category_zh": "中文分类"
}

Guidelines:
- Keep technical terms like "API", "MCP", "LLM" in English when appropriate
- Use common Chinese equivalents for concepts (e.g., "skill" → "技能", "rule" → "规则")
- Keep descriptions concise (under 100 chars)
- Preserve the technical meaning
- Return valid JSON only`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API: ${response.status} ${error}`);
    }

    const data = await response.json();
    const translated = JSON.parse(data.content[0].text);

    return {
      ...skill,
      i18n: {
        name_zh: translated.name_zh,
        description_zh: translated.description_zh,
        category_zh: translated.category_zh,
        translatedAt: new Date().toISOString(),
        translationModel: 'claude-3.5-sonnet',
      },
    };
  } catch (e) {
    console.error(`[translator] error: ${e.message}`);
    return skill;
  }
}
