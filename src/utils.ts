export function cleanAndCapitalizeFirstLetter(string: string) {
     // Remove non-alphanumeric characters and whitespace
     const cleanedString = string.replace(/[^a-zA-Z0-9]/g, '');

     // Capitalize the first letter of the cleaned string
     return cleanedString.charAt(0).toUpperCase() + cleanedString.slice(1);
}
