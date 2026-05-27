# VCD System — UI Team Guide

**Project:** VCD 3D Monitoring System (영동 1호기 고압차단기 위치안내시스템)  
**Stack:** React 19 · TypeScript · Tailwind CSS 4 · Three.js / R3F · GSAP

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Layout Architecture](#3-layout-architecture)
4. [Design System](#4-design-system)
5. [Component Reference](#5-component-reference)
   - 5.1 Header
   - 5.2 Sidebar
   - 5.3 StatusList
   - 5.4 FloorPlan (2D)
   - 5.5 Modals
6. [Data Types & Props](#6-data-types--props)
7. [State & Data Flow](#7-state--data-flow)
8. [API Endpoints](#8-api-endpoints)
9. [Extending the UI](#9-extending-the-ui)

---

## 1. Project Overview

The VCD System is a real-time 3D visualization tool for monitoring and managing high-voltage circuit breakers (고압차단기) at Yeongdong Power Plant Unit 1. 

### Core Functions

| Function | Description |
|---|---|
| 3D Scene | Live camera animation navigates to breaker location in a 3D model |
| 2D FloorPlan | SVG bird's-eye view mirrors camera position with a red dot |
| Operation Lifecycle | Register → Start → Complete with team/personnel assignment |
| Alarm Overlay | Active panels trigger red pulse in 3D area + blinking in 2D |
| History | Full query interface for past operations |

### UI Constraints

- **Do not modify** the 3D scene rendering logic (`src/scene/`).
- **Do not modify** the panel polling logic or `clearActivePanels` flow — these are safety-critical.
- The 3D canvas is mounted in an **isolated React root** inside `canvasContainerRef`. Changes to App state do not re-render the canvas.

---

## 2. Tech Stack

| Category | Library | Version | Notes |
|---|---|---|---|
| UI Framework | React | 19.0.0 | Hooks only, no class components |
| Language | TypeScript | ~5.8 | Strict mode |
| Styling | Tailwind CSS | 4.1 | No config file — JIT via Vite plugin |
| Icons | lucide-react | 0.546 | Tree-shaken SVG icons |
| 3D Engine | Three.js + R3F | 0.183 + 9.5 | React-Three-Fiber bridge |
| 3D Helpers | @react-three/drei | 10.7 | OrbitControls, Html, Float, Text |
| Animation | GSAP | 3.14 | Camera timeline tweens only |
| UI Animation | CSS / Tailwind | — | `animate-pulse`, `animate-ping` |
| Build | Vite | 6.2 | HMR enabled; ignores `data/**` |
| Dev Server | tsx watch | 4.21 | Ignores `panels-state.json`, `data/**` |

---

## 3. Layout Architecture

### Top-Level Structure

```
App (full viewport)
├── Left Nav Bar (64px wide, fixed)
│   ├── Logo
│   ├── 5 icon buttons (Dashboard, Unit, Alarm, History, Settings)
│   └── Footer (Support / copyright)
│
└── Main Area (flex-1, flex-row)
    ├── FloorPlan (30% width, full height)
    │   └── SVG 2D bird's-eye view
    │
    └── 3D + Sidebar Area (70% width, flex-col)
        ├── Header (full width of this column)
        │
        └── Content Row (flex-row, flex-1)
            ├── 3D Zone (flex-1)
            │   ├── Canvas container (div, 3D root injected here)
            │   ├── Alarm Overlay (absolute, z-20)
            │   └── Unit Label Footer
            │
            └── Sidebar (288px wide)
                ├── 통신정보 (communication status)
                ├── Registration buttons (top)
                ├── StatusList (scrollable)
                └── Action buttons (bottom)
```

### Responsive Breakpoints

The layout is designed for **large screens (1080p+)** in a control room environment. Mobile/tablet are not primary targets, but Tailwind `md:` classes are present:

- Below `md`: columns stack vertically; 3D area takes 60% height, FloorPlan 40% height
- Above `md`: side-by-side columns (30% / 70% split)

---

## 4. Design System

### Color Palette

The system uses a **light, professional** palette — white backgrounds, blue accents, semantic alert colors.

| Role | Token | Hex | Usage |
|---|---|---|---|
| Primary | `blue-600` | `#2563eb` | Active buttons, links, key info |
| Primary light | `blue-50` | `#eff6ff` | Hover states |
| Surface | `white` | `#ffffff` | Cards, panels, modal bodies |
| Background | `gray-50` / `slate-50` | `#f9fafb` | Section backgrounds |
| Border | `gray-200` | `#e5e7eb` | Default borders |
| Text primary | `gray-900` | `#111827` | Headings, main labels |
| Text secondary | `gray-500` | `#6b7280` | Subtitles, sub-labels |
| Text muted | `gray-400` | `#9ca3af` | Metadata, timestamps |
| Success | `emerald-500/600` | `#10b981` | Online status, completion |
| Alarm / Error | `red-500` | `#ef4444` | Active alarms, blinking panels |
| Info | `violet-600` | `#7c3aed` | History modal, monthly stats |
| Warning | `amber-500` | `#f59e0b` | Use sparingly |

### Typography

All fonts are system fonts via Tailwind defaults. No custom webfonts loaded.

| Element | Classes | Notes |
|---|---|---|
| Page title | `text-[15px] font-bold text-gray-900` | Header main label |
| Section header | `text-[10px] font-bold uppercase tracking-widest` | Sidebar section titles |
| Button label | `text-[13px] font-bold tracking-tight` | Primary button text |
| Button sub | `text-[9px] font-semibold tracking-[0.2em] uppercase` | English subtitle on buttons |
| Status badge | `text-[9px] font-bold` | Header info chips |
| Panel ID (2D) | `font-mono text-[46px] font-black` | SVG text in FloorPlan |
| Timestamps | `font-mono text-[12px] font-bold text-blue-600` | Header clock |

### Spacing & Sizing

| Element | Value |
|---|---|
| Left nav width | `64px` (w-16) |
| Sidebar width | `288px` (w-72) |
| Header height | ~56px (controlled by padding `py-2.5`) |
| Button padding (active) | `py-4` |
| Button padding (inactive) | `py-3.5` |
| Border radius (cards) | `rounded-xl` (12px) |
| Border radius (modals) | `rounded-2xl` (16px) |

### Component Patterns

**Cards / Sections:**  
```
rounded-xl bg-gray-50 border border-gray-200 overflow-hidden
```

**Status Badge (online):**
```
relative w-2 h-2 rounded-full bg-emerald-400
+ absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50
```

**Active Button:**
```
bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-md shadow-blue-100
```

**Inactive Button:**
```
bg-white hover:bg-gray-50 border-gray-200
```

---

## 5. Component Reference

### 5.1 Header

**File:** `src/design/layout/Header.tsx`

**Props:**

```ts
{
  targetPanels: ActivePanel[];   // drives alarm count + red pulse
  statusOps: Operation[];        // drives monthly operation count
}
```

**Sections (left → right):**

| Section | Content |
|---|---|
| Brand mark | Vertical blue bar stack + "YEONGDONG POWER PLANT · UNIT 1" + Korean title |
| 운전상태 | Always shows "정상가동" (static) |
| 알람 | Count of `targetPanels`; red pulse when `> 0`, emerald "없음" when clear |
| 패널 | Static "47" (total breaker count) |
| 월간 | Count of `statusOps` in current calendar month |
| Clock | `YYYY.MM.DD HH:mm:ss` updated every 1 second |

**Key behaviors:**
- Clock uses `setInterval(1000)` in `useEffect`, cleaned up on unmount.
- Alarm badge color is dynamic — do not hardcode.

---

### 5.2 Sidebar

**File:** `src/design/layout/Sidebar.tsx`

**Props:**

```ts
{
  statusOps: Operation[];
  statusLoading: boolean;
  onSelectOp: (op: Operation) => void;
  onRegister: () => void;
  onStart: () => void;
  onComplete: () => void;
  onHistory: () => void;
  activeSideBtn: string;
  setActiveSideBtn: (label: string) => void;
}
```

**Button Map:**

| Label | Action | Group |
|---|---|---|
| 조작 등록 / REGISTER | `onRegister()` | Top |
| 조작등록내역 / STATUS | (opens status modal) | Top |
| 조작 시작 / START | `onStart()` | Bottom |
| 조작 완료 / COMPLETE | `onComplete()` | Bottom |
| 이력 조회 / HISTORY | `onHistory()` | Bottom |

**Button active state:** `activeSideBtn === label` → blue fill.

**Communication Status (통신정보):**  
Two always-on indicators with `animate-ping` dots:
- GENi 연동 (emerald)
- 키보관함 연동 (blue)

These are static UI — no live connection checks.

---

### 5.3 StatusList

**File:** `src/design/layout/StatusList.tsx`

**Props:**

```ts
{
  statusOps: Operation[];
  statusLoading: boolean;
  onSelectOp: (op: Operation) => void;
}
```

Renders a scrollable list of in-progress operations between the two button groups in Sidebar. Clicking an item calls `onSelectOp(op)`, which opens `OpDetailModal`.

---

### 5.4 FloorPlan (2D)

**File:** `src/design/FloorPlan.tsx`

**Props:**

```ts
{
  cameraPos: { x: number; z: number; rotation: number };
  panels: any[];             // placement data (PANELS constant from App.tsx)
  targetSubIds: number[];    // panel sub-IDs to highlight red
  targetPanels: ActivePanel[];
}
```

**Coordinate Mapping (3D → 2D SVG):**

```
SVG viewBox: 2400 × 4000
Horizontal (Z axis):  svgX = 1200 + z * 120
Vertical   (X axis):  svgY = -150 + (35 - x) * 140  (for x ≥ 11)
                       svgY = yAt11 + (11 - x) * 40  (for x < 11, compressed)
```

**Panel Cards (SVG `<rect>`):**
- Size: 440 × 250 units
- Normal: `stroke="#94a3b8"` (gray), `strokeWidth=3`
- Active: `stroke="#ef4444"` (red), `strokeWidth=6`, `animate` stroke-opacity 1→0.4→1

**Camera Dot:**  
Three concentric `<circle>` elements at `(mapX2D(cameraPos.z), mapY2D(cameraPos.x))`:
- r=120, fillOpacity=0.15 (outer halo)
- r=60, fillOpacity=0.25 (mid halo)
- r=30, `animate-pulse`, white stroke (main dot)

**Active Glow (SVG filter):**  
`id="active-glow-red"` — Gaussian blur + red flood composite. Applied when `isSelected`.

---

### 5.5 Modals

All modals share a common shell:

```
fixed inset-0 z-50
bg-black/70 backdrop-blur-sm        ← backdrop
flex items-center justify-center
  └─ div.rounded-2xl.bg-white.shadow-xl    ← modal card
      ├─ Header (gradient bg, icon, title, close button)
      ├─ Body (form / list / detail)
      └─ Footer (action buttons)
```

**Current theme:** Light — white card body, colored gradient headers.

| Modal | File | Header Color | Purpose |
|---|---|---|---|
| RegistrationModal | `modals/RegistrationModal.tsx` | Blue gradient | Register new breaker operation |
| StartModal | `modals/StartModal.tsx` | Sky gradient | Assign team + start operations |
| CompleteModal | `modals/CompleteModal.tsx` | Emerald gradient | Mark operations complete |
| HistoryModal | `modals/HistoryModal.tsx` | Violet gradient | Query operation history table |
| OpDetailModal | `modals/OpDetailModal.tsx` | Slate | View single operation detail |
| StatusModal | `modals/StatusModal.tsx` | — | Browse operations by status tab |

**Shared Modal Behaviors:**
- Close button: top-right `×`
- Backdrop click: does NOT close (intentional — prevents accidental dismissal)
- Success animation: `animate-ping` ring + delay → `onClose()` after ~1.4s
- All modals call `sceneRef.current?.cancelAnimation()` before opening (stops 3D camera move)

**RegistrationModal — Key UI Elements:**

- Panel search input with QR icon button
- Department `<select>` (from `staffData.ts`)
- Reason `<select>` (from `staffData.ts`)  
- Multi-select panel checklist (panels filtered by search)
- Submit → success screen with animated check ring

**StartModal — Key UI Elements:**

- Team `<select>` → filters supervisor list
- Supervisor `<select>` → filters worker list
- Pending operations checklist (fetched from `/api/operations?status=대기`)
- Confirm button → POST `/api/operations/:id/start`

**CompleteModal — Key UI Elements:**

- In-progress operations list with `select all` toggle
- Team / supervisor / worker selectors
- Submit → PATCH `/api/operations/:id` `{ status: '완료' }`

**HistoryModal — Key UI Elements:**

- Table: unitId, panelName, opType, operator, department, status, date
- Status filter `<select>` (전체/진행중/완료/실패)
- Date range inputs
- Empty state illustration when no results

**OpDetailModal — Key UI Elements:**

- Read-only. Two card sections: 작업정보 / 키정보
- `unitId` displayed in large mono font
- Status badge (color-coded by `status`)
- `typeTag` badges per operation type

---

## 6. Data Types & Props

### Core Types (`src/data/types.ts`)

```ts
interface ActivePanel {
  id: number;          // panel sub-ID (matches PANELS upperId/lowerId)
  status: string;      // e.g. "active"
  description: string;
}

interface Operation {
  id: number;
  panelId: number;
  unitId: string;      // e.g. "52G-1"
  panelName: string;
  opType: 'KEY CLOSED' | 'KEY OPEN' | 'KEY ALERT';
  operator: string;
  department: string;
  purpose: string;
  status: '완료' | '진행중' | '실패';
  notes: string;
  operatedAt: string;  // ISO 8601
}

interface PanelInfo {
  glbKey: string;
  unitId: string;
  name: string;
  type: string;
  systemCode: string;
  systemName: string;
  groupCode: string;
  groupMcs: string;
}
```

### Scene Ref Handle (`src/scene/Scene.tsx`)

The 3D scene exposes an imperative handle via `sceneRef`:

```ts
interface SceneHandle {
  startAnimation: (panelIds: number[]) => void;  // fly camera to panels + blink
  cancelAnimation: () => void;                   // return camera to home
}
```

**Rule:** UI components must never directly manipulate Three.js objects. Only call `sceneRef.current.startAnimation()` / `cancelAnimation()`.

---

## 7. State & Data Flow

### App-Level State

```
App.tsx
│
├── targetPanels: ActivePanel[]          polled every 1s from GET /api/active-panels
│   ├── → Header (alarm count/badge)
│   ├── → FloorPlan (targetSubIds — red blink)
│   └── → 3D Alarm Overlay (absolute div over canvas)
│
├── statusOps: Operation[]               fetched on mount from GET /api/operations?status=진행중
│   ├── → Header (monthly count)
│   └── → Sidebar → StatusList
│
├── cameraPos: {x, z, rotation}          updated by 3D scene via onCameraUpdate callback
│   └── → FloorPlan (camera dot position)
│
├── activeSideBtn: string                tracks which sidebar button is "active"
│
├── selectedOp: Operation | null         set when user clicks item in StatusList
│   └── → OpDetailModal (isOpen when !== null)
│
└── showRegistration/Start/Complete/History: boolean
    └── → respective modal isOpen props
```

### Panel Polling Flow

```
setInterval(1000ms)
  → GET /api/active-panels
  → compare JSON with lastFetchedRef.current (avoids re-render on no change)
  → if changed:
      setTargetPanels(panels)
      if panels.length > 0 && !isOperationActiveRef.current:
        sceneRef.current.startAnimation(panelIds)   ← starts 3D camera move
      if panels.length === 0:
        (alarms cleared — overlays disappear automatically via React state)
```

### clearActivePanels (alarm reset)

```ts
const clearTargetPanels = useCallback(async () => {
  await fetch('/api/active-panels', { method: 'DELETE' });
  lastFetchedRef.current = '[]';
  setTargetPanels([]);    // ← clears FloorPlan blink + 3D overlay immediately
}, []);
```

This is passed as `clearActivePanels` prop to the 3D scene. Called after camera returns home.

---

## 8. API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/active-panels` | Returns currently active panels `ActivePanel[]` |
| DELETE | `/api/active-panels` | Clears all active panels (alarm reset) |
| GET | `/api/operations` | All operations. Query: `?status=진행중` |
| POST | `/api/operations` | Create new operation |
| PATCH | `/api/operations/:id` | Update operation (status, notes, etc.) |
| GET | `/api/operations/:id` | Single operation detail |

All responses follow:
```ts
{ status: 'success' | 'error', data?: T, error?: string }
```

---

## 9. Extending the UI

### Adding a New Modal

1. Create `src/design/modals/YourModal.tsx`
2. Follow the modal shell structure (see §5.5)
3. Add `showYourModal: boolean` state to `App.tsx`
4. Add a button in `Sidebar.tsx` (add to `SIDE_BUTTONS` array)
5. Pass `onYourModal={() => setShowYourModal(true)}` down the prop chain
6. Render `<YourModal isOpen={showYourModal} onClose={() => setShowYourModal(false)} />` in App JSX

### Adding a New Header Chip

Inside the right group of `Header.tsx`, copy an existing chip pattern:
```tsx
<div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">
  <span className="text-[9px] font-bold text-gray-500">Label</span>
  <span className="text-[9px] font-bold text-blue-600">{value}</span>
</div>
```

### Adding a New FloorPlan Overlay

Add a new `<g>` block inside the SVG in `FloorPlan.tsx`. Use `mapX2D()` and `mapY2D()` for coordinate conversion. Do not change the `viewBox` dimensions or coordinate mapping functions.

### Changing Colors / Themes

- Tailwind utility classes only — no separate CSS files
- For new semantic colors not in Tailwind defaults, use arbitrary values: `bg-[#1e3a5f]`
- All modals currently use white card body (`bg-white`) with colored gradient headers

### Do Not Touch

| File / Area | Reason |
|---|---|
| `src/scene/` | 3D rendering, GSAP animation, camera logic |
| `clearActivePanels` / `clearTargetPanels` | Safety-critical alarm reset flow |
| Panel polling interval in App.tsx | Tied to 3D animation trigger |
| `isOperationActiveRef` | Guards against double-animation |
| `canvasContainerRef` isolated root | Prevents 3D reload on App re-renders |
| `PANELS` constant (24-column layout) | Hard-coded to match 3D model geometry |

---

*Last updated: 2026-05-27*  
*Repo: https://github.com/outdream2/DNSVCDSYSTEM*
