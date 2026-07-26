import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, {createRef, useEffect, useState} from 'react';
import { navList } from '../constants';
import Txt from '../ui/Text';
import useCartStore from '../store/cart';
import useFavoriteStore from '../store/favorite';
import useDeliveryStore from '../store/delivery';
import useGlobalStore from '../store';
import { NavigationContainerRef } from "@react-navigation/native";
import {RootStackParamList} from "../RootLayout";



export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

export function navigate(name: keyof RootStackParamList, params?: any) {
    navigationRef.current?.navigate(name, params);
}

export function getCurrentRoute() {
    return navigationRef.current?.getCurrentRoute();
}

const Navigation = () => {
    const { cartList, getCartList } = useCartStore();
    const { favoriteList, getFavoriteList } = useFavoriteStore();
    const { deliveryData } = useDeliveryStore();
    const { hideNavigation } = useGlobalStore();
    const [currentRoute, setCurrentRoute] = useState<string | undefined>();

    useEffect(() => {
        getCartList();
        getFavoriteList();
        const interval = setInterval(() => {
            setCurrentRoute(getCurrentRoute()?.name);
        }, 100);
        return () => clearInterval(interval);
    }, [getCartList, getFavoriteList]);

    const isHiddenImage = ["/checkout", "/cart", "/", "/auth"].includes(deliveryData?.type?.toString() || '');

    function isActive(link: string) {
        return link === currentRoute;
    }

    if (hideNavigation) {
        return null;
    }

    return (
        <View style={styles.NavBox}>
            <View style={styles.Navigation}>
                {navList.map((item, index) => {
                    const isActiveRoute = isActive(item.link)
                    const iconColor = item.name === "избранное" && isActiveRoute ? "#EF2D45" : "#4FBD01"
                    
                    const handlePress = () => {
                        if (item.link === 'profile') {
                            const { isAuth } = useGlobalStore.getState()
                            navigate(isAuth ? 'profile' : 'auth')
                        } else {
                            navigate(item.link as any)
                        }
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.5}
                            style={styles.NavItem}
                            onPress={handlePress}
                        >
                            <item.icon isBold={isActiveRoute} color={iconColor} width={28} height={28} />
                            <Txt weight={isActiveRoute ? "RobotoCondensed-Bold" : "RobotoCondensed-Regular"} size={12}>{item.name}</Txt>

                            {item.name === "корзина" && <View style={styles.Indicator}>
                                <Txt weight='RobotoCondensed-Bold' color='#F73106' size={14}>{cartList.length}</Txt>
                            </View>}

                            {item.name === "избранное" && <View style={styles.Indicator}>
                                <Txt weight='RobotoCondensed-Bold' color='#F73106' size={14}>{favoriteList.length}</Txt>
                            </View>}
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    );
}

export default Navigation;

const styles = StyleSheet.create({
    Navigation: {
        width: "100%",
        height: 80,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        backgroundColor: "#FDF5E5",
        zIndex: 10, // бар поверх картинки
        elevation: 6, // для Android чтобы перекрывал по z
        paddingBottom: 15
    },
    NavItem: {
        width: "100%",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        position: 'relative',
    },
    NavBox: {
        position: "relative",
    },
    Indicator: {
        position: "absolute",
        top: -5,
        transform: [{ translateX: -20 }]
    }
});
