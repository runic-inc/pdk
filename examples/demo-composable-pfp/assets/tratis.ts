export enum TraitType {
    BACKGROUND = 0,
    CHARACTER = 1,
    EYES = 2,
    MOUTH = 3,
    ACCESSORY = 4
}

export interface Trait {
    id: number;
    type: TraitType;
    name: string;
    image: string;
}

// Our main contract address
const TraitContract = {
    default: process.env.TRAIT_CONTRACT_ADDRESS as `0x${string}`
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
    default: 'Base Collection'
};

// Define traits
const traitDefinitions: Record<number, Trait> = {
    // Backgrounds
    1: { id: 1, type: TraitType.BACKGROUND, name: 'Sunset Sky', image: 'backgrounds/sunset.svg' },
    2: { id: 2, type: TraitType.BACKGROUND, name: 'Starry Night', image: 'backgrounds/starry.svg' },
    3: { id: 3, type: TraitType.BACKGROUND, name: 'Ocean Waves', image: 'backgrounds/ocean.svg' },
    
    // Characters
    11: { id: 11, type: TraitType.CHARACTER, name: 'Robot', image: 'characters/robot.svg' },
    12: { id: 12, type: TraitType.CHARACTER, name: 'Alien', image: 'characters/alien.svg' },
    13: { id: 13, type: TraitType.CHARACTER, name: 'Ninja', image: 'characters/ninja.svg' },
    
    // Eyes
    21: { id: 21, type: TraitType.EYES, name: 'Sleepy', image: 'eyes/sleepy.svg' },
    22: { id: 22, type: TraitType.EYES, name: 'Curious', image: 'eyes/curious.svg' },
    23: { id: 23, type: TraitType.EYES, name: 'Excited', image: 'eyes/excited.svg' },
    
    // Mouths
    31: { id: 31, type: TraitType.MOUTH, name: 'Happy', image: 'mouths/happy.svg' },
    32: { id: 32, type: TraitType.MOUTH, name: 'Surprised', image: 'mouths/surprised.svg' },
    33: { id: 33, type: TraitType.MOUTH, name: 'Smirk', image: 'mouths/smirk.svg' },
    
    // Accessories
    41: { id: 41, type: TraitType.ACCESSORY, name: 'Bowtie', image: 'accessories/bowtie.svg' },
    42: { id: 42, type: TraitType.ACCESSORY, name: 'Necklace', image: 'accessories/necklace.svg' },
    43: { id: 43, type: TraitType.ACCESSORY, name: 'Watch', image: 'accessories/watch.svg' }
};

// Helper function to get traits by type
export function getTraitsByType(type: TraitType): Trait[] {
    return Object.values(traitDefinitions).filter(trait => trait.type === type);
}

export { TraitContract, traitDefinitions as traits };