class ImageBatchPreloader {
    private queue: string[] = []
    private isProcessing = false
    private maxConcurrent = 3
    private cache: Set<string> = new Set()

    async preload(links: string[], fetchFn: (link: string) => Promise<any>) {
        const newLinks = links.filter(link => !this.cache.has(link))
        
        if (newLinks.length === 0) {
            console.log('🖼️ [ImageBatchPreloader] All images already cached')
            return
        }

        this.queue.push(...newLinks)
        
        if (!this.isProcessing) {
            this.isProcessing = true
            await this.processQueue(fetchFn)
            this.isProcessing = false
        }
    }

    private async processQueue(fetchFn: (link: string) => Promise<any>) {
        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.maxConcurrent)
            
            await Promise.all(
                batch.map(async (link) => {
                    try {
                        await fetchFn(link)
                        this.cache.add(link)
                    } catch (error) {
                        console.log('Failed to preload:', link)
                    }
                })
            )
        }
    }

    clearCache() {
        this.cache.clear()
    }
}

export const imagePreloader = new ImageBatchPreloader()

