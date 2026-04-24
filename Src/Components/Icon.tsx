import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SvgProps, Svg, Path } from 'react-native-svg';
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
  | 'eye_off'
  | 'diamond'
  | 'trending'
  | 'tag'
  | 'info';

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
  diamond: (props) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path
        d="M12 2L4 12l8 10 8-10-8-10z"
        fill={props.fill || '#000'}
      />
    </Svg>
  ),
  trending: (props) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path
        d="M13.5 1.5l3 3L11 10.5l-4-4-5.5 5.5 1.41 1.41L7 9.33l4 4 6.91-6.91 3 3V1.5h-7.33z"
        fill={props.fill || '#000'}
      />
    </Svg>
  ),
  tag: (props) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path
        d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"
        fill={props.fill || '#000'}
      />
    </Svg>
  ),
  info: (props) => (
    <Svg {...props} viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
        fill={props.fill || '#000'}
      />
    </Svg>
  )
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
