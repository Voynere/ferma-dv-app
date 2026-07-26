class RequestCancellationManager {
    private activeRequests: Map<string, AbortController> = new Map()

    createCancellableRequest(key: string): AbortController {
        this.cancel(key)
        
        const controller = new AbortController()
        this.activeRequests.set(key, controller)
        
        return controller
    }

    cancel(key: string) {
        const controller = this.activeRequests.get(key)
        if (controller) {
            controller.abort()
            this.activeRequests.delete(key)
        }
    }

    cancelAll() {
        this.activeRequests.forEach(controller => controller.abort())
        this.activeRequests.clear()
    }

    isActive(key: string): boolean {
        return this.activeRequests.has(key)
    }
}

export const requestManager = new RequestCancellationManager()

