/**
 * useSidebarMenu.ts
 * 菜单状态管理 + localStorage 持久化
 */

import { useState, useEffect } from 'react';

export interface MenuState {
  tier1Expanded: boolean;
  tier2Expanded: boolean;
  tier3Expanded: boolean;
  collapsedBrands: Set<string>; // Tier 1 内部折叠的编辑器品牌
}

const STORAGE_KEY = 'huhaa-menu-state-v4';

export function useSidebarMenu() {
  const [menuState, setMenuState] = useState<MenuState>(() => {
    // 从 localStorage 恢复
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          tier1Expanded: parsed.tier1Expanded ?? true,
          tier2Expanded: parsed.tier2Expanded ?? true,
          tier3Expanded: parsed.tier3Expanded ?? false,
          collapsedBrands: new Set(parsed.collapsedBrands ?? []),
        };
      } catch {
        // 解析失败，使用默认值
      }
    }
    return {
      tier1Expanded: true,
      tier2Expanded: true,
      tier3Expanded: false,
      collapsedBrands: new Set(),
    };
  });

  // 持久化到 localStorage
  useEffect(() => {
    const toStore = {
      tier1Expanded: menuState.tier1Expanded,
      tier2Expanded: menuState.tier2Expanded,
      tier3Expanded: menuState.tier3Expanded,
      collapsedBrands: Array.from(menuState.collapsedBrands),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [menuState]);

  const toggleTier1 = () =>
    setMenuState(s => ({ ...s, tier1Expanded: !s.tier1Expanded }));

  const toggleTier2 = () =>
    setMenuState(s => ({ ...s, tier2Expanded: !s.tier2Expanded }));

  const toggleTier3 = () =>
    setMenuState(s => ({ ...s, tier3Expanded: !s.tier3Expanded }));

  const toggleBrand = (brand: string) =>
    setMenuState(s => {
      const brands = new Set(s.collapsedBrands);
      if (brands.has(brand)) {
        brands.delete(brand);
      } else {
        brands.add(brand);
      }
      return { ...s, collapsedBrands: brands };
    });

  return { menuState, toggleTier1, toggleTier2, toggleTier3, toggleBrand };
}
