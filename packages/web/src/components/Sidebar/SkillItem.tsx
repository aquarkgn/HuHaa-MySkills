/**
 * SkillItem.tsx
 * 单个技能项组件
 */

'use client';

import { SkillItem } from '@/types';

interface SkillItemComponentProps {
  skill: SkillItem;
  indent?: boolean;
  onSelectSkill?: (skillId: string) => void;
}

export default function SkillItemComponent({
  skill,
  indent = false,
  onSelectSkill,
}: SkillItemComponentProps) {
  return (
    <button
      onClick={() => onSelectSkill?.(skill.id)}
      className={`w-full text-left px-4 py-2 hover:bg-hover transition-colors truncate ${
        indent ? 'pl-12' : ''
      }`}
      title={skill.name}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* 技能 icon */}
        {skill.iconUrl && (
          <img
            src={skill.iconUrl}
            alt=""
            className="w-4 h-4 rounded flex-shrink-0"
            loading="lazy"
          />
        )}
        {skill.iconFallback && !skill.iconUrl && (
          <span className="text-sm flex-shrink-0">{skill.iconFallback}</span>
        )}
        {!skill.iconUrl && !skill.iconFallback && (
          <span className="text-sm flex-shrink-0">📄</span>
        )}
        {/* 技能名称 */}
        <span className="text-sm truncate">{skill.name}</span>
      </div>
    </button>
  );
}
