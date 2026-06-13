# Tasks

- `[x]` Phase 4.1: Address Geocoding & USDA Soil SDA API Integration (Option B)
  - `[x]` Implement `AddressGeocodingService` in C# to call the US Census Geocoder API for Lat/Lon
  - `[x]` Implement USDA Soil Data Access (SDA) SOAP/POST API integration to fetch Soil HSG and soil names in real-time
  - `[x]` Build NOAA Atlas 14 precipitation frequency lookup by parsing result variables from Python/H5 API
  - `[x]` Integrate Newark PA1 URA recharge exemption auto-detection banner and defaults

- `[x]` Phase 4.2: Revit Project BasePoint & SurveyPoint Survey Relocation
  - `[x]` Implement `SurveyPointRelocator` in `RohoFlow.Bridge` to programmatically translate geocoded coordinates to NJ State Plane feet
  - `[x]` Open a Revit write transaction to update `BASEPOINT_EASTWEST_PARAM` and `BASEPOINT_NORTHSOUTH_PARAM` on the active project's Survey Point

- `[x]` Phase 4.3: 10-Foot Building & Foundation Buffer Checking
  - `[x]` Implement `BufferCollisionChecker` in `RohoFlow.Bridge` to scan walls and structural foundations in the project
  - `[x]` Calculate 2D distances between stormwater elements (inlet, seepage pit) and building structures
  - `[x]` Trigger warning state `"FOUNDATION BUFFER VIOLATION (<10')"` in red if a modeled stormwater element is closer than 10.0 feet

- `[x]` Phase 4.4: Topography Surface Mesh Normal & Slope Travel-Time Analysis
  - `[x]` Implement geometry mesh extractor on Revit `Toposolid` and `TopographySurface` elements
  - `[x]` For each triangular face, compute normal vector $\vec{n} = (n_x, n_y, n_z)$ and face slope percentage $S$
  - `[x]` Compute average slope percentage across the topography surface and show flow velocity travel times

- `[x]` Phase 4.5: Programmatic RFA Component & MEP System Pipe Family Loader
  - `[x]` Program dynamic family checks to verify if standard component families (Peerless Seepage Pits, Flo-Wells) are loaded
  - `[x]` Automatically extract and load missing `.rfa` families from Autodesk's default system libraries or backup local paths on-demand
  - `[x]` Program background copying of native Pipe Types from standard templates (`Plumbing-Default.rte`) if missing, to prevent architectural template crashes

- `[x]` Phase 4.6: Full Major Development Sizing Pipeline (SCS & TR-55 Chapter 6 Sizing)
  - `[x]` Implement County 2-yr, 10-yr, and 100-yr Precipitation projected tables inside `RainfallData.cs`
  - `[x]` Implement SCS TR-55 Graphical Peak unit discharge peak curves using Type III coefficients
  - `[x]` Implement TR-55 Chapter 6 polynomial storage-indication volume calculation: $V_s / V_r = 0.682 - 1.43x + 1.64x^2 - 0.804x^3$
  - `[x]` Expose results on the WPF calculation panel and output them to schedules

- `[x]` Phase 4.7: User Interface WPF Integrations
  - `[x]` Update `StormwaterCalcView.xaml` to add the Address Geocoding block, Geocoding result panel, Newark exemption info banner, and relocation button
  - `[x]` Bind elements to the updated properties and commands in `StormwaterCalcViewModel.cs`
  - `[x]` Complete compiling and verify the C# Revit plugin compiles with zero errors

- `[x]` Phase 4.8: Real-Time Area Balancing in Green Stories Webapp
  - `[x]` Implement recursion-safe area-balancing JavaScript logic in `stormwater-v2.php`
  - `[x]` Automatically adjust Seeded area when building, paved, or lot areas change
  - `[x]` Automatically adjust Paved area when Seeded area changes
  - `[x]` Verify that all changes integrate seamlessly with the existing `calculate()` event engine

