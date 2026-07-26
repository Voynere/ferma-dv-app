type QueueItem = {
  productId: string
  resolve: (url: string) => void
  reject: (error: any) => void
}

class ImageQueue {
  private queue: QueueItem[] = []
  private processing = 0
  private maxConcurrent = 2
  private cache: Map<string, string> = new Map()

  async add(productId: string, loader: () => Promise<string>): Promise<string> {
    if (this.cache.has(productId)) {
      return this.cache.get(productId)!
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ productId, resolve, reject })
      this.process(loader)
    })
  }

  private async process(loader: () => Promise<string>) {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const item = this.queue.shift()
    if (!item) return

    this.processing++

    try {
      const url = await loader()
      this.cache.set(item.productId, url)
      item.resolve(url)
    } catch (error) {
      this.cache.set(item.productId, '')
      item.reject(error)
    } finally {
      this.processing--
      this.process(loader)
    }
  }

  clear() {
    this.queue = []
    this.cache.clear()
  }
}

export const imageQueue = new ImageQueue()

