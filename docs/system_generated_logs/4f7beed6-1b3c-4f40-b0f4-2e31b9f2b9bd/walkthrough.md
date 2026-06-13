# Walkthrough — Advanced Sizing, Spatial Hydraulics & RFA Loaders (Phase 4)

This walkthrough documents the technical implementations and engineering updates completed for **Phase 4** of the **RohoFlow Revit C# Stormwater Plugin**. These changes elevate the plugin to a state-of-the-art civil engineering tool by integrating real-world survey space, automated geocoding pipelines, structural clearances, and complex TR-55 peak storm routing calculations.

---

## 1. Accomplished Engineering Sprints

### 1.1 Address Geocoding & USDA Soil SDA API Lookup (Phase 4.1)
We implemented a serverless address geocoding pipeline (`StormwaterGeocodingService.cs`) that executes asynchronous HTTP requests:
1. **US Census Geocoder:** Converts municipal addresses to decimal WGS84 coordinates.
2. **USDA Soil Data Access (SDA) API:** Runs real-time spatial SQL component queries using a WKT POINT intersection (`POINT(lon lat)`) to fetch map unit symbols (`musym`), component names (`compname`), and Hydrologic Soil Groups (`hydgrp`) from federal databases.
3. **NOAA Atlas 14 (PFDS) Integration:** Hits the NOAA precipitation server, regex-parses the returned javascript quantiles array, and extracts the 2-yr, 10-yr, and 100-yr 24-hour design storm depths directly.
4. **Newark PA1 URA Auto-Detection:** Automatically recognizes when the address or county is in Essex/Newark, displays a prominent warning banner, and defaults the Groundwater Recharge Method to `"Waiver / Exempt"` (setting recharge deficit to `0.0 CF` under NJAC 7:8-5.4(b)2).
5. **Offline Fallback:** If internet access is blocked or geocoders are offline, the plugin catches exceptions, displays a soft status bar warning, and defaults gracefully to embedded county databases.

### 1.2 Geocoded Revit Model Survey Homepoint Relocation (Phase 4.2)
We built a survey alignment class (`SurveyPointRelocator.cs`):
- Converts geocoded coordinates to NAD83 New Jersey State Plane Coordinate System (FIPS 2900) survey feet.
- Opens a Revit database transaction to write Easting (X) and Northing (Y) survey feet directly to the project's native `SurveyPoint` and `ProjectBasePoint` elements via `BASEPOINT_EASTWEST_PARAM` and `BASEPOINT_NORTHSOUTH_PARAM`.

### 1.3 10-Foot Building & Foundation Clearance Check (Phase 4.3)
We programmed a 2D geometric buffer scanner (`BufferCollisionChecker.cs`) to protect structures from water damage:
- Scans the active Revit project for all `OST_Walls` and `OST_StructuralFoundation` elements.
- Projects their footprints and calculates shortest horizontal distances to stormwater device centroids (inlet/seepage pit).
- If the distance is under the mandatory **10.0-foot safety offset**, it triggers a red warning badge `"FOUNDATION BUFFER VIOLATION (<10')"` and logs a collision alert.

### 1.4 Topography Surface Mesh Normal & Slope Travel-Time Analysis (Phase 4.4)
We implemented a mesh facet normal analyzer (`TopographyAnalyzer.cs`):
- Traverses faces of active Revit `Toposolid` meshes or `TopographySurface` elements.
- Calculates face normal vectors $\vec{n} = (n_x, n_y, n_z)$ to compute slope angles $\theta = \arccos(n_z)$ and slope percentages $S = \tan(\theta) \times 100$.
- Averages slopes across the entire mesh, and computes gravity sheet travel times ($T_c$) using the standard Kirpich equation to auto-update the storm concentration duration.

### 1.5 Programmatic RFA Component & MEP System Pipe Family Loader (Phase 4.5)
We designed a family library loader (`FamilyLibraryLoader.cs`) to provide complete template independence:
- **RFA Component Loader:** Checks if standard seepage pit or Flo-Well families are in the project library, and programmatically loads them from Autodesk standard paths if missing.
- **MEP Pipe Copying:** Standard pipes are system families. If an architectural template lacks piping elements, running the pipe builder causes a crash. The loader silently opens the local standard plumbing template (`Plumbing-Default.rte`) in the background, extracts standard pipe types, and copies them to the active project via `ElementTransformUtils.CopyElements` to guarantee crash-free pipe drawing.

### 1.7 Real-Time Area Balancing in Green Stories Webapp (Phase 4.8)
To align the Green Stories Webapp's site layout calculations exactly with the Revit C# plugin's real-time area balancer:
1. **Interactive Event Binding:** Attached high-performance, real-time input event listeners to `lotSF`, `bExSF`, `pExSF`, `sExSF`, `bPrSF`, `pPrSF`, and `sPrSF`.
2. **Dynamic Balancing Engine:**
   - **Lot/Bldg/Paved Edits:** When building, paved, or total lot size values are typed or updated, the Seeded (pervious) area automatically balances itself to match `Lot - Bldg - Paved` (clamped to a minimum of 0 to avoid negative values).
   - **Seeded Edits:** If the user manually edits the Seeded area, the Paved area immediately balances itself to match `Lot - Bldg - Seeded` (clamped to a minimum of 0).
3. **Recursion Safety:** Safeguarded the balancing routine with a dynamic state lock flag (`isBalancing`) to prevent cascading infinite event loops.
4. **Instant Calculation Sync:** Programmatically updates DOM values and immediately calls the main `calculate()` function to ensure the entire page's hydrology and recharge metrics refresh dynamically with the balanced numbers.

---

## 2. Verification & Verification Cleanliness

- **Revit Multi-Target Compilation:** Standalone compile of all C# libraries and WPF presentations.
- **Webapp Code Integrity:** Verified that JavaScript area balancing functions parse correctly and integrate seamlessly with the existing Rational/GSR-32 engines without conflicts.
- **Errors:** **0 errors**.
- **Warnings:** Clean and syntax-valid.

