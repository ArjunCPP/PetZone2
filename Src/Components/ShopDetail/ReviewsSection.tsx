import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from '../Icon';
import { Skeleton } from '../Skeleton';
import { useAppTheme } from '../../ThemeContext';

interface Review {
  id: any;
  _id?: any;
  user?: {
    id: any;
    _id: any;
    name: string;
  };
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  isLoading: boolean;
  reviews: Review[];
  currentShop: any;
  currentUser: any;
  onRateNow: () => void;
  onDeleteReview: (id: string) => void;
  onSelectReview: (review: Review) => void;
  renderRatingStars: (rating: number) => React.ReactNode;
  styles: any;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  isLoading,
  reviews,
  currentShop,
  currentUser,
  onRateNow,
  onDeleteReview,
  onSelectReview,
  renderRatingStars,
  styles
}) => {
  const { theme: Theme } = useAppTheme();

  // Check if current user has already reviewed
  const userReviewRow = React.useMemo(() => {
    return currentUser ? reviews.find(r => r.user && (r.user._id === currentUser._id || r.user.id === currentUser.id || r.user._id === currentUser.id)) : null;
  }, [reviews, currentUser]);

  // Sort reviews: User's review first, then by date
  const sortedReviews = React.useMemo(() => {
    if (!currentUser || reviews.length === 0) return reviews;
    return [...reviews].sort((a, b) => {
      const isAOwner = a.user && (a.user._id === currentUser._id || a.user.id === currentUser.id || a.user._id === currentUser.id);
      const isBOwner = b.user && (b.user._id === currentUser._id || b.user.id === currentUser.id || b.user._id === currentUser.id);
      if (isAOwner) return -1;
      if (isBOwner) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, currentUser]);

  // Calculate average rating from reviews if currentShop data is missing or 0
  const averageRating = React.useMemo(() => {
    if (currentShop?.averageRating > 0) return currentShop.averageRating;
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [currentShop?.averageRating, reviews]);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <TouchableOpacity onPress={onRateNow}>
          <Text style={styles.seeAllText}>{userReviewRow ? 'Update the Review' : 'Rate Now'}</Text>
        </TouchableOpacity>
      </View>

      {/* Review Summary Card */}
      {isLoading ? (
        <Skeleton width="100%" height={140} borderRadius={24} style={{ marginBottom: 20 }} />
      ) : (
        <View style={styles.reviewSummaryCard}>
          <View style={styles.avgRatingCol}>
            <Text style={styles.avgRatingValue}>{averageRating}</Text>
            {renderRatingStars(Math.round(Number(averageRating)))}
            <Text style={styles.totalReviewsText}>{reviews.length} reviews</Text>
          </View>
          <View style={styles.ratingBarsCol}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => Math.round(r.rating) === star).length;
              const total = reviews.length || 1;
              const percent = (count / total) * 100;
              return (
                <View key={star} style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarNum}>{star}</Text>
                  <View style={styles.ratingBarBg}>
                    <View style={[styles.ratingBarFill, { width: `${percent}%`, backgroundColor: Theme.colors.primary }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Individual horizontal reviews */}
      {isLoading ? (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Skeleton width={280} height={130} borderRadius={24} />
          <Skeleton width={280} height={130} borderRadius={24} />
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyReviews}>
          <Text style={styles.emptyReviewsText}>No reviews yet. Be the first!</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reviewsListHorizontal}
        >
          {sortedReviews.map((review, index) => {
             const isOwner = currentUser && review.user && (review.user._id === currentUser._id || review.user.id === currentUser.id || review.user._id === currentUser.id);
             const isLong = review.comment.length > 40;
             return (
              <TouchableOpacity
                key={review.id || index}
                style={styles.reviewItemCard}
                onPress={() => onSelectReview(review)}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUserIcon}>
                    <Text style={styles.reviewUserInitial}>
                      {(review.user?.name || review.userName || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewUserName}>{review.user?.name || review.userName || 'User'}</Text>
                    {renderRatingStars(review.rating)}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.reviewDate}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</Text>
                    {isOwner && (
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          onDeleteReview(review._id || review.id);
                        }}
                        style={{ marginTop: 4, padding: 4 }}
                      >
                        <Icon name="close" size={14} color={Theme.colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <Text style={styles.reviewComment}>
                  {isLong ? `${review.comment.substring(0, 40)}... ` : review.comment}
                  {isLong && (
                    <Text style={{ color: Theme.colors.primary, fontWeight: '700' }}>See More</Text>
                  )}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

