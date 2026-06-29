/**
 * 完整的品牌配置表 - 包含 50+ 个品牌
 * 用于自动匹配 Hermes 技能和其他资源到相应的品牌
 */

export const COMPLETE_BRANDS = {
  // DevOps & Infrastructure (25+ 个)
  'GitHub': {
    icon: '🐙',
    color: '#24292E',
    category: 'DevOps',
    aliases: ['github', 'git-hub', 'gh'],
    keywords: ['github', 'git', 'version-control', 'scm']
  },
  'Docker': {
    icon: '🐋',
    color: '#2496ED',
    category: 'DevOps',
    aliases: ['docker', 'container'],
    keywords: ['docker', 'container', 'containerization']
  },
  'Kubernetes': {
    icon: '☸️',
    color: '#326CE5',
    category: 'DevOps',
    aliases: ['kubernetes', 'k8s', 'kubes'],
    keywords: ['kubernetes', 'k8s', 'orchestration', 'container-orchestration']
  },
  'AWS': {
    icon: '☁️',
    color: '#FF9900',
    category: 'DevOps',
    aliases: ['aws', 'amazon-web-services'],
    keywords: ['aws', 'amazon', 'cloud', 's3', 'ec2', 'lambda']
  },
  'Linux': {
    icon: '🐧',
    color: '#FCC624',
    category: 'DevOps',
    aliases: ['linux', 'gnu-linux'],
    keywords: ['linux', 'ubuntu', 'debian', 'centos', 'rhel', 'fedora']
  },
  'Jenkins': {
    icon: '🔴',
    color: '#D33C27',
    category: 'DevOps',
    aliases: ['jenkins'],
    keywords: ['jenkins', 'ci/cd', 'continuous-integration']
  },
  'Terraform': {
    icon: '🌍',
    color: '#7B42BC',
    category: 'DevOps',
    aliases: ['terraform', 'tf'],
    keywords: ['terraform', 'iac', 'infrastructure-as-code']
  },
  'Ansible': {
    icon: '📋',
    color: '#EE0000',
    category: 'DevOps',
    aliases: ['ansible'],
    keywords: ['ansible', 'automation', 'configuration-management']
  },
  'nginx': {
    icon: '⚡',
    color: '#009639',
    category: 'DevOps',
    aliases: ['nginx', 'engine-x'],
    keywords: ['nginx', 'web-server', 'reverse-proxy']
  },
  'Prometheus': {
    icon: '📊',
    color: '#E6522C',
    category: 'DevOps',
    aliases: ['prometheus'],
    keywords: ['prometheus', 'monitoring', 'metrics']
  },
  'Apache': {
    icon: '🪶',
    color: '#D70015',
    category: 'DevOps',
    aliases: ['apache', 'httpd'],
    keywords: ['apache', 'httpd', 'web-server']
  },
  'GitLab': {
    icon: '🦊',
    color: '#FC6D26',
    category: 'DevOps',
    aliases: ['gitlab'],
    keywords: ['gitlab', 'git', 'version-control']
  },
  'CircleCI': {
    icon: '⭕',
    color: '#343434',
    category: 'DevOps',
    aliases: ['circleci'],
    keywords: ['circleci', 'ci/cd', 'continuous-integration']
  },
  'HashiCorp': {
    icon: '🔷',
    color: '#10B981',
    category: 'DevOps',
    aliases: ['hashicorp', 'hashi'],
    keywords: ['terraform', 'vault', 'nomad', 'consul', 'packer']
  },
  'Grafana': {
    icon: '📈',
    color: '#F05A28',
    category: 'DevOps',
    aliases: ['grafana'],
    keywords: ['grafana', 'visualization', 'dashboards', 'monitoring']
  },
  'ELK Stack': {
    icon: '🔍',
    color: '#005571',
    category: 'DevOps',
    aliases: ['elk', 'elasticsearch', 'logstash', 'kibana'],
    keywords: ['elasticsearch', 'logstash', 'kibana', 'logging']
  },
  'Datadog': {
    icon: '🐕',
    color: '#632CA6',
    category: 'DevOps',
    aliases: ['datadog'],
    keywords: ['datadog', 'monitoring', 'observability']
  },
  'CloudFlare': {
    icon: '🔥',
    color: '#F38020',
    category: 'DevOps',
    aliases: ['cloudflare', 'cf'],
    keywords: ['cloudflare', 'cdn', 'dns', 'security']
  },
  'Nginx': {
    icon: '⚡',
    color: '#009639',
    category: 'DevOps',
    aliases: ['nginx'],
    keywords: ['nginx', 'web-server']
  },
  'CentOS': {
    icon: '🏢',
    color: '#932279',
    category: 'DevOps',
    aliases: ['centos'],
    keywords: ['centos', 'rhel', 'redhat']
  },
  'Ubuntu': {
    icon: '🧡',
    color: '#E95420',
    category: 'DevOps',
    aliases: ['ubuntu', 'debian'],
    keywords: ['ubuntu', 'debian', 'apt', 'linux']
  },
  'Helm': {
    icon: '⛵',
    color: '#0F1689',
    category: 'DevOps',
    aliases: ['helm'],
    keywords: ['helm', 'kubernetes', 'package-manager']
  },
  'ArgoCD': {
    icon: '🐙',
    color: '#0099CC',
    category: 'DevOps',
    aliases: ['argocd', 'argo'],
    keywords: ['argocd', 'gitops', 'cd', 'deployment']
  },
  'Vault': {
    icon: '🔐',
    color: '#000000',
    category: 'DevOps',
    aliases: ['vault', 'hashicorp-vault'],
    keywords: ['vault', 'secrets-management', 'security']
  },

  // Development (25+ 个)
  'Node.js': {
    icon: '📦',
    color: '#68A063',
    category: 'Development',
    aliases: ['nodejs', 'node', 'npm'],
    keywords: ['node', 'nodejs', 'npm', 'javascript-runtime']
  },
  'Python': {
    icon: '🐍',
    color: '#3776AB',
    category: 'Development',
    aliases: ['python', 'py', 'python3'],
    keywords: ['python', 'py', 'pip', 'django', 'flask', 'fastapi']
  },
  'Go': {
    icon: '🦅',
    color: '#00ADD8',
    category: 'Development',
    aliases: ['golang', 'go'],
    keywords: ['go', 'golang', 'goroutine']
  },
  'Rust': {
    icon: '🦀',
    color: '#CE422B',
    category: 'Development',
    aliases: ['rust', 'rs'],
    keywords: ['rust', 'cargo', 'systems-programming']
  },
  'Java': {
    icon: '☕',
    color: '#007396',
    category: 'Development',
    aliases: ['java', 'jvm'],
    keywords: ['java', 'jvm', 'spring', 'maven']
  },
  'Ruby': {
    icon: '💎',
    color: '#CC342D',
    category: 'Development',
    aliases: ['ruby', 'rb', 'rails'],
    keywords: ['ruby', 'rails', 'rack', 'erb']
  },
  'PHP': {
    icon: '🐘',
    color: '#777BB4',
    category: 'Development',
    aliases: ['php'],
    keywords: ['php', 'laravel', 'symfony', 'composer']
  },
  'JavaScript': {
    icon: '✨',
    color: '#F7DF1E',
    category: 'Development',
    aliases: ['javascript', 'js', 'ecmascript'],
    keywords: ['javascript', 'js', 'es6', 'nodejs', 'browser']
  },
  'TypeScript': {
    icon: '📘',
    color: '#3178C6',
    category: 'Development',
    aliases: ['typescript', 'ts'],
    keywords: ['typescript', 'ts', 'tsc', 'type-safety']
  },
  'Vue': {
    icon: '💚',
    color: '#4FC08D',
    category: 'Development',
    aliases: ['vue', 'vuejs', 'vue.js'],
    keywords: ['vue', 'vuejs', 'frontend', 'spa']
  },
  'React': {
    icon: '⚛️',
    color: '#61DAFB',
    category: 'Development',
    aliases: ['react', 'reactjs', 'react.js'],
    keywords: ['react', 'jsx', 'frontend', 'spa', 'next']
  },
  'Angular': {
    icon: '🔴',
    color: '#DD0031',
    category: 'Development',
    aliases: ['angular', 'angularjs'],
    keywords: ['angular', 'ng', 'typescript', 'frontend']
  },
  'VS Code': {
    icon: '💻',
    color: '#007ACC',
    category: 'Development',
    aliases: ['vscode', 'visual-studio-code', 'vs-code'],
    keywords: ['vscode', 'editor', 'ide']
  },
  'Git': {
    icon: '🔀',
    color: '#F1502F',
    category: 'Development',
    aliases: ['git'],
    keywords: ['git', 'version-control', 'scm', 'vcs']
  },
  'Apple': {
    icon: '🍎',
    color: '#A1AAAD',
    category: 'Development',
    aliases: ['apple', 'ios', 'macos', 'swift'],
    keywords: ['apple', 'ios', 'macos', 'swift', 'xcode', 'objective-c']
  },
  'Svelte': {
    icon: '🔥',
    color: '#FF3E00',
    category: 'Development',
    aliases: ['svelte'],
    keywords: ['svelte', 'frontend', 'framework']
  },
  'Next.js': {
    icon: '⚫',
    color: '#000000',
    category: 'Development',
    aliases: ['nextjs', 'next.js'],
    keywords: ['nextjs', 'react', 'ssr', 'framework']
  },
  'Nuxt': {
    icon: '🟢',
    color: '#00DC82',
    category: 'Development',
    aliases: ['nuxt', 'nuxt.js'],
    keywords: ['nuxt', 'vue', 'ssr', 'framework']
  },
  'Express': {
    icon: '⚡',
    color: '#000000',
    category: 'Development',
    aliases: ['express', 'expressjs'],
    keywords: ['express', 'nodejs', 'web-framework']
  },
  'FastAPI': {
    icon: '⚡',
    color: '#009485',
    category: 'Development',
    aliases: ['fastapi'],
    keywords: ['fastapi', 'python', 'api', 'web-framework']
  },
  'Django': {
    icon: '🟢',
    color: '#092E20',
    category: 'Development',
    aliases: ['django'],
    keywords: ['django', 'python', 'web-framework', 'orm']
  },
  'C++': {
    icon: '➕',
    color: '#00599C',
    category: 'Development',
    aliases: ['cpp', 'c++', 'cplusplus'],
    keywords: ['c++', 'cpp', 'systems-programming']
  },
  'C#': {
    icon: '#️⃣',
    color: '#239120',
    category: 'Development',
    aliases: ['csharp', 'c#', 'dotnet'],
    keywords: ['c#', 'csharp', 'dotnet', 'unity']
  },
  'Kotlin': {
    icon: '🟣',
    color: '#7F52FF',
    category: 'Development',
    aliases: ['kotlin'],
    keywords: ['kotlin', 'jvm', 'android']
  },

  // AI & ML (24+ 个)
  'OpenAI': {
    icon: '🤖',
    color: '#10A37F',
    category: 'AI/ML',
    aliases: ['openai', 'gpt', 'chatgpt'],
    keywords: ['openai', 'gpt', 'chatgpt', 'api', 'llm']
  },
  'Google': {
    icon: '🔍',
    color: '#4285F4',
    category: 'AI/ML',
    aliases: ['google', 'gemini', 'vertex-ai'],
    keywords: ['google', 'gemini', 'bard', 'cloud-ai', 'vertex']
  },
  'Anthropic': {
    icon: '🧠',
    color: '#9ACD32',
    category: 'AI/ML',
    aliases: ['anthropic', 'claude'],
    keywords: ['anthropic', 'claude', 'llm', 'api']
  },
  'Meta': {
    icon: '👥',
    color: '#0A66C2',
    category: 'AI/ML',
    aliases: ['meta', 'llama', 'facebook'],
    keywords: ['meta', 'llama', 'llama2', 'ai', 'facebook']
  },
  'TensorFlow': {
    icon: '🧡',
    color: '#FF6F00',
    category: 'AI/ML',
    aliases: ['tensorflow', 'tf'],
    keywords: ['tensorflow', 'machine-learning', 'deep-learning', 'keras']
  },
  'PyTorch': {
    icon: '🔥',
    color: '#EE4C2C',
    category: 'AI/ML',
    aliases: ['pytorch', 'torch'],
    keywords: ['pytorch', 'torch', 'machine-learning', 'deep-learning']
  },
  'Hugging Face': {
    icon: '🤗',
    color: '#FFD21E',
    category: 'AI/ML',
    aliases: ['huggingface', 'hf', 'transformers'],
    keywords: ['huggingface', 'transformers', 'nlp', 'models']
  },
  'Keras': {
    icon: '🔵',
    color: '#D00000',
    category: 'AI/ML',
    aliases: ['keras'],
    keywords: ['keras', 'deep-learning', 'tensorflow']
  },
  'Scikit-learn': {
    icon: '📚',
    color: '#F7931E',
    category: 'AI/ML',
    aliases: ['scikit-learn', 'sklearn'],
    keywords: ['scikit-learn', 'sklearn', 'machine-learning']
  },
  'Pandas': {
    icon: '🐼',
    color: '#150458',
    category: 'AI/ML',
    aliases: ['pandas', 'pd'],
    keywords: ['pandas', 'data-analysis', 'dataframe']
  },
  'NumPy': {
    icon: '🔢',
    color: '#013243',
    category: 'AI/ML',
    aliases: ['numpy', 'np'],
    keywords: ['numpy', 'numerical', 'arrays', 'python']
  },
  'Jupyter': {
    icon: '📓',
    color: '#F37726',
    category: 'AI/ML',
    aliases: ['jupyter', 'ipython'],
    keywords: ['jupyter', 'notebook', 'ipython', 'data-science']
  },
  'Kaggle': {
    icon: '📊',
    color: '#20BEFF',
    category: 'AI/ML',
    aliases: ['kaggle'],
    keywords: ['kaggle', 'competitions', 'datasets']
  },
  'Ollama': {
    icon: '🦙',
    color: '#FFFFFF',
    category: 'AI/ML',
    aliases: ['ollama'],
    keywords: ['ollama', 'local-llm', 'inference']
  },
  'LangChain': {
    icon: '⛓️',
    color: '#123456',
    category: 'AI/ML',
    aliases: ['langchain'],
    keywords: ['langchain', 'llm', 'framework', 'chains']
  },
  'LlamaIndex': {
    icon: '🦙',
    color: '#000000',
    category: 'AI/ML',
    aliases: ['llamaindex', 'gpt-index'],
    keywords: ['llamaindex', 'rag', 'indexing', 'retrieval']
  },
  'Vertex AI': {
    icon: '📊',
    color: '#4285F4',
    category: 'AI/ML',
    aliases: ['vertex-ai', 'vertexai'],
    keywords: ['vertex', 'google-cloud', 'ml', 'training']
  },
  'Weights & Biases': {
    icon: '⚖️',
    color: '#FFBE00',
    category: 'AI/ML',
    aliases: ['wandb', 'weights-and-biases'],
    keywords: ['wandb', 'experiment-tracking', 'ml-ops']
  },
  'MLflow': {
    icon: '🔄',
    color: '#0194E2',
    category: 'AI/ML',
    aliases: ['mlflow'],
    keywords: ['mlflow', 'ml-tracking', 'models']
  },
  'Colab': {
    icon: '🔬',
    color: '#F9AB00',
    category: 'AI/ML',
    aliases: ['colab', 'google-colab'],
    keywords: ['colab', 'jupyter', 'gpu', 'google']
  },

  // Creative & Design (16+ 个)
  'Figma': {
    icon: '✏️',
    color: '#F24E1E',
    category: 'Creative',
    aliases: ['figma'],
    keywords: ['figma', 'design', 'ui', 'ux', 'prototyping']
  },
  'Adobe': {
    icon: '🎨',
    color: '#FF0000',
    category: 'Creative',
    aliases: ['adobe', 'photoshop', 'illustrator', 'xd', 'premiere'],
    keywords: ['adobe', 'photoshop', 'illustrator', 'xd', 'creative-cloud']
  },
  'Sketch': {
    icon: '🎭',
    color: '#F7931E',
    category: 'Creative',
    aliases: ['sketch'],
    keywords: ['sketch', 'design', 'ui', 'macos']
  },
  'Blender': {
    icon: '🎬',
    color: '#EA7600',
    category: 'Creative',
    aliases: ['blender'],
    keywords: ['blender', '3d', 'modeling', 'animation', 'rendering']
  },
  'Canva': {
    icon: '🖼️',
    color: '#00C4CC',
    category: 'Creative',
    aliases: ['canva'],
    keywords: ['canva', 'design', 'graphics', 'templates']
  },
  'Inkscape': {
    icon: '🎨',
    color: '#000000',
    category: 'Creative',
    aliases: ['inkscape'],
    keywords: ['inkscape', 'vector', 'graphics', 'svg']
  },
  'GIMP': {
    icon: '🐕',
    color: '#8F8F8F',
    category: 'Creative',
    aliases: ['gimp'],
    keywords: ['gimp', 'image-editor', 'raster', 'graphics']
  },
  'Krita': {
    icon: '🎨',
    color: '#2DADE6',
    category: 'Creative',
    aliases: ['krita'],
    keywords: ['krita', 'painting', 'digital-art', 'drawing']
  },
  'Procreate': {
    icon: '✏️',
    color: '#623DEA',
    category: 'Creative',
    aliases: ['procreate'],
    keywords: ['procreate', 'ipad', 'painting', 'drawing']
  },
  'Cinema 4D': {
    icon: '🎬',
    color: '#011A6A',
    category: 'Creative',
    aliases: ['cinema-4d', 'c4d'],
    keywords: ['cinema-4d', '3d', 'animation', 'modeling']
  },
  'Maya': {
    icon: '🎬',
    color: '#0696D7',
    category: 'Creative',
    aliases: ['maya'],
    keywords: ['maya', '3d', 'animation', 'modeling', 'autodesk']
  },
  '3ds Max': {
    icon: '🎬',
    color: '#00A4EF',
    category: 'Creative',
    aliases: ['3ds-max', '3dsmax'],
    keywords: ['3ds', 'max', '3d', 'modeling', 'animation']
  },
  'Unreal Engine': {
    icon: '🎮',
    color: '#0E1116',
    category: 'Creative',
    aliases: ['unreal', 'ue4', 'ue5'],
    keywords: ['unreal', 'engine', 'game-dev', '3d']
  },
  'Unity': {
    icon: '🎮',
    color: '#FFFFFF',
    category: 'Creative',
    aliases: ['unity'],
    keywords: ['unity', 'game-dev', 'game-engine', 'c#']
  },
  'Godot': {
    icon: '🎮',
    color: '#478CBF',
    category: 'Creative',
    aliases: ['godot'],
    keywords: ['godot', 'game-engine', 'game-dev', 'gpl']
  },

  // Productivity (12+ 个)
  'Microsoft': {
    icon: '🪟',
    color: '#0078D4',
    category: 'Productivity',
    aliases: ['microsoft', 'ms', 'office', 'outlook', 'teams'],
    keywords: ['microsoft', 'office', 'outlook', 'teams', 'word', 'excel']
  },
  'Google': {
    icon: '🔍',
    color: '#4285F4',
    category: 'Productivity',
    aliases: ['google', 'gsuite', 'workspace'],
    keywords: ['google', 'gsuite', 'workspace', 'gmail', 'drive', 'docs']
  },
  'Notion': {
    icon: '📝',
    color: '#000000',
    category: 'Productivity',
    aliases: ['notion'],
    keywords: ['notion', 'wiki', 'database', 'productivity']
  },
  'Slack': {
    icon: '💬',
    color: '#36C5F0',
    category: 'Productivity',
    aliases: ['slack'],
    keywords: ['slack', 'chat', 'messaging', 'team-communication']
  },
  'Jira': {
    icon: '📊',
    color: '#0052CC',
    category: 'Productivity',
    aliases: ['jira', 'atlassian'],
    keywords: ['jira', 'issue-tracking', 'project-management', 'atlassian']
  },
  'Asana': {
    icon: '📋',
    color: '#F26522',
    category: 'Productivity',
    aliases: ['asana'],
    keywords: ['asana', 'task-management', 'project-management']
  },
  'Trello': {
    icon: '📇',
    color: '#0079BF',
    category: 'Productivity',
    aliases: ['trello'],
    keywords: ['trello', 'kanban', 'board', 'task-management']
  },
  'Monday.com': {
    icon: '📅',
    color: '#00A4EF',
    category: 'Productivity',
    aliases: ['monday', 'mondaycom'],
    keywords: ['monday', 'project-management', 'workflow']
  },
  'Zoom': {
    icon: '📹',
    color: '#0B5CFF',
    category: 'Productivity',
    aliases: ['zoom'],
    keywords: ['zoom', 'video-conferencing', 'meeting']
  },
  'Confluence': {
    icon: '📚',
    color: '#0052CC',
    category: 'Productivity',
    aliases: ['confluence', 'atlassian'],
    keywords: ['confluence', 'documentation', 'wiki', 'atlassian']
  },
  'Linear': {
    icon: '📈',
    color: '#5E6AD2',
    category: 'Productivity',
    aliases: ['linear'],
    keywords: ['linear', 'issue-tracking', 'project-management']
  },
  'Figma': {
    icon: '✏️',
    color: '#F24E1E',
    category: 'Productivity',
    aliases: ['figma'],
    keywords: ['figma', 'design-collaboration', 'prototyping']
  },

  // Communication (8+ 个)
  'Discord': {
    icon: '💜',
    color: '#5865F2',
    category: 'Communication',
    aliases: ['discord'],
    keywords: ['discord', 'chat', 'gaming', 'communities']
  },
  'Telegram': {
    icon: '✈️',
    color: '#0088cc',
    category: 'Communication',
    aliases: ['telegram'],
    keywords: ['telegram', 'messaging', 'bot', 'api']
  },
  'Matrix': {
    icon: '🟢',
    color: '#000000',
    category: 'Communication',
    aliases: ['matrix', 'element'],
    keywords: ['matrix', 'element', 'messaging', 'federated']
  },
  'WhatsApp': {
    icon: '💬',
    color: '#25D366',
    category: 'Communication',
    aliases: ['whatsapp'],
    keywords: ['whatsapp', 'messaging', 'mobile']
  },
  'Signal': {
    icon: '🔐',
    color: '#3A76F0',
    category: 'Communication',
    aliases: ['signal'],
    keywords: ['signal', 'encrypted', 'messaging', 'privacy']
  },
  'Mastodon': {
    icon: '🐘',
    color: '#6364FF',
    category: 'Communication',
    aliases: ['mastodon'],
    keywords: ['mastodon', 'social-media', 'federated', 'ActivityPub']
  },
  'Email': {
    icon: '📧',
    color: '#EA4335',
    category: 'Communication',
    aliases: ['email', 'smtp', 'imap'],
    keywords: ['email', 'mail', 'smtp', 'imap', 'pop3']
  },

  // Internal & Custom (2 个)
  'Hermes': {
    icon: '⚙️',
    color: '#8B5CF6',
    category: 'Internal',
    aliases: ['hermes', 'hermes-agent'],
    keywords: ['hermes', 'agent', 'skill', 'framework']
  },
  'HuHaa': {
    icon: '⭐',
    color: '#FFD700',
    category: 'Internal',
    aliases: ['huhaa', 'myskills'],
    keywords: ['huhaa', 'myskills', 'project']
  },
};

/**
 * 获取品牌信息
 */
export function getBrand(name) {
  // 直接匹配
  if (COMPLETE_BRANDS[name]) {
    return COMPLETE_BRANDS[name];
  }

  // 转小写后匹配
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(COMPLETE_BRANDS)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
    // 检查别名
    if (value.aliases && value.aliases.includes(lower)) {
      return value;
    }
  }

  return null;
}

/**
 * 根据关键词识别品牌
 */
export function identifyBrandByKeywords(text) {
  if (!text) return null;

  const lower = text.toLowerCase();

  for (const [name, brand] of Object.entries(COMPLETE_BRANDS)) {
    // 检查别名
    if (brand.aliases) {
      for (const alias of brand.aliases) {
        if (lower.includes(alias)) {
          return name;
        }
      }
    }
    // 检查关键字
    if (brand.keywords) {
      for (const keyword of brand.keywords) {
        if (lower.includes(keyword)) {
          return name;
        }
      }
    }
  }

  return null;
}

/**
 * 获取所有品牌的分类
 */
export function getBrandsByCategory(category) {
  return Object.entries(COMPLETE_BRANDS).reduce((acc, [name, brand]) => {
    if (brand.category === category) {
      acc[name] = brand;
    }
    return acc;
  }, {});
}

/**
 * 获取所有分类
 */
export function getAllCategories() {
  const categories = new Set();
  for (const brand of Object.values(COMPLETE_BRANDS)) {
    categories.add(brand.category);
  }
  return Array.from(categories).sort();
}

/**
 * 统计品牌数量
 */
export function countBrands() {
  return Object.keys(COMPLETE_BRANDS).length;
}

export default {
  COMPLETE_BRANDS,
  getBrand,
  identifyBrandByKeywords,
  getBrandsByCategory,
  getAllCategories,
  countBrands,
};
