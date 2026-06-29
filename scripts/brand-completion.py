#!/usr/bin/env python3
"""
品牌自动识别和补全脚本 (v2 - 增强版)
扫描所有 Hermes 技能，基于技能名称、描述和类别自动识别品牌
"""

import os
import re
import json
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# 增强的品牌识别规则
BRAND_RULES = {
    'GitHub': {
        'patterns': [r'\bgithub\b', r'git-hub', r'gh-action', r'release-automation', r'github-pr'],
        'aliases': ['github']
    },
    'Docker': {
        'patterns': [r'\bdocker\b', r'docker-compose', r'dockerfile', r'containerization'],
        'aliases': ['docker']
    },
    'Kubernetes': {
        'patterns': [r'\bk8s\b', r'kubernetes', r'kubes', r'helm', r'k8s-private'],
        'aliases': ['kubernetes', 'k8s']
    },
    'AWS': {
        'patterns': [r'\baws\b', r'amazon', r'ec2', r's3', r'lambda', r'cloudformation'],
        'aliases': ['aws']
    },
    'Linux': {
        'patterns': [r'\blinux\b', r'ubuntu', r'debian', r'centos', r'rhel', r'fedora', r'gnu/linux', r'bash', r'systemd'],
        'aliases': ['linux', 'ubuntu', 'debian', 'centos']
    },
    'Python': {
        'patterns': [r'\bpython\b', r'py\d', r'\bpy\b', r'django', r'flask', r'fastapi', r'pip', r'peft', r'jupyter'],
        'aliases': ['python', 'py']
    },
    'Node.js': {
        'patterns': [r'node\.?js', r'nodejs', r'npm\b', r'express', r'vite'],
        'aliases': ['nodejs', 'node', 'npm']
    },
    'Go': {
        'patterns': [r'\bgo\b(?!ogle)', r'golang', r'goroutine'],
        'aliases': ['go', 'golang']
    },
    'Rust': {
        'patterns': [r'(\brust\b|cargo|\.rs\b)(?![a-z])'],
        'aliases': ['rust', 'cargo']
    },
    'Java': {
        'patterns': [r'\bjava\b', r'jvm', r'spring', r'maven'],
        'aliases': ['java', 'jvm']
    },
    'OpenAI': {
        'patterns': [r'\bopenai\b', r'chatgpt', r'gpt-\d', r'davinci', r'whisper'],
        'aliases': ['openai', 'gpt', 'chatgpt', 'whisper']
    },
    'Anthropic': {
        'patterns': [r'\banthrop\w+', r'\bclaude\b', r'custom-anthropic'],
        'aliases': ['anthropic', 'claude']
    },
    'Google': {
        'patterns': [r'\bgoogle\b', r'gemini', r'bard', r'vertex', r'colab', r'youtube'],
        'aliases': ['google', 'gemini']
    },
    'Meta': {
        'patterns': [r'\bmeta\b', r'\bllama\b', r'facebook', r'llama-cpp', r'gguf'],
        'aliases': ['meta', 'llama']
    },
    'TensorFlow': {
        'patterns': [r'tensorflow', r'keras\b'],
        'aliases': ['tensorflow']
    },
    'PyTorch': {
        'patterns': [r'pytorch', r'\btorch\b', r'fsdp'],
        'aliases': ['pytorch', 'torch']
    },
    'Apple': {
        'patterns': [r'\bapple\b', r'macos', r'ios\b', r'swift', r'xcode', r'reminders', r'imessage', r'findmy'],
        'aliases': ['apple', 'ios', 'macos', 'swift']
    },
    'React': {
        'patterns': [r'\breact\b', r'reactjs', r'jsx', r'next\.js', r'react-router', r'react-multi'],
        'aliases': ['react', 'reactjs']
    },
    'Vue': {
        'patterns': [r'\bvue\b', r'vuejs', r'nuxt', r'vue3-', r'vue-vite', r'pinia'],
        'aliases': ['vue', 'vuejs']
    },
    'Svelte': {
        'patterns': [r'\bsvelte\b', r'astro-vercel'],
        'aliases': ['svelte']
    },
    'TypeScript': {
        'patterns': [r'typescript', r'\.ts\b', r'tsc'],
        'aliases': ['typescript', 'ts']
    },
    'Terraform': {
        'patterns': [r'terraform', r'\.tf\b'],
        'aliases': ['terraform']
    },
    'Ansible': {
        'patterns': [r'\bansible\b'],
        'aliases': ['ansible']
    },
    'Jenkins': {
        'patterns': [r'\bjenkins\b', r'ci/cd', r'continuous-integration'],
        'aliases': ['jenkins']
    },
    'GitLab': {
        'patterns': [r'\bgitlab\b'],
        'aliases': ['gitlab']
    },
    'Figma': {
        'patterns': [r'\bfigma\b'],
        'aliases': ['figma']
    },
    'Slack': {
        'patterns': [r'\bslack\b'],
        'aliases': ['slack']
    },
    'Notion': {
        'patterns': [r'\bnotion\b'],
        'aliases': ['notion']
    },
    'Jira': {
        'patterns': [r'\bjira\b', r'atlassian'],
        'aliases': ['jira']
    },
    'PostgreSQL': {
        'patterns': [r'postgres', r'postgresql', r'psql'],
        'aliases': ['postgres', 'postgresql']
    },
    'MySQL': {
        'patterns': [r'\bmysql\b'],
        'aliases': ['mysql', 'sql']
    },
    'MongoDB': {
        'patterns': [r'mongodb', r'mongo\b'],
        'aliases': ['mongodb', 'mongo']
    },
    'Redis': {
        'patterns': [r'\bredis\b'],
        'aliases': ['redis']
    },
    'Elasticsearch': {
        'patterns': [r'elasticsearch', r'elk'],
        'aliases': ['elasticsearch']
    },
    'Prometheus': {
        'patterns': [r'prometheus'],
        'aliases': ['prometheus']
    },
    'Grafana': {
        'patterns': [r'grafana'],
        'aliases': ['grafana']
    },
    'Hermes': {
        'patterns': [r'\bhermes\b', r'hermes-agent', r'huhaa-myskills'],
        'aliases': ['hermes']
    },
    'Hugging Face': {
        'patterns': [r'huggingface', r'hugging.face', r'huggingface-hub'],
        'aliases': ['huggingface']
    },
    'ComfyUI': {
        'patterns': [r'comfyui', r'comfy'],
        'aliases': ['comfyui', 'comfy']
    },
    'Suno': {
        'patterns': [r'suno\b', r'heartmula', r'music.generation', r'audiocraft'],
        'aliases': ['suno', 'heartmula']
    },
    'Midjourney': {
        'patterns': [r'midjourney'],
        'aliases': ['midjourney']
    },
    'Stable Diffusion': {
        'patterns': [r'stable.diffusion', r'diffusion(?!s)', r'axolotl'],
        'aliases': ['stable-diffusion']
    },
    'dspy': {
        'patterns': [r'\bdspy\b'],
        'aliases': ['dspy']
    },
    'LangChain': {
        'patterns': [r'langchain'],
        'aliases': ['langchain']
    },
    'LlamaIndex': {
        'patterns': [r'llamaindex', r'gpt-index'],
        'aliases': ['llamaindex']
    },
    'Modal': {
        'patterns': [r'\bmodal\b'],
        'aliases': ['modal']
    },
    'Jupyter': {
        'patterns': [r'jupyter', r'ipython'],
        'aliases': ['jupyter']
    },
    'Obsidian': {
        'patterns': [r'obsidian\b'],
        'aliases': ['obsidian']
    },
    'Excalidraw': {
        'patterns': [r'excalidraw'],
        'aliases': ['excalidraw']
    },
    'Manim': {
        'patterns': [r'manim\b'],
        'aliases': ['manim']
    },
    'Blender': {
        'patterns': [r'blender'],
        'aliases': ['blender']
    },
    'GIMP': {
        'patterns': [r'\bgimp\b'],
        'aliases': ['gimp']
    },
    'Krita': {
        'patterns': [r'krita\b'],
        'aliases': ['krita']
    },
    'P5.js': {
        'patterns': [r'p5js', r'p5\.js'],
        'aliases': ['p5js']
    },
    'Unity': {
        'patterns': [r'\bunity\b', r'gamedev'],
        'aliases': ['unity']
    },
    'Godot': {
        'patterns': [r'\bgodot\b'],
        'aliases': ['godot']
    },
    'Unreal': {
        'patterns': [r'unreal\b', r'ue\d'],
        'aliases': ['unreal']
    },
    'Minecraft': {
        'patterns': [r'minecraft', r'mcporter'],
        'aliases': ['minecraft']
    },
    'OpenStreetMap': {
        'patterns': [r'openstreetmap', r'osrm', r'maps'],
        'aliases': ['osm', 'openstreetmap']
    },
    'RSS': {
        'patterns': [r'rss\b', r'feed', r'atom\b', r'blogwatch'],
        'aliases': ['rss', 'feed']
    },
    'Email': {
        'patterns': [r'\bemail\b', r'smtp\b', r'imap\b', r'himalaya', r'powerpoint'],
        'aliases': ['email', 'smtp']
    },
    'Telegram': {
        'patterns': [r'telegram', r'dingtalk'],
        'aliases': ['telegram', 'dingtalk']
    },
    'OpenHue': {
        'patterns': [r'hue\b', r'openhue'],
        'aliases': ['hue', 'openhue']
    },
    'Airtable': {
        'patterns': [r'airtable'],
        'aliases': ['airtable']
    },
    'TouchDesigner': {
        'patterns': [r'touchdesigner'],
        'aliases': ['touchdesigner']
    },
    'Ollama': {
        'patterns': [r'ollama'],
        'aliases': ['ollama']
    },
    'HuHaa': {
        'patterns': [r'huhaa', r'myskills'],
        'aliases': ['huhaa']
    },
    'X': {
        'patterns': [r'xitter', r'xurl'],
        'aliases': ['twitter', 'x']
    },
    'Discord': {
        'patterns': [r'discord', r'team.communication'],
        'aliases': ['discord']
    },
    'Segment Anything': {
        'patterns': [r'segment.anything', r'sam\b'],
        'aliases': ['sam', 'segment-anything']
    },
    'CLIP': {
        'patterns': [r'\bclip\b(?!py)'],
        'aliases': ['clip']
    },
    'VLLM': {
        'patterns': [r'vllm'],
        'aliases': ['vllm']
    },
    'TRL': {
        'patterns': [r'trl\b', r'trl-fine-tuning'],
        'aliases': ['trl']
    },
    'PEFT': {
        'patterns': [r'\bpeft\b'],
        'aliases': ['peft']
    },
    'Unsloth': {
        'patterns': [r'unsloth'],
        'aliases': ['unsloth']
    },
    'Weights & Biases': {
        'patterns': [r'weights.and.biases', r'wandb'],
        'aliases': ['wandb']
    },
    'Guidance': {
        'patterns': [r'\bguidance\b(?!-?)'],
        'aliases': ['guidance']
    },
    'Outlines': {
        'patterns': [r'\boutlines\b'],
        'aliases': ['outlines']
    },
    'MCP': {
        'patterns': [r'\bmcp\b', r'native-mcp'],
        'aliases': ['mcp']
    },
    'Proxy': {
        'patterns': [r'proxy', r'clash', r'sing-box', r'hysteria', r'webhook'],
        'aliases': ['proxy']
    },
    'Development': {
        'patterns': [r'code-review', r'debugg', r'test-driven', r'phased-engineering', r'systematic'],
        'aliases': ['development']
    },
    'Design': {
        'patterns': [r'design-md', r'architecture-diagram', r'pretext', r'web-design', r'svg'],
        'aliases': ['design']
    },
    'Creativity': {
        'patterns': [r'creative-ideation', r'humanizer', r'ascii-art', r'ascii-video', r'baoyu-infographic'],
        'aliases': ['creative']
    },
    'OCR': {
        'patterns': [r'ocr\b', r'nano-pdf', r'pdf'],
        'aliases': ['ocr']
    },
}

# 基于类别的默认品牌
CATEGORY_BRAND_MAP = {
    'devops': 'Docker',
    'software-development': 'Development',
    'creative': 'Design',
    'gaming': 'Unity',
    'media': 'Google',
    'research': 'Google',
    'productivity': 'Notion',
    'mlops': 'PyTorch',
    'models': 'Hugging Face',
    'training': 'PyTorch',
    'evaluation': 'Weights & Biases',
    'inference': 'LlamaIndex',
    'red-teaming': 'Anthropic',
}

def clean_text(text):
    """清理文本用于匹配"""
    if not text:
        return ""
    return re.sub(r'[^a-z0-9\s\-_.]', '', text.lower())

def identify_brand(skill_name, skill_description="", category=""):
    """基于技能名称、描述和类别识别品牌"""
    text_to_search = clean_text(f"{skill_name} {skill_description}")
    
    matched_brands = []
    for brand, rule in BRAND_RULES.items():
        for pattern in rule['patterns']:
            try:
                if re.search(pattern, text_to_search, re.IGNORECASE):
                    matched_brands.append(brand)
                    break
            except re.error:
                pass
    
    # 优先返回第一个匹配的品牌
    if matched_brands:
        return matched_brands[0]
    
    # 如果没有匹配，使用类别默认品牌
    if category and category in CATEGORY_BRAND_MAP:
        return CATEGORY_BRAND_MAP[category]
    
    return None

def read_skill_metadata(skill_path):
    """读取 SKILL.md 文件的 frontmatter"""
    try:
        with open(skill_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
        if match:
            fm_text = match.group(1)
            metadata = {}
            for line in fm_text.split('\n'):
                if ':' in line and not line.startswith(' '):
                    key, val = line.split(':', 1)
                    key = key.strip()
                    val = val.strip()
                    if val.startswith('"') and val.endswith('"'):
                        val = val[1:-1]
                    elif val.startswith("'") and val.endswith("'"):
                        val = val[1:-1]
                    metadata[key] = val
            return metadata
    except:
        pass
    
    return {}

def update_skill_metadata(skill_path, brand):
    """更新 SKILL.md 的 frontmatter 添加 brand 字段"""
    try:
        with open(skill_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        match = re.match(r'^(---\n.*?\n---\n)', content, re.DOTALL)
        if match:
            frontmatter = match.group(1)
            rest = content[len(frontmatter):]
            
            if 'brand:' not in frontmatter:
                fm_lines = frontmatter.rstrip('-\n').rstrip() + f'\nbrand: {brand}\n---\n'
                new_content = fm_lines + rest
                
                with open(skill_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                return True
    except:
        pass
    
    return False

def scan_skills(skills_dir):
    """扫描所有技能并识别品牌"""
    results = {
        'total': 0,
        'with_brand': 0,
        'newly_added': 0,
        'brands': defaultdict(int),
        'skills_by_brand': defaultdict(list),
        'failures': []
    }
    
    for root, dirs, files in os.walk(skills_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        
        if 'SKILL.md' in files:
            skill_path = os.path.join(root, 'SKILL.md')
            skill_name = os.path.basename(root)
            category = os.path.basename(os.path.dirname(root))
            
            results['total'] += 1
            
            try:
                metadata = read_skill_metadata(skill_path)
                
                if 'brand' in metadata:
                    results['with_brand'] += 1
                    brand = metadata['brand']
                else:
                    description = metadata.get('description', '')
                    brand = identify_brand(skill_name, description, category)
                    
                    if brand:
                        if update_skill_metadata(skill_path, brand):
                            results['newly_added'] += 1
                        else:
                            results['failures'].append({
                                'skill': skill_name,
                                'reason': 'Failed to update metadata'
                            })
                            continue
                    else:
                        continue
                
                if brand:
                    results['brands'][brand] += 1
                    results['skills_by_brand'][brand].append(skill_name)
            
            except Exception as e:
                results['failures'].append({
                    'skill': skill_name,
                    'reason': str(e)
                })
    
    return results

def generate_report(results, output_file=None):
    """生成补全报告"""
    report = []
    report.append("=" * 70)
    report.append("品牌补全报告 (Brand Completion Report)")
    report.append("=" * 70)
    report.append(f"\n生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    report.append("📊 补全统计:\n")
    report.append(f"  总技能数:        {results['total']:3d} 个")
    report.append(f"  已有品牌标记:    {results['with_brand']:3d} 个")
    report.append(f"  新增品牌标记:    {results['newly_added']:3d} 个")
    
    before_percentage = (results['with_brand'] / results['total'] * 100) if results['total'] > 0 else 0
    after_percentage = ((results['with_brand'] + results['newly_added']) / results['total'] * 100) if results['total'] > 0 else 0
    
    report.append(f"\n  补全前: {results['with_brand']}/{results['total']} ({before_percentage:.1f}%)")
    report.append(f"  补全后: {results['with_brand'] + results['newly_added']}/{results['total']} ({after_percentage:.1f}%)")
    report.append(f"  提升:   +{results['newly_added']} 个 ({after_percentage - before_percentage:+.1f}%)\n")
    
    if results['brands']:
        report.append("🏷️  Top 25 品牌分布:\n")
        
        sorted_brands = sorted(results['brands'].items(), key=lambda x: x[1], reverse=True)
        for i, (brand, count) in enumerate(sorted_brands[:25], 1):
            report.append(f"  {i:2d}. {brand:25s} : {count:3d} 个")
        
        report.append(f"\n  总计: {len(results['brands'])} 个不同品牌\n")
    
    if results['failures']:
        report.append(f"❌ 失败: {len(results['failures'])} 项\n")
        for fail in results['failures'][:10]:
            report.append(f"  - {fail['skill']}: {fail['reason']}")
        if len(results['failures']) > 10:
            report.append(f"  ... 还有 {len(results['failures']) - 10} 项")
        report.append()
    
    report.append("=" * 70)
    
    report_text = '\n'.join(report)
    print(report_text)
    
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report_text)
    
    return report_text

def main():
    skills_dir = os.path.expanduser('~/.hermes/skills')
    
    if not os.path.exists(skills_dir):
        print(f"❌ 技能目录不存在: {skills_dir}")
        sys.exit(1)
    
    print(f"📁 正在扫描技能目录: {skills_dir}")
    print("⏳ 这可能需要几秒钟...\n")
    
    results = scan_skills(skills_dir)
    
    output_file = os.path.expanduser('~/Project/HuHaa-MySkills/BRANDING_COMPLETION_REPORT.txt')
    generate_report(results, output_file)
    
    json_output = os.path.expanduser('~/Project/HuHaa-MySkills/branding-results.json')
    json_data = {
        'timestamp': datetime.now().isoformat(),
        'total': results['total'],
        'with_brand': results['with_brand'],
        'newly_added': results['newly_added'],
        'brands': dict(results['brands']),
        'skills_by_brand': {k: sorted(v) for k, v in results['skills_by_brand'].items()},
        'failures': results['failures']
    }
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ 报告已保存到: {output_file}")
    print(f"✅ JSON 数据已保存到: {json_output}")

if __name__ == '__main__':
    main()
