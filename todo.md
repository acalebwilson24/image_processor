## Basic Functionality

A tool to automatically target faces and crop to squares around those faces, based on a minimum face percentage of frame.

Most face recognition tools seem to rely on cropping as close to the face as possible. Conversely, diffusion models are often trained on pure centre crops of images, so often cut off portrait photos. This tool aims to combine facial recognition with the necessary square crops required by current diffusion models by positioning a given square crop such that the face is both in frame and (if requested) taking up a certain minimum percentage of the frame.

The main functionality will be accessible via an API, with a basic frontend user interface for smaller datasets and/or less technical users.

## Frontend

- [ ] Finalise basic crop tool
- [ ] Investigate different options for crop overlay
- [ ] Complete basic design
- [ ] Image resize option (default 512x512)
- [ ] Download button
 
## Backend

- [ ] Port existing python script to Javascript, or run a seperate python server
- [ ] Train facial recognition model (to replace existing dependency)
- [ ] Design basic API surface
- [ ] Investigate API key solutions