type Priority = 'high' | 'normal' | 'low';

interface QueueItem {
    url: string;
    priority: Priority;
    resolve: (value: string | null) => void;
    reject: (reason?: any) => void;
    cancelled: boolean;
    retries: number;
}

export class ImageDownloadQueue {
    private queue: QueueItem[] = [];
    private activeDownloads = 0;
    private readonly MAX_CONCURRENT = 3;
    private readonly MAX_RETRIES = 2;
    private downloadFunction: ((url: string) => Promise<string | null>) | null = null;

    setDownloadFunction(fn: (url: string) => Promise<string | null>) {
        this.downloadFunction = fn;
    }

    async add(url: string, priority: Priority = 'normal'): Promise<string | null> {
        return new Promise((resolve, reject) => {
            const item: QueueItem = {
                url,
                priority,
                resolve,
                reject,
                cancelled: false,
                retries: 0
            };

            if (priority === 'high') {
                const firstNormalIndex = this.queue.findIndex(q => q.priority !== 'high');
                if (firstNormalIndex === -1) {
                    this.queue.push(item);
                } else {
                    this.queue.splice(firstNormalIndex, 0, item);
                }
            } else if (priority === 'low') {
                this.queue.push(item);
            } else {
                const firstLowIndex = this.queue.findIndex(q => q.priority === 'low');
                if (firstLowIndex === -1) {
                    this.queue.push(item);
                } else {
                    this.queue.splice(firstLowIndex, 0, item);
                }
            }

            this.processQueue();
        });
    }

    cancel(url: string) {
        const item = this.queue.find(q => q.url === url);
        if (item) {
            item.cancelled = true;
        }
    }

    private async processQueue() {
        if (this.activeDownloads >= this.MAX_CONCURRENT || this.queue.length === 0) {
            return;
        }

        const item = this.queue.shift();
        if (!item) return;

        if (item.cancelled) {
            item.resolve(null);
            this.processQueue();
            return;
        }

        this.activeDownloads++;

        try {
            if (!this.downloadFunction) {
                throw new Error('Download function not set');
            }

            const result = await this.downloadFunction(item.url);
            
            if (!item.cancelled) {
                item.resolve(result);
            } else {
                item.resolve(null);
            }
        } catch (error) {
            if (item.retries < this.MAX_RETRIES && !item.cancelled) {
                item.retries++;
                console.log(`⚠️ Retry ${item.retries}/${this.MAX_RETRIES} for ${item.url}`);
                this.queue.unshift(item);
            } else {
                console.log(`❌ Failed to download after ${item.retries} retries:`, item.url);
                item.resolve(null);
            }
        } finally {
            this.activeDownloads--;
            this.processQueue();
        }
    }

    getQueueSize(): number {
        return this.queue.length;
    }

    getActiveDownloads(): number {
        return this.activeDownloads;
    }

    clear() {
        this.queue.forEach(item => {
            item.cancelled = true;
            item.resolve(null);
        });
        this.queue = [];
    }
}

export const imageDownloadQueue = new ImageDownloadQueue();

