export enum TraitType {
    BACKGROUND = 0,
    BASE = 1,
    EYE = 2,
    MOUTH = 3,
    CLOTHING = 4,
    HAIR = 5,
    ACCESSORY = 6,
}

export interface Trait {
    id: number;
    type: TraitType;
    name: string;
    image: string;
}

// Our main contract address
const TraitContract = {
    default: process.env.TRAIT_CONTRACT_ADDRESS as `0x${string}`,
};

type TraitContractKeys = keyof typeof TraitContract;

// Reverse lookup of contract addresses to names
export const ReverseTraitContract: { [key: `0x${string}`]: TraitContractKeys } = {};
for (const key in TraitContract) {
    const value = TraitContract[key as keyof typeof TraitContract];
    ReverseTraitContract[value] = key as TraitContractKeys;
}

// Contract labels for UI
export const contractLabels: {
    [key in TraitContractKeys]: string;
} = {
    default: 'Base Collection',
};

// Define traits
const traitDefinitions: Record<number, Trait> = {
    // BACKGROUND
    1: { id: 1, type: TraitType.BACKGROUND, name: 'Sky Blue', image: 'background/skyblue.svg' },
    2: { id: 2, type: TraitType.BACKGROUND, name: 'Sunset', image: 'background/sunset.svg' },
    3: { id: 3, type: TraitType.BACKGROUND, name: 'Forest', image: 'background/forest.svg' },
    4: { id: 4, type: TraitType.BACKGROUND, name: 'Desert', image: 'background/desert.svg' },

    // BASE
    11: { id: 11, type: TraitType.BASE, name: 'Light Skin', image: 'base/lightskin.svg' },
    12: { id: 12, type: TraitType.BASE, name: 'Dark Skin', image: 'base/darkskin.svg' },
    13: { id: 13, type: TraitType.BASE, name: 'Alien', image: 'base/alien.svg' },

    // EYE
    21: { id: 21, type: TraitType.EYE, name: 'Round Eyes', image: 'eye/round.svg' },
    22: { id: 22, type: TraitType.EYE, name: 'Narrow Eyes', image: 'eye/narrow.svg' },
    23: { id: 23, type: TraitType.EYE, name: 'Starry Eyes', image: 'eye/starry.svg' },

    // MOUTH
    31: { id: 31, type: TraitType.MOUTH, name: 'Smile', image: 'mouth/smile.svg' },
    32: { id: 32, type: TraitType.MOUTH, name: 'Frown', image: 'mouth/frown.svg' },
    33: { id: 33, type: TraitType.MOUTH, name: 'Surprised', image: 'mouth/surprised.svg' },

    // CLOTHING
    41: { id: 41, type: TraitType.CLOTHING, name: 'T-Shirt', image: 'clothing/tshirt.svg' },
    42: { id: 42, type: TraitType.CLOTHING, name: 'Jacket', image: 'clothing/jacket.svg' },
    43: { id: 43, type: TraitType.CLOTHING, name: 'Sweater', image: 'clothing/sweater.svg' },

    // HAIR
    51: { id: 51, type: TraitType.HAIR, name: 'Short Hair', image: 'hair/short.svg' },
    52: { id: 52, type: TraitType.HAIR, name: 'Curly Hair', image: 'hair/curly.svg' },
    53: { id: 53, type: TraitType.HAIR, name: 'Bald', image: 'hair/bald.svg' },

    // ACCESSORY
    61: { id: 61, type: TraitType.ACCESSORY, name: 'Glasses', image: 'accessory/glasses.svg' },
    62: { id: 62, type: TraitType.ACCESSORY, name: 'Earrings', image: 'accessory/earrings.svg' },
    63: { id: 63, type: TraitType.ACCESSORY, name: 'Necklace', image: 'accessory/necklace.svg' },
};

// Helper function to get traits by type
export function getTraitsByType(type: TraitType): Trait[] {
    return Object.values(traitDefinitions).filter((trait) => trait.type === type);
}

export { TraitContract, traitDefinitions as traits };
