import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
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
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

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
      if (selectedAsset) {
        const formData = new FormData();
        
        const fileObj = {
          uri: Platform.OS === 'ios' && !selectedAsset.uri.startsWith('file://') ? `file://${selectedAsset.uri}` : selectedAsset.uri,
          type: selectedAsset.type || 'image/jpeg',
          name: selectedAsset.fileName || `avatar_${Date.now()}.jpg`
        };
        
        console.log("Avatar upload payload file obj:", fileObj);
        formData.append('file', fileObj as any);
        
        try {
          const uploadRes = await authApi.uploadsAvatar(formData);
          console.log("Upload avatar response:", uploadRes.data);
          
          if (uploadRes.data && !uploadRes.data.success) {
            showToast(uploadRes.data.message || 'Failed to upload image', 'error');
            setLoading(false);
            return; // Stop if avatar upload explicitly failed
          }
        } catch (uploadError: any) {
          console.log("Avatar upload via new API failed", uploadError);
          console.log("Error response API:", uploadError.response?.data);
          showToast(uploadError.response?.data?.message || 'Failed to upload image due to network error', 'error');
          setLoading(false);
          return; // Stop if there's a hard error
        }
      }

      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        ...( !selectedAsset && {
          avatar: {
            url: avatarUrl,
            publicId: userData?.avatar?.publicId || ''
          }
        })
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
      includeBase64: false,
      quality: 0.5,
      maxWidth: 800,
      maxHeight: 800,
    });

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorCode) {
      showToast('Image picker error: ' + result.errorMessage, 'error');
    } else if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedAsset(asset);
      if (asset.uri) {
        setAvatarUrl(asset.uri);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Icon name="back" size={20} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

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

          <View style={styles.footer}>
            <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <Text style={styles.updateBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.background
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.primary + '1A' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text },
  headerRight: { width: 40 },

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
    backgroundColor: Theme.colors.background, padding: 16, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: Theme.colors.border
  },
  updateBtn: {
    backgroundColor: Theme.colors.primary, width: '100%', height: 56,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  updateBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '800' },
});
