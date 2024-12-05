import fs from 'fs';
import path from 'path';

/**
 * Recursively creates symbolic links from the source directory to the destination directory.
 * @param srcDir - The source directory to copy from.
 * @param destDir - The destination directory to create symbolic links in.
 */
async function createSymlinks(srcDir: string, destDir: string): Promise<void> {
    try {
        const entries = await fs.promises.readdir(srcDir, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);

            if (entry.isDirectory()) {
                // Ensure the destination directory exists
                await fs.promises.mkdir(destPath, { recursive: true });
                // Recurse into subdirectory
                await createSymlinks(srcPath, destPath);
            } else if (entry.isFile()) {
                if (!fs.existsSync(destPath)) {
                    // Create a symbolic link for the file
                    await fs.promises.symlink(srcPath, destPath);
                    console.log(`Linked: ${srcPath} -> ${destPath}`);
                } else {
                    console.log(`Link already exists: ${destPath}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error creating symlinks: ${error}`);
    }
}

/**
 * Entry point for the script.
 */
(async () => {
    const defaultDir = path.resolve(__dirname, 'templates/default');
    const demoDir = path.resolve(__dirname, 'templates/demo');

    console.log(`Creating symbolic links from ${defaultDir} to ${demoDir}...`);
    await createSymlinks(defaultDir, demoDir);
    console.log('Symbolic links created successfully!');
})();
