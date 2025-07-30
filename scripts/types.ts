export interface CraftResource {
    uniqueName: string;
    count: number;
}

export interface CraftingRequirements {
    time: number;
    silver: number | null;
    craftingFocus: number;
    craftResourceList: CraftResource[];
}

export interface Enchantment {
    enchantmentLevel: number;
    itemPower: number;
    durability: number;
    craftingRequirements: CraftingRequirements;
}

export interface Enchantments {
    enchantments: Enchantment[];
}

export interface LocalizedNames {
    "IT-IT": string;
    "RU-RU": string;
    "PL-PL": string;
    "TR-TR": string;
    "ID-ID": string;
    "FR-FR": string;
    "JA-JP": string;
    "EN-US": string;
    "DE-DE": string;
    "AR-SA": string;
    "KO-KR": string;
    "PT-BR": string;
    "ZH-TW": string;
    "ES-ES": string;
    "ZH-CN": string;
}

export interface AlbionItemInfo {
    itemType: string;
    uniqueName: string;
    uiSprite: string;
    uiSpriteOverlay1: string | null;
    uiSpriteOverlay2: string | null;
    uiSpriteOverlay3: string | null;
    uiAtlas: string | null;
    showinmarketplace: boolean;
    level: number;
    tier: number;
    enchantmentLevel: number;
    categoryId: string;
    categoryName: string;
    revision: number;
    enchantments: Enchantments | null; // Can be null if no enchantments
    activeSlots: Record<string, never>; // Represents an empty object {}
    passiveSlots: Record<string, never>; // Represents an empty object {}
    localizedNames: LocalizedNames;
    localizedDescriptions: string | null;
    slotType: string;
    physicalAttackDamageBonus: number | null; // Changed to number | null as it could be null
    skinCount: number | null;
    physicalArmor: number;
    magicResistance: number;
    magicAttackDamageBonus: number | null;
    activeSpellSlots: number;
    passiveSpellSlots: number;
    itemPowerProgressionType: string;
    craftingRequirements: CraftingRequirements | null; // Can be null if no crafting requirements
    spriteName: string;
    stackable: boolean;
    equipable: boolean;
}