import { InteractionManager } from 'react-native'

class PerformanceMonitor {
    private frameCount = 0
    private lastTime = performance.now()
    private fps = 60
    private rafId: number | null = null
    private isMonitoring = false

    startMonitoring() {
        if (this.isMonitoring) return
        this.isMonitoring = true
        this.frameCount = 0
        this.lastTime = performance.now()
        this.measureFPS()
    }

    private measureFPS = () => {
        this.frameCount++
        const currentTime = performance.now()
        const delta = currentTime - this.lastTime

        if (delta >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / delta)
            this.frameCount = 0
            this.lastTime = currentTime
        }

        if (this.isMonitoring) {
            this.rafId = requestAnimationFrame(this.measureFPS)
        }
    }

    stopMonitoring() {
        this.isMonitoring = false
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId)
            this.rafId = null
        }
    }

    logInteraction(action: string, screen: string) {
    }

    async measureAsyncOperation<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        const startTime = performance.now()
        
        try {
            const result = await operation()
            return result
        } catch (error) {
            throw error
        }
    }

    getCurrentFPS(): number {
        return this.fps
    }
}

export const performanceMonitor = new PerformanceMonitor()
