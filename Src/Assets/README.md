# PetZone – Assets

Place your image and icon files in this folder, then uncomment the corresponding
lines in `index.ts` to use them across the app.

## Folder Structure

```
App/Assets/
├── index.ts              ← asset registry (import from here)
│
├── logo.png              ← PetZone full logo (wordmark)
├── logo_icon.png         ← Paw icon (orange, used in Header & Splash)
├── splash_bg.png         ← Splash screen background (optional)
├── dog_hero.png          ← Circular hero image on Login screen
│
├── shop_paws_claws.png   ← Shop card image: Paws & Claws Grooming
├── shop_fluffy_tail.png  ← Shop card image: The Fluffy Tail Spa
│
└── icons/
    ├── home.png
    ├── bookings.png
    ├── offers.png
    ├── profile.png
    ├── map.png
    ├── social.png
    ├── location_pin.png
    ├── paw.png
    ├── lock.png
    ├── bell.png
    ├── search.png
    ├── edit.png
    └── star.png
```

## Recommended Formats
- **Photos**: `.png` or `.jpg` (provide @2x and @3x variants)
- **Icons**: `.png` with transparent background or `.svg` via react-native-svg
- **Animations**: Lottie `.json` via `lottie-react-native`
