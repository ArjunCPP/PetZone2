import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, LayoutAnimation, Platform, UIManager, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';


type Props = NativeStackScreenProps<RootStackParamList, 'HelpCenter'>;

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Bookings' | 'Payments';
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'General',
    question: 'What is PawNest?',
    answer: 'PawNest is a comprehensive platform that connects pet owners with top-rated grooming, spa, and wellness service providers. We make pet care accessible and professional.'
  },
  {
    id: '2',
    category: 'Bookings',
    question: 'How do I book a grooming session?',
    answer: 'Simply find a shop you like, select the services you need, choose a pet from your profile, and pick an available time slot. Confirm the booking and you are all set!'
  },
  {
    id: '3',
    category: 'Bookings',
    question: 'Can I cancel or reschedule my booking?',
    answer: 'Yes, you can cancel your booking from the "My Bookings" tab. Please note that cancellations made within 12 hours of the appointment might be subject to a fee.'
  },
  {
    id: '4',
    category: 'Payments',
    question: 'Are payments secure?',
    answer: 'Absolutely. We use industry-standard payment gateways (Razorpay) to ensure all your transactions are encrypted and secure.'
  },
  {
    id: '5',
    category: 'Payments',
    question: 'How do I get a refund for a cancelled booking?',
    answer: 'Refunds are automatically processed to your original payment method within 5-7 business days after a successful cancellation request.'
  },
  {
    id: '6',
    category: 'General',
    question: 'Can I add multiple pets to my profile?',
    answer: 'Yes! You can add as many pets as you like in the Profile section. This makes it easy to switch between them when booking different services.'
  }
];

export default function HelpCenterScreen({ navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
    return true;
  }, [navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [handleBack]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const renderCategory = (category: string) => {
    const items = FAQ_DATA.filter(item => item.category === category);
    return (
      <View key={category} style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{category}</Text>
        {items.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.faqCard, expandedId === item.id && styles.faqCardExpanded]} 
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Icon 
                name={expandedId === item.id ? "chevron_down" : "chevron_right"} 
                size={20} 
                color={expandedId === item.id ? Theme.colors.primary : Theme.colors.textSecondary} 
              />
            </View>
            {expandedId === item.id && (
              <View style={styles.faqAnswerContainer}>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />
      
      {/* Header */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Help Center & FAQ</Text>
        </View>
        <View style={styles.navRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconWrapper}>
            <Icon name="explore" size={32} color={Theme.colors.primary} />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>Browse through our frequently asked questions below.</Text>
        </View>

        {['General', 'Bookings', 'Payments'].map(renderCategory)}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Still have questions?</Text>
          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={styles.contactBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (Theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background
  },
  navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navRight: { width: 40 },
  navTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  iconBtn: { 
    width: 40, height: 40, borderRadius: 20, 
    alignItems: 'center', justifyContent: 'center', 
    backgroundColor: Theme.colors.primary + '1A' 
  },
  scrollContent: { padding: 24, paddingBottom: 60 },
  heroSection: { alignItems: 'center', marginBottom: 32 },
  heroIconWrapper: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Theme.colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.text, marginBottom: 8, fontFamily: Theme.typography.fontFamily },
  heroSubtitle: { fontSize: 13, color: Theme.colors.textSecondary, textAlign: 'center', fontFamily: Theme.typography.fontFamily },
  categoryContainer: { marginBottom: 24 },
  categoryTitle: { 
    fontSize: 11, fontWeight: '800', color: Theme.colors.textSecondary, 
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, paddingLeft: 4 
  },
  faqCard: {
    backgroundColor: Theme.colors.white, borderRadius: 16, 
    marginBottom: 10, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: Theme.colors.border,
  },
  faqCardExpanded: {
    borderColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQuestion: { flex: 1, fontSize: 13, fontWeight: '700', color: Theme.colors.text, marginRight: 16, fontFamily: Theme.typography.fontFamily },
  faqAnswerContainer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  faqAnswer: { fontSize: 13, color: Theme.colors.textSecondary, lineHeight: 20, fontFamily: Theme.typography.fontFamily },
  footer: { marginTop: 16, alignItems: 'center' },
  footerText: { fontSize: 13, color: Theme.colors.textSecondary, marginBottom: 16, fontFamily: Theme.typography.fontFamily },
  contactBtn: {
    backgroundColor: Theme.colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12,
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
  },
  contactBtnText: { color: Theme.colors.white, fontSize: 14, fontWeight: '700', fontFamily: Theme.typography.fontFamily }
});
