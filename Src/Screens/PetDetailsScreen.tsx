import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { Icon } from '../Components/Icon';
import authApi from '../Api';
import { Toast } from '../Components/Toast';

type Props = NativeStackScreenProps<RootStackParamList, 'PetDetails'>;

export default function PetDetailsScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const params = route.params;

  const [loading, setLoading] = useState(false);
  const [petForm, setPetForm] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    weight: '',
    gender: 'male',
    notes: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const [savedPets, setSavedPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [fetchingPets, setFetchingPets] = useState(false);
  const [isPetModified, setIsPetModified] = useState(false);

  const fetchPets = () => {
    setFetchingPets(true);
    authApi.savedPets()
      .then((res) => {
        console.log("Saved Pets API Response:", res.data.data.data);
        let petsData = res.data.data.data || [];
        console.log("Processed Pets Data:", petsData);
        setSavedPets(petsData);
      })
      .catch(err => console.log("Error fetching saved pets:", err))
      .finally(() => setFetchingPets(false));
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleFieldChange = (key: string, value: string) => {
    setPetForm((prev: any) => ({ ...prev, [key]: value }));
    if (selectedPetId) {
      setIsPetModified(true);
    }
    if (errors[key]) {
      setErrors((prev: any) => ({ ...prev, [key]: false }));
    }
  };

  const handleSelectSavedPet = (pet: any) => {
    setSelectedPetId(pet._id);
    setIsPetModified(false); // Reset modification flag when a new pet is selected
    setPetForm({
      name: pet.name || '',
      species: pet.species || 'dog',
      breed: pet.breed || '',
      age: String(pet.age || ''),
      weight: String(pet.weight || ''),
      gender: pet.gender || 'male',
      notes: pet.notes || ''
    });
    setErrors({});
  };

  const handleDeletePet = async (id: string) => {
    try {
      // Optimistic/Direct delete
      const res = await authApi.deleteSavedPet(id);
      if (res.data && res.data.success) {
        setSavedPets(prev => prev.filter(p => p._id !== id));
        if (selectedPetId === id) {
          setSelectedPetId(null);
          setPetForm({
            name: '', species: 'dog', breed: '', age: '', weight: '', gender: 'male', notes: ''
          });
        }
      }
    } catch (error) {
      console.log("Delete error:", error);
      setToast({ visible: true, message: 'Failed to delete pet', type: 'error' });
    }
  };

  const PetCardSkeleton = () => (
    <View style={[styles.savedList, { flexDirection: 'row' }]}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.petCard, styles.skeletonCard]}>
          <View style={[styles.petAvatar, styles.skeletonAvatar]} />
          <View style={styles.skeletonName} />
        </View>
      ))}
    </View>
  );

  const validate = () => {
    let newErrors: any = {};
    if (!petForm.name.trim()) newErrors.name = true;
    if (!petForm.species.trim()) newErrors.species = true;
    if (!petForm.breed.trim()) newErrors.breed = true;
    if (!petForm.age.trim()) newErrors.age = true;
    if (!petForm.weight.trim()) newErrors.weight = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) {
      setToast({ visible: true, message: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // 1. Check if we need to update the saved pet details
      if (selectedPetId && isPetModified) {
        try {
          const updatePayload = {
            id: selectedPetId,
            name: petForm.name,
            species: petForm.species,
            breed: petForm.breed,
            age: parseInt(petForm.age) || 0,
            weight: parseFloat(petForm.weight) || 0,
            gender: petForm.gender,
            notes: petForm.notes
          };
          console.log("🚀 [Update Pet] Payload:", JSON.stringify(updatePayload, null, 2));
          const updateRes = await authApi.updateSavedPet(updatePayload);
          console.log("✅ [Update Pet] Response:", JSON.stringify(updateRes.data, null, 2));
        } catch (updateErr: any) {
          console.log("⚠️ [Update Pet] Failed:", updateErr.response?.data || updateErr.message);
          // We don't block the booking if only the pet update fails, 
          // but we log it clearly.
        }
      }

      // 2. Create the booking
      const payload = {
        tenantId: params.tenant,
        serviceId: params.serviceDetails,
        staffId: params.tenant,
        petDetails: {
          name: petForm.name,
          species: petForm.species,
          breed: petForm.breed,
          age: parseInt(petForm.age) || 0,
          weight: parseFloat(petForm.weight) || 0,
          gender: petForm.gender,
          notes: petForm.notes
        },
        scheduledAt: params.time,
        notes: petForm.notes || 'No special instructions',
        totalAmount: params.price
      };

      console.log('🚀 [Create Booking] Payload:', JSON.stringify(payload, null, 2));

      const response = await authApi.createBooking(payload);
      console.log('✅ [Create Booking] Response:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.success) {
        setToast({ visible: true, message: 'Booking created successfully!', type: 'success' });
        setTimeout(() => {
          navigation.navigate('Payment', {
            ...params,
            bookingId: response.data.data?._id || response.data.data?.id || 'BK' + Date.now()
          });
        }, 1500);
      } else {
        setToast({ visible: true, message: response.data?.message || 'Failed to create booking.', type: 'error' });
      }
    } catch (error: any) {
      console.log('❌ Create Booking Error:', error.response?.data || error.message);
      setToast({ visible: true, message: 'Something went wrong while creating your booking.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.navBar}>
        <View style={styles.navLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Pet Details</Text>
        </View>
        <View style={styles.navRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Tell us about your pet</Text>
        <Text style={styles.sectionSubtitle}>We want to provide the best care for your furry friend.</Text>

        {/* Saved Pets Selection */}
        <View style={styles.savedSection}>
          <Text style={styles.label}>Choose a Saved Pet</Text>
          {fetchingPets ? (
            <PetCardSkeleton />
          ) : savedPets.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.savedList}
            >
              {savedPets.map((pet) => {
                const isSelected = selectedPetId === pet._id;
                return (
                  <TouchableOpacity
                    key={pet._id || Math.random().toString()}
                    style={[styles.petCard, isSelected && styles.petCardActive]}
                    onPress={() => handleSelectSavedPet(pet)}
                  >
                    <View style={[styles.petAvatar, isSelected && styles.petAvatarActive]}>
                      <Icon
                        name={pet.species === 'dog' ? 'dog' : 'pets'}
                        size={20}
                        color={isSelected ? Theme.colors.white : Theme.colors.primary}
                      />
                    </View>
                    <Text
                      style={[styles.petName, isSelected && styles.petNameActive]}
                      numberOfLines={1}
                    >
                      {pet.name || 'Unnamed'}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Icon name="check" size={8} color={Theme.colors.white} />
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeletePet(pet._id);
                      }}
                    >
                      <Icon name="close" size={10} color={Theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.addPetCard}
                onPress={() => {
                  setSelectedPetId(null);
                  setPetForm({
                    name: '',
                    species: 'dog',
                    breed: '',
                    age: '',
                    weight: '',
                    gender: 'male',
                    notes: ''
                  });
                }}
              >
                <View style={styles.addAvatar}>
                  <Text style={{ fontSize: 24, color: Theme.colors.textSecondary, fontWeight: '300' }}>+</Text>
                </View>
                <Text style={styles.addText}>New</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <Text style={{ fontSize: 13, color: Theme.colors.textSecondary, fontStyle: 'italic', marginBottom: 10 }}>No saved pets found.</Text>
          )}
        </View>

        {/* Pet Name */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Pet Name*</Text>
            {errors.name && <Text style={styles.errorText}>Required</Text>}
          </View>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g. Max"
            value={petForm.name}
            onChangeText={(txt) => handleFieldChange('name', txt)}
          />
        </View>

        {/* Species Selection */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Species*</Text>
            {errors.species && <Text style={styles.errorText}>Required</Text>}
          </View>
          <TextInput
            style={[styles.input, errors.species && styles.inputError]}
            placeholder="e.g. Dog, Cat, Bird"
            value={petForm.species}
            onChangeText={(txt) => handleFieldChange('species', txt)}
          />
        </View>

        {/* Breed */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Breed*</Text>
            {errors.breed && <Text style={styles.errorText}>Required</Text>}
          </View>
          <TextInput
            style={[styles.input, errors.breed && styles.inputError]}
            placeholder="e.g. Golden Retriever"
            value={petForm.breed}
            onChangeText={(txt) => handleFieldChange('breed', txt)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Age (Years)*</Text>
              {errors.age && <Text style={styles.errorText}>!</Text>}
            </View>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              placeholder="e.g. 4"
              keyboardType="numeric"
              value={petForm.age}
              onChangeText={(txt) => handleFieldChange('age', txt)}
            />
          </View>
          <View style={{ width: 15 }} />
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Weight (Kg)*</Text>
              {errors.weight && <Text style={styles.errorText}>!</Text>}
            </View>
            <TextInput
              style={[styles.input, errors.weight && styles.inputError]}
              placeholder="e.g. 12.5"
              keyboardType="numeric"
              value={petForm.weight}
              onChangeText={(txt) => handleFieldChange('weight', txt)}
            />
          </View>
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender*</Text>
          <View style={styles.row}>
            {['male', 'female'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.chip, petForm.gender === g && styles.chipActive]}
                onPress={() => setPetForm({ ...petForm, gender: g })}
              >
                <Text style={[styles.chipText, petForm.gender === g && styles.chipTextActive]}>
                  {g.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Extra Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Special instructions or allergies..."
            multiline
            numberOfLines={4}
            value={petForm.notes}
            onChangeText={(txt) => handleFieldChange('notes', txt)}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
        </TouchableOpacity>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
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
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Theme.colors.primary + '1A'
  },
  navTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  navRight: { width: 40 },

  scrollContent: { padding: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.text, marginBottom: 6, fontFamily: Theme.typography.fontFamily },
  sectionSubtitle: { fontSize: 13, color: Theme.colors.textSecondary, marginBottom: 28, fontWeight: '500', lineHeight: 18, fontFamily: Theme.typography.fontFamily },

  inputGroup: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 12, marginBottom: 10, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontFamily: Theme.typography.fontFamily },
  errorText: { fontSize: 10, fontWeight: '800', color: Theme.colors.error, textTransform: 'uppercase' },
  input: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.roundness.default,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    fontWeight: '600',
    fontFamily: Theme.typography.fontFamily
  },
  inputError: { borderColor: Theme.colors.error },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginRight: 10
  },
  chipActive: {
    backgroundColor: Theme.colors.primary,
  },
  chipText: { fontSize: 12, fontWeight: '800', color: '#888' },
  chipTextActive: { color: Theme.colors.white },

  footer: {
    padding: 24,
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingBottom: 34, // Extra padding for safe area logic if not using inset
  },
  confirmBtn: {
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.roundness.large,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  confirmBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800', fontFamily: Theme.typography.fontFamily },

  // Saved Pets Styles
  savedSection: { marginBottom: 32 },
  savedList: { paddingRight: 24, paddingVertical: 8 },
  petCard: {
    width: 76,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative'
  },
  petCardActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
    elevation: 4,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  petAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  petAvatarActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  petName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#444',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  petNameActive: {
    color: Theme.colors.white,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.white,
    zIndex: 10
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  addPetCard: {
    width: 76,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  addText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#999',
    textTransform: 'uppercase'
  },
  skeletonCard: { backgroundColor: '#F0F0F0', borderWidth: 0 },
  skeletonAvatar: { backgroundColor: '#E0E0E0' },
  skeletonName: { width: 40, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' }
});
