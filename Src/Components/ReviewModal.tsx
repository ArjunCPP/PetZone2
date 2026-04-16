import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useAppTheme } from '../ThemeContext';
import { Icon } from './Icon';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  shopName: string;
  initialReview?: { rating: number; comment: string };
}

export const ReviewModal = ({ visible, onClose, onSubmit, shopName, initialReview }: ReviewModalProps) => {
  const { theme: Theme } = useAppTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible && initialReview) {
      setRating(initialReview.rating);
      setComment(initialReview.comment);
    } else if (visible) {
      setRating(0);
      setComment('');
    }
  }, [visible, initialReview]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Review submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.container}
            >
              <View style={[styles.content, { backgroundColor: Theme.colors.background }]}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={[styles.title, { color: Theme.colors.text }]}>
                    {initialReview ? 'Update Your Review' : 'Write a Review'}
                  </Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Icon name="close" size={20} color={Theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.subtitle, { color: Theme.colors.textSecondary }]}>
                  How was your experience at {shopName}?
                </Text>

                {/* Star Rating */}
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={star <= rating ? 'star' : 'star'} // Icon component might not have star_outline, using color to differentiate
                        size={36}
                        color={star <= rating ? '#F4C430' : '#E0E0E0'}
                        style={styles.star}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Comment Input */}
                <View style={[styles.inputContainer, { borderColor: Theme.colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: Theme.colors.text }]}
                    placeholder="Share your feedback..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    value={comment}
                    onChangeText={setComment}
                    textAlignVertical="top"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: Theme.colors.primary },
                    (rating === 0 || isSubmitting) && { opacity: 0.5 }
                  ]}
                  onPress={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    width: '100%',
    maxWidth: 400
  },
  content: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    fontSize: 20,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20
  },
  closeBtn: {
    padding: 4
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24
  },
  star: {
    marginHorizontal: 4
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    minHeight: 100
  },
  input: {
    fontSize: 15,
    height: 100
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  }
});
