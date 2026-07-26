import { SafeRNFS } from './safeRNFS';
import CryptoJS from 'crypto-js';

export class ImageCacheManager {
    private static readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
    private static readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 дней
    private static readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 часа

    // Очистка старого кэша
    static async cleanupOldCache(): Promise<void> {
        try {
            const cacheDir = SafeRNFS.CachesDirectoryPath;
            if (!cacheDir || cacheDir.trim() === '') {
                console.log('⚠️ [CACHE] Empty cache directory path');
                return;
            }

            const files = await SafeRNFS.readDir(cacheDir);
            const now = Date.now();
            let totalSize = 0;
            let deletedCount = 0;

            console.log(`🧹 [CACHE] Starting cache cleanup, found ${files.length} files`);

            for (const file of files) {
                if (!file || !file.path || file.path.trim() === '') {
                    console.log('⚠️ [CACHE] Skipping file with null/empty path');
                    continue;
                }

                if (file.isFile() && file.name && file.name.endsWith('.jpg')) {
                    totalSize += file.size || 0;

                    if (file.mtime && now - file.mtime.getTime() > this.MAX_CACHE_AGE) {
                        try {
                            await SafeRNFS.unlink(file.path);
                            deletedCount++;
                            console.log(`🗑️ [CACHE] Deleted old file: ${file.name}`);
                        } catch (unlinkError) {
                            console.log(`⚠️ [CACHE] Failed to delete file ${file.name}:`, unlinkError);
                        }
                    }
                }
            }

            if (totalSize > this.MAX_CACHE_SIZE) {
                const sortedFiles = files
                    .filter(file => file && file.path && file.path.trim() !== '' && file.isFile() && file.name && file.name.endsWith('.jpg'))
                    .sort((a, b) => (a.mtime?.getTime() || 0) - (b.mtime?.getTime() || 0));

                let currentSize = totalSize;
                for (const file of sortedFiles) {
                    if (currentSize <= this.MAX_CACHE_SIZE * 0.8) break;
                    
                    try {
                        await SafeRNFS.unlink(file.path);
                        currentSize -= file.size || 0;
                        deletedCount++;
                        console.log(`🗑️ [CACHE] Deleted large cache file: ${file.name}`);
                    } catch (unlinkError) {
                        console.log(`⚠️ [CACHE] Failed to delete large cache file ${file.name}:`, unlinkError);
                    }
                }
            }

            console.log(`✅ [CACHE] Cleanup completed: deleted ${deletedCount} files`);
        } catch (error) {
            console.log(`❌ [CACHE] Cleanup failed:`, error);
        }
    }

    // Получаем статистику кэша
    static async getCacheStats(): Promise<{ fileCount: number; totalSize: number; oldestFile: Date | null }> {
        try {
            const cacheDir = SafeRNFS.CachesDirectoryPath;
            if (!cacheDir || cacheDir.trim() === '') {
                console.log('⚠️ [CACHE] Empty cache directory path in getCacheStats');
                return { fileCount: 0, totalSize: 0, oldestFile: null };
            }

            const files = await SafeRNFS.readDir(cacheDir);
            const imageFiles = files.filter(file => 
                file && 
                file.path && 
                file.path.trim() !== '' && 
                file.isFile() && 
                file.name && 
                file.name.endsWith('.jpg')
            );
            
            let totalSize = 0;
            let oldestFile: Date | null = null;

            for (const file of imageFiles) {
                totalSize += file.size || 0;
                if (file.mtime && (!oldestFile || file.mtime < oldestFile)) {
                    oldestFile = file.mtime;
                }
            }

            return {
                fileCount: imageFiles.length,
                totalSize,
                oldestFile
            };
        } catch (error) {
            console.log(`❌ [CACHE] Failed to get cache stats:`, error);
            return { fileCount: 0, totalSize: 0, oldestFile: null };
        }
    }

    // Проверяем нужно ли очистить кэш
    static async shouldCleanup(): Promise<boolean> {
        try {
            const stats = await this.getCacheStats();
            const now = Date.now();
            
            // Очищаем если кэш слишком большой или старый
            return stats.totalSize > this.MAX_CACHE_SIZE || 
                   (stats.oldestFile && now - stats.oldestFile.getTime() > this.MAX_CACHE_AGE);
        } catch (error) {
            return false;
        }
    }

    // Автоматическая очистка кэша
    static async autoCleanup(): Promise<void> {
        const shouldClean = await this.shouldCleanup();
        if (shouldClean) {
            console.log(`🧹 [CACHE] Auto cleanup triggered`);
            await this.cleanupOldCache();
        }
    }

    // Полная очистка кэша
    static async clearAllCache(): Promise<void> {
        try {
            const cacheDir = SafeRNFS.CachesDirectoryPath;
            if (!cacheDir || cacheDir.trim() === '') {
                console.log('⚠️ [CACHE] Empty cache directory path in clearAllCache');
                return;
            }

            const files = await SafeRNFS.readDir(cacheDir);
            const imageFiles = files.filter(file => 
                file && 
                file.path && 
                file.path.trim() !== '' && 
                file.isFile() && 
                file.name && 
                file.name.endsWith('.jpg')
            );
            
            for (const file of imageFiles) {
                try {
                    await SafeRNFS.unlink(file.path);
                } catch (unlinkError) {
                    console.log(`⚠️ [CACHE] Failed to delete file ${file.name}:`, unlinkError);
                }
            }
            
            console.log(`🗑️ [CACHE] Cleared all cache: ${imageFiles.length} files`);
        } catch (error) {
            console.log(`❌ [CACHE] Failed to clear cache:`, error);
        }
    }

    // Получаем размер кэша в читаемом формате
    static formatSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Экспортируем singleton
export const imageCacheManager = new ImageCacheManager();

// Экспортируем также класс для прямого использования
export { ImageCacheManager };