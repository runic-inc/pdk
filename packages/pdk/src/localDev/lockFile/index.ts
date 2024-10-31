import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Address } from 'viem';

type Deployment = {
    contract: string;
    hash: string;
    address: Address;
    network: string;
    timestamp: string;
    block: number;
};

type LockFile = {
    currentNetwork: string;
    lastDeployment: Deployment | null;
    fileHashes: {
        [filepath: string]: string;
    };
    directoryHashes: {
        [dirpath: string]: string;
    };
    deploymentHistory: Array<Deployment>;
    projectHash: string;
};

class LockFileManager {
    protected lockFilePath: string;
    protected rootDir: string;
    protected lockData: LockFile;
    protected excludePatterns: string[];

    constructor(configPath: string, excludePatterns: string[] = []) {
        this.excludePatterns = excludePatterns;
        this.rootDir = path.dirname(configPath);
        this.lockFilePath = path.join(this.rootDir, '.deploy.lock');
        this.lockData = this.readLockFile();
    }

    protected readLockFile(): LockFile {
        try {
            const data = fs.readFileSync(this.lockFilePath, 'utf8');
            return JSON.parse(data);
        } catch {
            return {
                currentNetwork: 'local',
                lastDeployment: null,
                fileHashes: {},
                directoryHashes: {},
                deploymentHistory: [],
                projectHash: '',
            };
        }
    }

    protected saveLockFile(): void {
        fs.writeFileSync(this.lockFilePath, JSON.stringify(this.lockData, null, 2));
    }

    protected shouldExclude(itemPath: string): boolean {
        // Convert to relative path for matching
        const relativePath = path.relative(this.rootDir, itemPath);
        return this.excludePatterns.some((pattern) => {
            if (pattern.startsWith('*')) {
                return relativePath.endsWith(pattern.slice(1));
            }
            return relativePath.includes(pattern);
        });
    }

    protected getRelativePath(absolutePath: string): string {
        return path.relative(this.rootDir, absolutePath);
    }

    protected getAbsolutePath(relativePath: string): string {
        return path.join(this.rootDir, relativePath);
    }

    public updateNetwork(network: string): void {
        this.lockData.currentNetwork = network;
        this.saveLockFile();
    }

    public logDeployment(contract: string, hash: string, address: Address, network: string, timestamp: string, block: number): void {
        const deploymentInfo = {
            contract,
            hash,
            address,
            network,
            timestamp,
            block,
        };

        this.lockData.lastDeployment = deploymentInfo;
        this.lockData.deploymentHistory.push(deploymentInfo);
        this.saveLockFile();
    }

    public getLatestDeploymentForContract(contract: string, network: string): Deployment | null {
        // Filter deployments for the specified network and contract, then sort by block number
        const networkDeployments = this.lockData.deploymentHistory
            .filter((deployment) => deployment.network === network && deployment.contract === contract)
            .sort((a, b) => b.block - a.block);

        // Return the first (most recent) deployment or null if none found
        return networkDeployments[0] || null;
    }

    public calculateFileHash(filepath: string): string {
        const absolutePath = path.isAbsolute(filepath) ? filepath : this.getAbsolutePath(filepath);
        const content = fs.readFileSync(absolutePath);
        const hash = crypto.createHash('sha256');
        hash.update(content);
        return hash.digest('hex');
    }

    public updateFileHash(filepath: string): void {
        const relativePath = this.getRelativePath(filepath);
        const hash = this.calculateFileHash(filepath);
        this.lockData.fileHashes[relativePath] = hash;
        this.saveLockFile();
    }

    public hasFileChanged(filepath: string): boolean {
        const relativePath = this.getRelativePath(filepath);
        const currentHash = this.calculateFileHash(filepath);
        return this.lockData.fileHashes[relativePath] !== currentHash;
    }

    public calculateDirectoryHash(dirpath: string): string {
        const absolutePath = path.isAbsolute(dirpath) ? dirpath : this.getAbsolutePath(dirpath);
        const hash = crypto.createHash('sha256');

        // Add directory name to the hash
        hash.update(path.basename(absolutePath));

        try {
            const items = fs.readdirSync(absolutePath);
            const sortedItems = items.sort();

            for (const item of sortedItems) {
                const fullPath = path.join(absolutePath, item);

                if (this.shouldExclude(fullPath)) {
                    continue;
                }

                const stats = fs.statSync(fullPath);
                const relativePath = this.getRelativePath(fullPath);

                if (stats.isFile()) {
                    const fileHash = this.calculateFileHash(fullPath);
                    hash.update(fileHash);
                    this.lockData.fileHashes[relativePath] = fileHash;
                } else if (stats.isDirectory()) {
                    const dirHash = this.calculateDirectoryHash(fullPath);
                    hash.update(dirHash);
                    this.lockData.directoryHashes[relativePath] = dirHash;
                }
            }

            return hash.digest('hex');
        } catch (error) {
            console.error(`Error processing directory ${dirpath}:`, error);
            return '';
        }
    }

    public getChangedFiles(): string[] {
        return Object.keys(this.lockData.fileHashes).filter((filepath) => {
            const absolutePath = this.getAbsolutePath(filepath);
            return !this.shouldExclude(absolutePath) && this.hasFileChanged(absolutePath);
        });
    }

    public watchDirectory(callback: (changes: { files: string[]; directories: string[] }) => void): fs.FSWatcher {
        const watcher = fs.watch(this.rootDir, { recursive: true }, async (eventType, filename) => {
            if (!filename) return;

            const absolutePath = this.getAbsolutePath(filename);
            if (this.shouldExclude(absolutePath)) {
                return;
            }

            // Give the filesystem a moment to settle
            await new Promise((resolve) => setTimeout(resolve, 100));

            const changes = this.getAllChangedItems();
            callback(changes);
        });

        return watcher;
    }

    public updateProjectHash(): void {
        const projectHash = this.calculateDirectoryHash(this.rootDir);
        this.lockData.projectHash = projectHash;
        this.saveLockFile();
    }

    public hasProjectChanged(): boolean {
        const currentHash = this.calculateDirectoryHash(this.rootDir);
        return this.lockData.projectHash !== currentHash;
    }

    public getAllChangedItems(): { files: string[]; directories: string[] } {
        const changedFiles = Object.keys(this.lockData.fileHashes).filter((filepath) => {
            const absolutePath = this.getAbsolutePath(filepath);
            return !this.shouldExclude(absolutePath) && this.hasFileChanged(absolutePath);
        });

        const changedDirs = Object.keys(this.lockData.directoryHashes).filter((dirpath) => {
            const absolutePath = this.getAbsolutePath(dirpath);
            return !this.shouldExclude(absolutePath) && this.lockData.directoryHashes[dirpath] !== this.calculateDirectoryHash(absolutePath);
        });

        return {
            files: changedFiles,
            directories: changedDirs,
        };
    }

    public getDeploymentHistory(): Array<Deployment> {
        return this.lockData.deploymentHistory;
    }

    public getCurrentNetwork(): string {
        return this.lockData.currentNetwork;
    }

    public getLastDeployment(): Deployment | null {
        return this.lockData.lastDeployment;
    }

    public getFileHash(filepath: string): string | undefined {
        const relativePath = this.getRelativePath(filepath);
        return this.lockData.fileHashes[relativePath];
    }

    public getDirectoryHash(dirpath: string): string | undefined {
        const relativePath = this.getRelativePath(dirpath);
        return this.lockData.directoryHashes[relativePath];
    }

    public getProjectHash(): string {
        return this.lockData.projectHash;
    }

    public getRootDir(): string {
        return this.rootDir;
    }
}

export default LockFileManager;
