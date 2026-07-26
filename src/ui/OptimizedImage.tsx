import React, { useState, useEffect, memo, useCallback } from 'react'
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { getCDNImageUrl } from '../config/cdnMapping'
import Empty from '../assets/svg/Empty'
import { getMoyskladImageUrl, getMoyskladVariantImageUrl } from '../api/functions/images'
import { MOYSKLAD_TOKEN } from '../api/functions/products'
import FastImage, { ResizeMode } from '@d11/react-native-fast-image'

type Priority = 'high' | 'normal' | 'low'

interface OptimizedImageProps {
  productId: string
  index?: number
  style?: StyleProp<ViewStyle>
  resizeMode?: ResizeMode
  emptyStyle?: StyleProp<ViewStyle>
  priority?: Priority
}

const PRIORITY_MAP = {
  high:   FastImage.priority.high,
  normal: FastImage.priority.normal,
  low:    FastImage.priority.low,
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  productId,
  index = 0,
  style,
  resizeMode = 'cover',
  emptyStyle,
  priority = 'normal',
}) => {
  const [imageUrl, setImageUrl] = useState<string>(() => getCDNImageUrl(productId, index))
  const [needsAuth, setNeedsAuth] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const cdnUrl = getCDNImageUrl(productId, index)
    if (cdnUrl) {
      setImageUrl(cdnUrl)
      setNeedsAuth(false)
      setHasError(false)
    } else {
      setImageUrl('')
      setHasError(true)
    }
  }, [productId, index])

  const handleError = useCallback(async () => {
    try {
      let moyskladUrl = await getMoyskladImageUrl(productId)

      if (!moyskladUrl) {
        moyskladUrl = await getMoyskladVariantImageUrl(productId)
      }

      if (moyskladUrl) {
        setImageUrl(moyskladUrl)
        setNeedsAuth(true)
        setHasError(false)
      } else {
        setHasError(true)
      }
    } catch (error) {
      setHasError(true)
    }
  }, [productId])

  if (hasError || !imageUrl) {
    return (
      <View style={[styles.emptyContainer, emptyStyle]}>
        <View style={styles.emptyIconWrapper}>
          <Empty width={48} height={48} />
        </View>
      </View>
    )
  }

  const fastPriority = PRIORITY_MAP[priority]

  const imageSource = needsAuth
    ? {
        uri: imageUrl,
        priority: fastPriority,
        cache: FastImage.cacheControl.immutable,
        headers: { Authorization: MOYSKLAD_TOKEN },
      }
    : {
        uri: imageUrl,
        priority: fastPriority,
        cache: FastImage.cacheControl.immutable,
      }

  return (
    <FastImage
      style={style}
      source={imageSource}
      resizeMode={resizeMode}
      onError={handleError}
    />
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    borderWidth: 1,
    borderColor: '#4FBD01',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  emptyIconWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default memo(OptimizedImage, (prevProps, nextProps) => {
  return (
    prevProps.productId === nextProps.productId &&
    prevProps.index === nextProps.index &&
    prevProps.priority === nextProps.priority
  )
})
