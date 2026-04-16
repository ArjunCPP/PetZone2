import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, StatusBar, ActivityIndicator, Alert, BackHandler } from 'react-native';
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

  // Derived species list for UI and logic
  const availableSpecies = useMemo(() => {
    const apiSpecies = (params.applicableSpecies && params.applicableSpecies.length > 0)
      ? params.applicableSpecies
      : ['dog', 'cat'];
    return apiSpecies.map(s => s.toLowerCase());
  }, [params.applicableSpecies]);

  const [errors, setErrors] = useState<any>({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const [savedPets, setSavedPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [fetchingPets, setFetchingPets] = useState(false);

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
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);
  const [isPetModified, setIsPetModified] = useState(false);

  const fetchPets = () => {
    setFetchingPets(true);
    authApi.savedPets()
      .then((res) => {
        console.log("Saved Pets API Response:", res.data.data);
        let petsData = res.data.data || [];
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
      species: availableSpecies.includes(pet.species?.toLowerCase()) ? pet.species?.toLowerCase() : 'other',
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
      setDeletingPetId(id);
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
    } finally {
      setDeletingPetId(null);
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
      const payload: any = {
        tenantId: params.tenant,
        serviceId: params.serviceDetails,
        staffId: params.tenant,
        petDetails: {
          name: petForm.name,
          species: petForm.species.toLowerCase(),
          breed: petForm.breed,
          age: parseInt(petForm.age) || 0,
          weight: parseFloat(petForm.weight) || 0,
          gender: petForm.gender,
          notes: petForm.notes
        },
        scheduledAt: params.time,
        notes: petForm.notes || 'No special instructions',
      };

      if (selectedPetId) {
        payload.pet = selectedPetId;
      }

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
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <Icon name="back" size={20} color={Theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Pet Details</Text>
        </View>
        <View style={styles.navRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Tell us about your pet</Text>
        <Text style={styles.sectionSubtitle}>Help us provide personalized care for your pet.</Text>

        {/* Saved Pets Selection */}
        {(fetchingPets || savedPets.length > 0) && (
          <View style={styles.savedSection}>
            <Text style={styles.label}>Choose a Saved Pet</Text>
            {fetchingPets ? (
              <PetCardSkeleton />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.savedList}
              >
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
                        disabled={deletingPetId === pet._id}
                      >
                        {deletingPetId === pet._id ? (
                          <ActivityIndicator size={10} color={Theme.colors.primary} />
                        ) : (
                          <Icon name="close" size={10} color={Theme.colors.textSecondary} />
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

        {/* Pet Name */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Pet Name*</Text>
            {errors.name && <Text style={styles.errorText}>Required</Text>}
          </View>
          <TextInput
            style={[styles.input, errors.name && styles.inputError, selectedPetId && { opacity: 0.7, backgroundColor: '#F9FAFB' }]}
            placeholder="e.g. Max"
            value={petForm.name}
            onChangeText={(txt) => handleFieldChange('name', txt)}
            editable={!selectedPetId}
          />
        </View>

        {/* Species Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Species*</Text>
          <View style={styles.row}>
            {(() => {
              const apiSpecies = (params.applicableSpecies && params.applicableSpecies.length > 0)
                ? params.applicableSpecies
                : ['dog', 'cat'];

              const speciesList = apiSpecies.map(s => ({
                id: s.toLowerCase(),
                label: s.charAt(0).toUpperCase() + s.slice(1),
                icon: s.toLowerCase() === 'dog' ? 'dog' : 'pets'
              }));

              return speciesList.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.typeChip, petForm.species === s.id && styles.typeChipActive, selectedPetId && { opacity: 0.8 }]}
                  onPress={() => !selectedPetId && handleFieldChange('species', s.id)}
                >
                  <Icon
                    name={s.icon as any}
                    size={16}
                    color={petForm.species === s.id ? Theme.colors.white : Theme.colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.typeChipText, petForm.species === s.id && styles.typeChipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ));
            })()}
          </View>
        </View>

        {/* Breed */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Breed*</Text>
            {errors.breed && <Text style={styles.errorText}>Required</Text>}
          </View>
          <TextInput
            style={[styles.input, errors.breed && styles.inputError, selectedPetId && { opacity: 0.7, backgroundColor: '#F9FAFB' }]}
            placeholder="e.g. Golden Retriever"
            value={petForm.breed}
            onChangeText={(txt) => handleFieldChange('breed', txt)}
            editable={!selectedPetId}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Age (Years)*</Text>
              {errors.age && <Text style={styles.errorText}>!</Text>}
            </View>
            <TextInput
              style={[styles.input, errors.age && styles.inputError, selectedPetId && { opacity: 0.7, backgroundColor: '#F9FAFB' }]}
              placeholder="e.g. 4"
              keyboardType="numeric"
              value={petForm.age}
              onChangeText={(txt) => handleFieldChange('age', txt)}
              editable={!selectedPetId}
            />
          </View>
          <View style={{ width: 15 }} />
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Weight (Kg)*</Text>
              {errors.weight && <Text style={styles.errorText}>!</Text>}
            </View>
            <TextInput
              style={[styles.input, errors.weight && styles.inputError, selectedPetId && { opacity: 0.7, backgroundColor: '#F9FAFB' }]}
              placeholder="e.g. 12.5"
              keyboardType="numeric"
              value={petForm.weight}
              onChangeText={(txt) => handleFieldChange('weight', txt)}
              editable={!selectedPetId}
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
                style={[styles.chip, petForm.gender === g && styles.chipActive, selectedPetId && { opacity: 0.8 }]}
                onPress={() => !selectedPetId && setPetForm({ ...petForm, gender: g })}
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
            style={[styles.input, styles.textArea, selectedPetId && { opacity: 0.7, backgroundColor: '#F9FAFB' }]}
            placeholder="Special instructions or allergies..."
            multiline
            numberOfLines={4}
            value={petForm.notes}
            onChangeText={(txt) => handleFieldChange('notes', txt)}
            editable={!selectedPetId}
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
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Theme.colors.primary + '1A'
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: Theme.colors.text, fontFamily: Theme.typography.fontFamily },
  navRight: { width: 40 },

  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.text, marginBottom: 4, fontFamily: Theme.typography.fontFamily },
  sectionSubtitle: { fontSize: 12, color: Theme.colors.textSecondary, marginBottom: 24, fontWeight: '500', lineHeight: 18, fontFamily: Theme.typography.fontFamily },

  inputGroup: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 11, marginBottom: 8, fontWeight: '700', color: Theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: Theme.typography.fontFamily },
  errorText: { fontSize: 10, fontWeight: '800', color: Theme.colors.error, textTransform: 'uppercase' },
  input: {
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    fontWeight: '600',
    fontFamily: Theme.typography.fontFamily
  },
  inputError: { borderColor: Theme.colors.error },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    marginRight: 10
  },
  chipActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  chipText: { fontSize: 11, fontWeight: '800', color: '#8E9196' },
  chipTextActive: { color: Theme.colors.white },

  typeChip: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    marginRight: 10
  },
  typeChipActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  typeChipText: { fontSize: 11, fontWeight: '800', color: '#8E9196' },
  typeChipTextActive: { color: Theme.colors.white },

  footer: {
    padding: 20,
    backgroundColor: Theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingBottom: 30,
  },
  confirmBtn: {
    backgroundColor: Theme.colors.primary,
    height: 52,
    borderRadius: 16,
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
  savedSection: { marginBottom: 28 },
  savedList: { paddingRight: 20, paddingVertical: 4, gap: 10 },
  petCard: {
    width: 72,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  petAvatarActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  petName: {
    fontSize: 9,
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
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  addPetCard: {
    width: 72,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  addText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#999',
    textTransform: 'uppercase'
  },
  skeletonCard: { backgroundColor: '#F0F0F0', borderWidth: 0 },
  skeletonAvatar: { backgroundColor: '#E0E0E0' },
  skeletonName: { width: 36, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' }
});
