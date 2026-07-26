import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Txt from './Text';

interface Props {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<Props> = ({ 
    message = 'Загрузка...', 
    size = 'medium' 
}) => {
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const spin = () => {
            spinValue.setValue(0);
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start(() => spin());
        };
        spin();
    }, [spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const getSpinnerSize = () => {
        switch (size) {
            case 'small': return 20;
            case 'large': return 60;
            default: return 40;
        }
    };

    const getTextSize = () => {
        switch (size) {
            case 'small': return 12;
            case 'large': return 18;
            default: return 14;
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.spinner, 
                    { 
                        width: getSpinnerSize(), 
                        height: getSpinnerSize(),
                        transform: [{ rotate: spin }]
                    }
                ]}
            />
            <Txt 
                size={getTextSize()} 
                color="#4FBD01" 
                weight="Bold"
                style={styles.text}
            >
                {message}
            </Txt>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: '4%',
    },
    spinner: {
        borderWidth: 3,
        borderColor: '#E0E0E0',
        borderTopColor: '#4FBD01',
        borderRadius: 50,
        marginBottom: 16,
    },
    text: {
        textAlign: 'center',
    },
});

export default LoadingSpinner;
