import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Icon } from '../Icon';
import { Skeleton } from '../Skeleton';
import { useAppTheme } from '../../ThemeContext';
import { Service } from '../../Screens/ShopDetailScreen';

interface ServicesSectionProps {
  isLoading: boolean;
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (id: string | null) => void;
  onOpenDetails: (service: Service) => void;
  styles: any;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  isLoading,
  services,
  selectedServiceId,
  onSelectService,
  onOpenDetails,
  styles
}) => {
  const { theme: Theme } = useAppTheme();

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Services</Text>
      </View>

      <View style={styles.servicesGrid}>
        {isLoading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%' }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={(Dimensions.get('window').width - 52) / 2} height={130} borderRadius={20} />
            ))}
          </View>
        ) : services.length === 0 ? (
          <View style={styles.loaderCenter}>
            <Text style={styles.loaderText}>No services available</Text>
          </View>
        ) : (
          services.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                onPress={() => onSelectService(isSelected ? null : service.id)}
              >
                <TouchableOpacity
                  style={styles.absInfoBtn}
                  onPress={() => onOpenDetails(service)}
                >
                  <Icon name="info" size={14} color={Theme.colors.textSecondary} />
                </TouchableOpacity>

                <View style={[styles.serviceIconContainer, isSelected && styles.serviceIconContainerSelected]}>
                  <Icon name={service.icon || 'pets'} size={20} color={isSelected ? Theme.colors.primary : Theme.colors.primary} />
                </View>
                <View style={styles.serviceBody}>
                  <View style={styles.serviceTitleRow}>
                    <Text style={[styles.serviceTitle, isSelected && styles.serviceTitleSelected]} numberOfLines={1}>{service.title}</Text>
                  </View>
                  <Text style={[styles.serviceDesc, isSelected && styles.serviceDescSelected]} numberOfLines={2}>{service.description}</Text>
                  <Text style={[styles.servicePrice, isSelected && styles.servicePriceSelected]}>₹{service.price}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
};
