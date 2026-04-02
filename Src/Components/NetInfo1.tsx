import React, { useMemo,  useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Dimensions,
  BackHandler,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useAppTheme } from '../ThemeContext';
import { Icon } from './Icon';

const { width } = Dimensions.get('window');

const NetInfo1 = () => {
    const { theme: Theme } = useAppTheme();
    const styles = useMemo(() => getStyles(Theme), [Theme]);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;      // Modal backdrop
    const scaleAnim = useRef(new Animated.Value(0.8)).current;   // Card entrance
    const pulseAnim = useRef(new Animated.Value(1)).current;    // Icon pulse
    const ring1Anim = useRef(new Animated.Value(0)).current;    // Decorative ring 1
    const ring2Anim = useRef(new Animated.Value(0)).current;    // Decorative ring 2

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
        
        // Android Back Handler
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (modalVisible) return true; // Block back if offline
            return false;
        });

        return () => {
            unsubscribe();
            backHandler.remove();
        };
    }, [modalVisible]);

    const handleConnectivityChange = (state: NetInfoState) => {
        const connected = !!state.isConnected && !!state.isInternetReachable;
        
        if (!connected && !modalVisible) {
            setModalVisible(true);
            startEntranceAnimation();
            startLoopAnimations();
        } else if (connected && modalVisible) {
            hideModal();
        }
    };

    const startEntranceAnimation = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const startLoopAnimations = () => {
        // Icon Pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        ).start();

        // Ripple Rings - Ring 1
        const animateRing1 = () => {
            ring1Anim.setValue(0);
            Animated.timing(ring1Anim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true
            }).start(() => animateRing1());
        };

        // Ripple Rings - Ring 2 (Delayed)
        const animateRing2 = () => {
            ring2Anim.setValue(0);
            setTimeout(() => {
                Animated.timing(ring2Anim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true
                }).start(() => animateRing2());
            }, 1000);
        };

        animateRing1();
        animateRing2();
    };

    const hideModal = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.8, duration: 300, useNativeDriver: true }),
        ]).start(() => setModalVisible(false));
    };

    const ringOpacity1 = ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });
    const ringScale1 = ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });

    const ringOpacity2 = ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });
    const ringScale2 = ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });

    return (
        <Modal
            animationType="none"
            transparent
            visible={modalVisible}
            onRequestClose={() => {
                if (Platform.OS === 'android') BackHandler.exitApp();
            }}
        >
            <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
                    
                    {/* Creative Signal Animation Section */}
                    <View style={styles.animationArea}>
                        {/* Ripple Rings */}
                        <Animated.View style={[styles.ripple, { opacity: ringOpacity1, transform: [{ scale: ringScale1 }] }]} />
                        <Animated.View style={[styles.ripple, { opacity: ringOpacity2, transform: [{ scale: ringScale2 }] }]} />
                        
                        {/* Icon Circle */}
                        <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}>
                            <Icon name="close" size={32} color={Theme.colors.white} />
                        </Animated.View>
                    </View>

                    {/* Text Section */}
                    <Text style={styles.modalTitle}>Searching for Signal...</Text>
                    <Text style={styles.modalText}>
                        You’re currently offline. Please check your data or Wi-Fi to keep exploring PetZone.
                    </Text>

                    {/* Retry Visual */}
                    <View style={styles.dotContainer}>
                        <View style={[styles.dot, { backgroundColor: Theme.colors.primary }]} />
                        <View style={[styles.dot, { backgroundColor: Theme.colors.secondary, opacity: 0.5 }]} />
                        <View style={[styles.dot, { backgroundColor: Theme.colors.primary }]} />
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const getStyles = (Theme: any) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(26, 44, 41, 0.9)', // Custom PetZone dark-teal overlay
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        backgroundColor: Theme.colors.white,
        width: width * 0.85,
        alignItems: 'center',
        borderRadius: 30, // Extra rounded for premium feel
        paddingTop: 40,
        paddingBottom: 32,
        paddingHorizontal: 24,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 12,
    },
    animationArea: {
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    ripple: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: Theme.colors.primary,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Theme.colors.primary, // PetZone Teal
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    modalTitle: {
        color: Theme.colors.text,
        fontWeight: '900',
        fontSize: 22,
        fontFamily: Theme.typography.fontFamily,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    modalText: {
        color: Theme.colors.textSecondary,
        fontSize: 15,
        fontFamily: Theme.typography.fontFamily,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    dotContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 32,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});

export default NetInfo1;
