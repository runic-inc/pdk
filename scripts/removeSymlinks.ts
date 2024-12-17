import fs from 'fs';
import path from 'path';

/**
 * Recursively removes symbolic links in a directory.
 * @param targetDir - The directory to clean.
 */
async function removeSymlinks(targetDir: string): Promise<void> {
    try {
        const entries = await fs.promises.readdir(targetDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(targetDir, entry.name);

            if (entry.isSymbolicLink()) {
                // Remove the symlink
                await fs.promises.unlink(fullPath);
                console.log(`Removed symlink: ${fullPath}`);
            } else if (entry.isDirectory()) {
                // Recurse into subdirectory
                await removeSymlinks(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error removing symlinks: ${error}`);
    }
}

/**
 * Entry point for the script.
 */
(async () => {
    const demoDir = path.resolve(__dirname, 'templates/demo');

    console.log(`Cleaning symbolic links in ${demoDir}...`);
    await removeSymlinks(demoDir);
    console.log('Symbolic links removed successfully!');
})();
