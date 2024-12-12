export enum TraitType {
    BODY = 0,
    CLOTHING = 1,
    EXPRESSION = 2,
    HAIR = 3,
    ACCESSORY = 4,
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
    // Backgrounds
    1: { id: 1, type: TraitType.BODY, name: 'Pale', image: 'body/pale.svg' },
    2: { id: 2, type: TraitType.BODY, name: 'Dark', image: 'body/dark.svg' },
    3: { id: 3, type: TraitType.BODY, name: 'Yellow', image: 'body/yellow.svg' },
    4: { id: 4, type: TraitType.BODY, name: 'Green', image: 'body/green.svg' },

    // Characters
    11: { id: 11, type: TraitType.CLOTHING, name: 'Skull Tee', image: 'clothing/skulltee.svg' },
    12: { id: 12, type: TraitType.CLOTHING, name: 'Hoodie', image: 'clothing/hoodie.svg' },
    13: { id: 13, type: TraitType.CLOTHING, name: 'Blazer', image: 'clothing/blazer.svg' },
    14: { id: 14, type: TraitType.CLOTHING, name: 'Overalls', image: 'clothing/overalls.svg' },

    // Eyes
    21: { id: 21, type: TraitType.EXPRESSION, name: 'Angry', image: 'expression/angry.svg' },
    22: { id: 22, type: TraitType.EXPRESSION, name: 'Happy', image: 'expression/happy.svg' },
    23: { id: 23, type: TraitType.EXPRESSION, name: 'Sad', image: 'expression/sad.svg' },
    24: { id: 24, type: TraitType.EXPRESSION, name: 'Silly', image: 'expression/silly.svg' },

    // Mouths
    31: { id: 31, type: TraitType.HAIR, name: 'Short', image: 'hair/short.svg' },
    32: { id: 32, type: TraitType.HAIR, name: 'Waves', image: 'hair/waves.svg' },
    33: { id: 33, type: TraitType.HAIR, name: 'Mullet', image: 'hair/mullet.svg' },
    34: { id: 34, type: TraitType.HAIR, name: 'Floral', image: 'hair/floral.svg' },

    // Accessories
    41: { id: 41, type: TraitType.ACCESSORY, name: 'Glasses', image: 'accessories/glasses.svg' },
    42: { id: 42, type: TraitType.ACCESSORY, name: 'Sunglasses', image: 'accessories/sunglasses.svg' },
    43: { id: 43, type: TraitType.ACCESSORY, name: 'Winter Hat', image: 'accessories/winterhat.svg' },
    44: { id: 44, type: TraitType.ACCESSORY, name: 'Hat', image: 'accessories/hat.svg' },
};

// Helper function to get traits by type
export function getTraitsByType(type: TraitType): Trait[] {
    return Object.values(traitDefinitions).filter((trait) => trait.type === type);
}

export { TraitContract, traitDefinitions as traits };
