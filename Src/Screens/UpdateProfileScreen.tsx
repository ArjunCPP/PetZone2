import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { useAppTheme } from '../ThemeContext';
import { UPDATE_PROFILE_IMAGE } from '../Assets';
import { Icon } from '../Components/Icon';
import { Toast } from '../Components/Toast';
import authApi from '../Api';
import { launchImageLibrary } from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'UpdateProfile'>;

export default function UpdateProfileScreen({ route, navigation }: Props) {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const userData = route.params?.userData;

  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(userData?.avatar?.url || '');

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        avatar: {
          url: avatarUrl,
          publicId: userData?.avatar?.publicId || ''
        }
      };

      const response = await authApi.updateProfile(payload);

      if (response.data && response.data.success) {
        showToast('Profile updated successfully!', 'success');
        // Small delay to let the user see the success toast before navigating back
        setTimeout(() => {
          navigation.goBack();
        }, 1200);
      } else {
        showToast(response.data?.message || 'Failed to update profile', 'error');
        setLoading(false);
      }
    } catch (error: any) {
      console.log("Error in update profile", error);
      showToast(error.response?.data?.message || 'An error occurred while updating profile', 'error');
      setLoading(false);
    }
  };

  const handleChangeImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.3,
      maxWidth: 500,
      maxHeight: 500,
    });

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorCode) {
      showToast('Image picker error: ' + result.errorMessage, 'error');
    } else if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const base64Image = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
      setAvatarUrl(base64Image);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Profile</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Profile Pic Section */}
        <View style={styles.profilePicSection}>
          <TouchableOpacity style={styles.imageWrapper} activeOpacity={0.8} onPress={handleChangeImage}>
            <Image
              source={avatarUrl ? { uri: avatarUrl } : UPDATE_PROFILE_IMAGE}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <View style={styles.editIconWrapper}>
              <Icon name="profile" size={16} color={Theme.colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{name || 'My Profile'}</Text>
          <Text style={styles.profileRole}>Pet Lover</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={[styles.inputWrapper, styles.disabledInputWrapper]}>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Enter your email"
                editable={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
              />
            </View>
          </View>

        </View>

      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Theme.colors.white} />
          ) : (
            <Text style={styles.updateBtnText}>Save Changes</Text>
          )}
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
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Theme.colors.primary + '1A' },
  backIcon: {},
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Theme.colors.text },
  backBtnPlaceholder: { width: 40 },

  scrollContent: { padding: 24, paddingBottom: 100 },

  profilePicSection: { alignItems: 'center', marginBottom: 32 },
  imageWrapper: { width: 120, height: 120, position: 'relative' },
  profileImage: { width: '100%', height: '100%', borderRadius: 60, borderWidth: 4, borderColor: Theme.colors.white },
  editIconWrapper: {
    position: 'absolute', bottom: 0, right: 0, width: 36, height: 36,
    borderRadius: 18, backgroundColor: Theme.colors.primary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Theme.colors.white
  },
  editIcon: {},
  profileName: { fontSize: 20, fontWeight: '800', color: Theme.colors.text, marginTop: 16 },
  profileRole: { fontSize: 14, fontWeight: '600', color: Theme.colors.primary },

  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 10, fontWeight: '800', color: Theme.colors.textSecondary, letterSpacing: 1 },
  inputWrapper: {
    backgroundColor: Theme.colors.white, borderRadius: 12, borderWidth: 1,
    borderColor: Theme.colors.border, paddingHorizontal: 16, height: 56, justifyContent: 'center'
  },
  disabledInputWrapper: {
    backgroundColor: Theme.colors.background,
    borderColor: Theme.colors.border,
  },
  textAreaWrapper: { height: 100, paddingTop: 12 },
  input: { fontSize: 14, fontWeight: '600', color: Theme.colors.text },
  disabledInput: {
    color: Theme.colors.textSecondary,
  },
  textArea: { textAlignVertical: 'top' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Theme.colors.white, padding: 16, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Theme.colors.border
  },
  updateBtn: {
    backgroundColor: Theme.colors.primary, width: '100%', height: 56,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  updateBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800' },
});
