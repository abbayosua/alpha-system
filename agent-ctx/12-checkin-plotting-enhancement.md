---
## Task ID: 12 - Check-in, Plotting, and Footer Enhancement Agent
### Work Task
Enhance both check-in pages (morning and final) with step indicators, gradient cards, confetti success animation, and framer-motion. Enhance the plotting page with gradient title, shadcn Select, TPS info card, avatar initials, stats summary, and stagger animations. Verify landing page footer year is dynamic.

### Work Summary

#### A. Check-in Page (`src/app/saksi/check-in/page.tsx`)

1. **StepIndicator Component**: Horizontal 3-step progress indicator with small circles connected by lines:
   - Step 1: "Ambil Foto Selfie" (Camera icon)
   - Step 2: "Aktifkan GPS" (MapPin icon)
   - Step 3: "Submit Check-in" (CheckCircle2 icon)
   - Active step pulses with `shadow-[0_0_0_3px_rgba(16,185,129,0.2)]` ring animation
   - Completed steps: filled emerald circle with CheckCircle2, emerald connecting line
   - Future steps: gray border with gray icon
   - Step derivation logic based on selfieBase64 and gpsCoords state

2. **Gradient Card Headers**:
   - Camera card: `bg-gradient-to-r from-emerald-500 to-emerald-600` with white text and `text-emerald-100` description
   - GPS card: `bg-gradient-to-r from-teal-500 to-teal-600` with white text and `text-teal-100` description
   - Added "Foto Diambil" badge overlay on selfie preview when captured

3. **Enhanced Success State with Confetti**:
   - `ConfettiParticles` component: 24 particles with randomized colors (emerald, teal, amber, rose, violet, cyan), positions, delays, and rotations
   - CSS-based keyframe animation using framer-motion: y-translation, opacity fade, x-drift, rotation, scale
   - Animated checkmark: scale bounce `0 → 1.2 → 1` with staggered inner icon appearance
   - Staggered text and badge fade-in animations (0.6s, 0.7s, 0.8s delays)
   - Card has `overflow-hidden` to contain confetti particles

4. **Empty State (No Assignment)**:
   - Pulsing map illustration placeholder (scale animation with `motion.div`)
   - Dashed border circle with gradient background (`from-emerald-50 to-teal-50`)
   - "Belum Ada Penugasan" message with "Kembali ke Dashboard" button

5. **Framer Motion Animations**:
   - Header: slide-in from left (`x: -20 → 0`)
   - Step indicator: fade-in from top (`y: -10 → 0`, delay 0.1s)
   - Camera card: fade-in from below (`y: 20 → 0`, delay 0.15s)
   - GPS card: fade-in from below (delay 0.25s)
   - Submit button: fade-in from below (delay 0.35s)

#### B. Final Check-in Page (`src/app/saksi/final-check-in/page.tsx`)
All enhancements from the check-in page applied identically, adapted for the "Akhir" (Final) context:
- Same StepIndicator, ConfettiParticles, gradient card headers, empty state, and motion animations
- Success state shows "Check-in Akhir Berhasil" with "Input Suara" + "Dashboard" buttons instead of single "Kembali" button

#### C. Plotting Page (`src/app/admin/plotting/page.tsx`)

1. **Page Title Area**: Gradient banner (`from-emerald-50 to-teal-50`) with decorative circles (top-right `w-32 h-32 emerald-100/60`, bottom-left `w-20 h-20 teal-100/40`). Back button integrated with `bg-white/60` style.

2. **Stats Summary Section** (4 cards, `grid-cols-2 md:grid-cols-4`):
   - **Penugasan Aktif**: emerald border, GitBranch icon
   - **Belum Ditugaskan**: amber border, Users icon
   - **Total TPS**: teal border, MapPin icon
   - **TPS Terisi**: emerald border, CheckCircle2 icon

3. **Replaced Native Select with shadcn/ui Select**:
   - Imported `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from `@/components/ui/select`
   - Replaced `<select>` element with shadcn Select components
   - Uses `onValueChange` prop for controlled state

4. **TPS Info Card** (in assign dialog, animated reveal):
   - Appears when a TPS is selected using `motion.div` with height animation
   - Shows: TPS code/name, address (line-clamp-2), current assignment count
   - Mini map placeholder: gradient background with dashed border showing coordinates

5. **Enhanced Assignment Table**:
   - **User avatar initials**: Gradient circle with 2-letter initials
   - **TPS badge**: Gradient background with emerald border and MapPin icon
   - **Date formatting**: `day month short year` format
   - **Staggered row animations**: `motion.tr` with rowVariants

6. **Stagger Animations** (framer-motion):
   - `containerVariants` with `staggerChildren: 0.08` on root container
   - `itemVariants` for cards: `y: 20 → 0`
   - `rowVariants` for list items: `x: -10 → 0`

#### D. Landing Page Footer (`src/app/page.tsx`)
- **No changes needed**: The footer already uses `{new Date().getFullYear()}` at line 547.

#### E. Lint Status
- Zero lint errors after all changes
