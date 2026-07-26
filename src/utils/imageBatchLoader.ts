import api from '../api'

class ImageBatchLoader {
    private pendingMetadata: Map<string, Array<(value: string | null) => void>> = new Map()
    private failedLinks: Set<string> = new Set()
    private retryCount: Map<string, number> = new Map()
    private batchTimeout: NodeJS.Timeout | null = null
    private readonly BATCH_DELAY = 100
    private readonly MAX_RETRIES = 2

    async getImageMetadata(link: string): Promise<string | null> {
        if (!link || link.trim() === '') {
            return null;
        }

        if (this.failedLinks.has(link)) {
            return null;
        }

        return new Promise((resolve) => {
            if (!this.pendingMetadata.has(link)) {
                this.pendingMetadata.set(link, [])
            }
            
            this.pendingMetadata.get(link)!.push(resolve)
            
            if (this.batchTimeout) {
                clearTimeout(this.batchTimeout)
            }

            this.batchTimeout = setTimeout(() => {
                this.processBatch()
            }, this.BATCH_DELAY)
        })
    }

    private async processBatch() {
        const links = Array.from(this.pendingMetadata.keys()).slice(0, 5)
        const callbacks = new Map(this.pendingMetadata)
        links.forEach(link => this.pendingMetadata.delete(link))
        this.batchTimeout = null

        const results = await Promise.allSettled(
            links.map(link => {
                return Promise.race([
                    api.products.getImage(link, false),
                    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
                ])
            })
        )

        results.forEach((result, index) => {
            const link = links[index]
            const resolvers = callbacks.get(link) || []
            let value: string | null = null;
            
            if (result.status === 'fulfilled' && result.value) {
                value = result.value;
                this.retryCount.delete(link);
            } else {
                const retries = this.retryCount.get(link) || 0;
                
                if (retries < this.MAX_RETRIES) {
                    this.retryCount.set(link, retries + 1);
                    console.log(`⚠️ Retry ${retries + 1}/${this.MAX_RETRIES} for image metadata:`, link.substring(0, 50));
                    
                    setTimeout(() => {
                        resolvers.forEach(resolve => {
                            this.getImageMetadata(link).then(resolve);
                        });
                    }, 1000);
                    return;
                } else {
                    this.failedLinks.add(link);
                    this.retryCount.delete(link);
                    console.log(`❌ Failed to load image metadata after ${this.MAX_RETRIES} retries:`, link.substring(0, 50));
                }
            }
            
            resolvers.forEach(resolve => resolve(value))
        })

        if (this.pendingMetadata.size > 0) {
            setTimeout(() => this.processBatch(), 50)
        }
    }

    clearFailedLinks() {
        this.failedLinks.clear();
        this.retryCount.clear();
    }
}

export const imageBatchLoader = new ImageBatchLoader()

