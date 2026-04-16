import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { useAppTheme } from '../ThemeContext';

// Import SVGs
import SearchIcon from '../Assets/Icons/Search.svg';
import NotificationsIcon from '../Assets/Icons/Notifications.svg';
import LocationIcon from '../Assets/Icons/Location.svg';
import HeartIcon from '../Assets/Icons/Heart.svg';
import HeartFilledIcon from '../Assets/Icons/HeartFilled.svg';
import StarIcon from '../Assets/Icons/Star.svg';
import ExploreIcon from '../Assets/Icons/Explore.svg';
import BookingsIcon from '../Assets/Icons/Bookings.svg';
import ProfileIcon from '../Assets/Icons/Profile.svg';
import OfferIcon from '../Assets/Icons/Offer.svg';

// Service & Nav Icons
import ShowerIcon from '../Assets/Icons/Shower.svg';
import CutIcon from '../Assets/Icons/Cut.svg';
import PetsIcon from '../Assets/Icons/Pets.svg';
import DogIcon from '../Assets/Icons/Dog.svg';
import ShareIcon from '../Assets/Icons/Share.svg';
import BackIcon from '../Assets/Icons/Back.svg';

// Admin Icons
import LockIcon from '../Assets/Icons/Lock.svg';
import ClockIcon from '../Assets/Icons/Clock.svg';
import CheckIcon from '../Assets/Icons/Check.svg';
import SettingsIcon from '../Assets/Icons/Settings.svg';

// New Navigation Icons
import ChevronDownIcon from '../Assets/Icons/ChevronDown.svg';
import ChevronRightIcon from '../Assets/Icons/ChevronRight.svg';
import ArrowForwardIcon from '../Assets/Icons/ArrowForward.svg';
import CloseIcon from '../Assets/Icons/Close.svg';

// Social & Auth Icons
import GoogleIcon from '../Assets/Icons/Google.svg';
import EyeIcon    from '../Assets/Icons/Eye.svg';
import EyeOffIcon from '../Assets/Icons/EyeOff.svg';

export type IconName = 
  | 'search' 
  | 'notifications' 
  | 'location' 
  | 'heart' 
  | 'heart_filled'
  | 'star' 
  | 'explore' 
  | 'bookings' 
  | 'profile' 
  | 'offer'
  | 'shower'
  | 'cut'
  | 'pets'
  | 'dog'
  | 'share'
  | 'back'
  | 'lock'
  | 'clock'
  | 'check'
  | 'settings'
  | 'chevron_down'
  | 'chevron_right'
  | 'arrow_forward'
  | 'close'
  | 'google'
  | 'eye'
  | 'eye_off';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const ICONS: Record<IconName, React.FC<SvgProps>> = {
  search: SearchIcon,
  notifications: NotificationsIcon,
  location: LocationIcon,
  heart: HeartIcon,
  heart_filled: HeartFilledIcon,
  star: StarIcon,
  explore: ExploreIcon,
  bookings: BookingsIcon,
  profile: ProfileIcon,
  offer: OfferIcon,
  shower: ShowerIcon,
  cut: CutIcon,
  pets: PetsIcon,
  dog: DogIcon,
  share: ShareIcon,
  back: BackIcon,
  lock: LockIcon,
  clock: ClockIcon,
  check: CheckIcon,
  settings: SettingsIcon,
  chevron_down: ChevronDownIcon,
  chevron_right: ChevronRightIcon,
  arrow_forward: ArrowForwardIcon,
  close: CloseIcon,
  google: GoogleIcon,
  eye: EyeIcon,
  eye_off: EyeOffIcon,
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color,
  style 
}) => {
  const { theme: Theme } = useAppTheme();
  const styles = useMemo(() => getStyles(Theme), [Theme]);
  const SvgIcon = ICONS[name];
  
  const iconColor = color || Theme.colors.textSecondary;
  
  if (!SvgIcon) return null;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* 
        For Google, we don't want to force a fill color if it's multi-colored.
        If a color is explicitly passed AND it's not a multi-color icon, use it.
      */}
      {name === 'google' ? (
        <SvgIcon width={size} height={size} />
      ) : (
        <SvgIcon width={size} height={size} fill={iconColor} />
      )}
    </View>
  );
};

const getStyles = (Theme: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
