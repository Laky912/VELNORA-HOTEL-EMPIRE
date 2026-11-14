# VELNORA HOTEL EMPIRE

A browser-based 3D hotel management prototype by VELNORA Studios.

## Run
Open `index.html` in a modern browser with an internet connection. The game loads Three.js and web fonts from CDNs.

## Controls
- **QASD / Arrow keys:** move your hotel worker (Q moves forward; controls can be remapped)
- **E:** interact at reception or clean a dirty room
- **Touch controls:** on-screen movement pad and action button on supported mobile devices
- **Mouse wheel:** zoom
- **Bottom navigation:** hotel construction, staff, upgrades and destinations

## Current prototype
- Expanded isometric 3D coastal resort with beach paths, loungers, umbrellas, lamps, flowerbeds, palms, facade windows and entrance awning
- Controllable hotel worker and animated guests with original procedural 3D characters, expressive faces, varied skin tones, hairstyles, uniforms and optional glasses/caps
- Articulated arms, legs and hands with improved walking cycles, shoulder movement, head motion and natural blinking
- Furnished guest rooms with bedside furniture, lamps, wardrobes and decor
- Reception check-in, guest movement from reception to assigned rooms, checkout, room reservation and cleaning loop
- Guest patience and satisfaction: waiting too long makes visitors leave unhappy; happy guests leave better tips
- Floating mood indicators above guests that shift from green to amber or red as service quality changes
- Money, reputation, guest count and mission HUD
- Room unlocking, vending machine, pool upgrade and staff hiring
- Movement, room quality and tip upgrades
- Versioned local save for cash, unlocked rooms, staff, facilities and room state
- Responsive on-screen touch controls for mobile

## Design direction
The project studies the broad idle-management loop and colorful 3D presentation of casual hotel simulators such as *My Perfect Hotel*. All game code, names, scene composition and procedural assets here are original VELNORA work; it does not use extracted game assets or copied proprietary files.

## Next production milestones
1. Guest needs, queues, room service and staff AI with collision-aware pathfinding.
2. More detailed room interiors, animation sets and facility interactions.
3. Additional facilities, hotel destinations and long-term progression.
4. Audio, settings, tutorial and performance testing across browsers and devices.


## Personal con funciones reales
- Los limpiadores y recepcionistas se contratan y contabilizan por separado.
- Los limpiadores preparan automáticamente habitaciones sucias y generan un pequeño ingreso por servicio.
- Los recepcionistas registran automáticamente a los huéspedes después de un breve tiempo de espera; cuantos más contrates, más rápido atienden.
- El coste de contratación aumenta progresivamente para equilibrar la economía.
- El guardado ahora usa la versión 3 e incluye los dos tipos de empleado. Las partidas anteriores se conservan y su personal existente se convierte en limpiadores.


## Visual upgrade
- Procedural high-resolution surface textures for grass, sand, wood, plaster, roof tiles and floor tiles.
- Reflective physical-material ocean with animated wave deformation, plus drifting cloud clusters.
- Denser tropical landscaping with shrubs, flowers and beach rocks.
- Refined directional lighting, shadow bias and fill light.
- Custom hotel entrance with glass double doors, gold trim, columns and a branded BRISA MARINA sign.

## Updated keyboard defaults
- **Q:** move forward
- **S:** move backward
- **A / D:** move left / right
- **E:** interact


## Guest behavior update
- Guests now visit the pool after their stay, relax briefly, recover satisfaction, then check out and leave the room ready for cleaning.
