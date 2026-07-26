import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

const CategoryCardSkeleton: React.FC = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        )
        shimmer.start()
        return () => shimmer.stop()
    }, [shimmerAnim])

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    })

    return (
        <Animated.View style={[styles.Card, { opacity }]}>
            <View style={styles.IconSkeleton} />
            <View style={styles.TextSkeleton} />
        </Animated.View>
    )
}

export default CategoryCardSkeleton

const styles = StyleSheet.create({
    Card: {
        flex: 1,
        minWidth: '45%',
        maxWidth: '48%',
        aspectRatio: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E0E0E0',
    },
    IconSkeleton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#D0D0D0',
        marginBottom: 12,
    },
    TextSkeleton: {
        width: '80%',
        height: 16,
        borderRadius: 4,
        backgroundColor: '#D0D0D0',
    },
})

