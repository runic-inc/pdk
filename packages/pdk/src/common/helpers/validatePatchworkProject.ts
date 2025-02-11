import { PatchworkProject } from '@patchworkdev/pdk/types';

const RESERVED_WORDS = ['metadata'];

/**
 * Validates a PatchworkProject configuration at runtime.
 */
export function validatePatchworkProject(project: PatchworkProject): void {
  Object.entries(project.contracts).forEach(([contractKey, contractConfig]) => {
    // If the contract configuration is a string reference, skip validation.
    if (typeof contractConfig !== 'object') return;

    contractConfig.fields.forEach((field) => {
      RESERVED_WORDS.forEach((reserved) => {
        if (field.key.startsWith(reserved)) {
          throw new Error(
            `Invalid field key "${field.key}" in contract "${contractConfig.name}": field keys cannot start with reserved word "${reserved}".`
          );
        }
      });
    });
  });
}
