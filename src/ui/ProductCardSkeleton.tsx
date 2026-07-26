import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

const ProductCardSkeleton: React.FC = () => {
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
        <View style={styles.Item}>
            <Animated.View style={[styles.ImageSkeleton, { opacity }]} />
            
            <View style={styles.Info}>
                <Animated.View style={[styles.TextLine, { opacity, width: '100%' }]} />
                <Animated.View style={[styles.TextLine, { opacity, width: '80%' }]} />
                <Animated.View style={[styles.TextLine, { opacity, width: '60%', height: 20 }]} />
            </View>

            <View style={styles.Box}>
                <Animated.View style={[styles.CounterSkeleton, { opacity }]} />
                <Animated.View style={[styles.ButtonSkeleton, { opacity }]} />
            </View>
        </View>
    )
}

export default ProductCardSkeleton

const styles = StyleSheet.create({
    Item: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        padding: 16,
        borderRadius: 16,
        maxWidth: "48%",
    },
    ImageSkeleton: {
        width: "100%",
        height: 150,
        borderRadius: 16,
        backgroundColor: "#E0E0E0",
    },
    Info: {
        marginTop: 16,
        gap: 8,
    },
    TextLine: {
        height: 16,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    Box: {
        marginTop: 20,
        gap: 16,
    },
    CounterSkeleton: {
        height: 40,
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
    },
    ButtonSkeleton: {
        height: 48,
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
    },
})

