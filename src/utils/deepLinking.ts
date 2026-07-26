import { Linking } from 'react-native'
import { navigationRef } from '../components/Navigation'
import { APP_URL_SCHEME } from '../constants'

const APP_SCHEME = APP_URL_SCHEME

export function initializeDeepLinking() {
    const handleDeepLink = (event: { url: string }) => {
        const url = event.url
        console.log('🔗 [DeepLink] Получена ссылка:', url)
        handleUrl(url)
    }

    Linking.addEventListener('url', handleDeepLink)

    Linking.getInitialURL().then((url) => {
        if (url) {
            console.log('🔗 [DeepLink] Начальная ссылка при запуске:', url)
            handleUrl(url)
        }
    })

    return () => {
        Linking.removeAllListeners('url')
    }
}

function handleUrl(url: string) {
    if (!url) return

    console.log('🔗 [DeepLink] Обработка URL:', url)

    const productMatch = url.match(/burenka:\/\/product\/(.+)/)
    
    if (productMatch && productMatch[1]) {
        const productId = productMatch[1]
        console.log('🔗 [DeepLink] Найден product ID:', productId)
        
        if (navigationRef.current?.isReady()) {
            console.log('🔗 [DeepLink] Навигация к продукту:', productId)
            navigationRef.current.navigate('product' as never, { id: productId } as never)
        } else {
            console.log('⚠️ [DeepLink] Навигация не готова, ждем...')
            setTimeout(() => {
                if (navigationRef.current?.isReady()) {
                    navigationRef.current.navigate('product' as never, { id: productId } as never)
                }
            }, 1000)
        }
    } else {
        console.log('⚠️ [DeepLink] URL не распознан:', url)
    }
}

export function openProductDeepLink(productId: string) {
    const deepLink = `${APP_SCHEME}://product/${productId}`
    Linking.openURL(deepLink).catch((err) => {
        console.error('❌ [DeepLink] Ошибка открытия:', err)
    })
}

