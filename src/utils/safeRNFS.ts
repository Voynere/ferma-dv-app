import RNFS from 'react-native-fs';

export class SafeRNFS {
    private static isValidPath(path: any): boolean {
        return path !== null && 
               path !== undefined && 
               typeof path === 'string' && 
               path.trim().length > 0;
    }

    static async exists(path: string): Promise<boolean> {
        try {
            if (!this.isValidPath(path)) {
                console.log('⚠️ [SafeRNFS] Invalid path for exists:', path);
                return false;
            }
            return await RNFS.exists(path);
        } catch (error) {
            console.log('⚠️ [SafeRNFS] Error checking existence:', path, error);
            return false;
        }
    }

    static async stat(path: string): Promise<any> {
        try {
            if (!this.isValidPath(path)) {
                console.log('⚠️ [SafeRNFS] Invalid path for stat:', path);
                return null;
            }
            
            return await RNFS.stat(path);
        } catch (error) {
            console.log('⚠️ [SafeRNFS] Error getting file stats:', path, error);
            return null;
        }
    }

    static async unlink(path: string): Promise<void> {
        try {
            if (!this.isValidPath(path)) {
                console.log('⚠️ [SafeRNFS] Invalid path for unlink:', path);
                return;
            }
            
            const fileExists = await RNFS.exists(path);
            if (!fileExists) {
                console.log('⚠️ [SafeRNFS] File does not exist, skipping unlink:', path);
                return;
            }
            
            await RNFS.unlink(path);
        } catch (error) {
            console.log('⚠️ [SafeRNFS] Error unlinking file:', path, error);
        }
    }

    static async mkdir(path: string): Promise<void> {
        try {
            if (!this.isValidPath(path)) {
                console.log('⚠️ [SafeRNFS] Invalid path for mkdir:', path);
                return;
            }
            await RNFS.mkdir(path);
        } catch (error) {
            console.log('⚠️ [SafeRNFS] Error creating directory:', path, error);
            // Не бросаем ошибку, просто логируем
        }
    }

    static async readDir(path: string): Promise<any[]> {
        try {
            if (!this.isValidPath(path)) {
                console.log('⚠️ [SafeRNFS] Invalid path for readDir:', path);
                return [];
            }
            return await RNFS.readDir(path);
        } catch (error) {
            console.log('⚠️ [SafeRNFS] Error reading directory:', path, error);
            return [];
        }
    }

    static async downloadFile(options: any): Promise<any> {
        try {
            if (!options || !options.fromUrl || !options.toFile) {
                console.log('⚠️ [SafeRNFS] Invalid download options provided:', options);
                return { promise: Promise.reject(new Error('Invalid download options')) };
            }
            
            if (!this.isValidPath(options.fromUrl)) {
                console.log('⚠️ [SafeRNFS] Invalid fromUrl provided:', options.fromUrl);
                return { promise: Promise.reject(new Error('Invalid fromUrl')) };
            }
            
            if (!this.isValidPath(options.toFile)) {
                console.log('⚠️ [SafeRNFS] Invalid toFile provided:', options.toFile);
                return { promise: Promise.reject(new Error('Invalid toFile')) };
            }
            
            return await RNFS.downloadFile(options);
        } catch (error) {
            console.log('⚠️ [SafeRNFS] Error downloading file:', options?.fromUrl, error);
            return { promise: Promise.reject(error) };
        }
    }

    static async moveFile(from: string, to: string): Promise<void> {
        try {
            if (!this.isValidPath(from) || !this.isValidPath(to)) {
                console.log('⚠️ [SafeRNFS] Invalid path for moveFile:', from, to);
                return;
            }
            
            const fileExists = await RNFS.exists(from);
            if (!fileExists) {
                console.log('⚠️ [SafeRNFS] Source file does not exist for moveFile:', from);
                return;
            }
            
            await RNFS.moveFile(from, to);
        } catch (error) {
            console.log('⚠️ [SafeRNFS] Error moving file:', from, to, error);
        }
    }

    static async copyFile(from: string, to: string): Promise<void> {
        try {
            if (!this.isValidPath(from) || !this.isValidPath(to)) {
                console.log('⚠️ [SafeRNFS] Invalid path for copyFile:', from, to);
                return;
            }
            
            const fileExists = await RNFS.exists(from);
            if (!fileExists) {
                console.log('⚠️ [SafeRNFS] Source file does not exist for copyFile:', from);
                return;
            }
            
            await RNFS.copyFile(from, to);
        } catch (error) {
            console.log('⚠️ [SafeRNFS] Error copying file:', from, to, error);
        }
    }

    static get CachesDirectoryPath(): string {
        try {
            return RNFS.CachesDirectoryPath || '';
        } catch (error) {
            console.log('⚠️ [SafeRNFS] Error getting cache directory path:', error);
            return '';
        }
    }
}
