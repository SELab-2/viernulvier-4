# Media API Overview

Welcome to the Media API documentation. This section of the application is responsible for managing, storing, and structuring all visual content (images, crops, and collections) and the underlying physical files.

## Core Concepts

The Media API is built around four main components that are closely connected:

1. **[Media Storage](storage.md):** The foundation. This component manages the actual physical binary files on the server (uploading, fetching, and deleting).
2. **[Media Items](items.md):** The logical database representation of a file. This is where metadata such as the original resolution, URL, alt texts, and potential credits are stored. Items are often categorized by their intended display position (e.g., a **'main'** image or a **'carousel'** item).
3. **[Media Crops](crops.md):** Derived versions of a Media Item. Think of specific cutouts (e.g., a **'thumbnail'** crop for list views, or an **'FE3_header'** crop for page headers) of the same original file. A crop is always linked to exactly one Media Item.
4. **[Media Galleries](galleries.md):** A collection of multiple Media Items. Galleries are used to create logical groups of images, defined by their specific type (e.g., a standard **'default'** collection or a specialized **'prints'** gallery).

## Relationships Under the Hood

Although the endpoints are documented per component in the menu, these entities work together as follows:

* **Item ⟷ Crop (1:N):** A `Media Item` can have multiple cutouts (`Media Crops`).
* **Gallery ⟷ Item (N:M):** A `Media Gallery` can contain multiple `Media Items`, and a specific image can exist in multiple galleries simultaneously.
* **Domain Links:** The `Media Gallery` acts as the bridge to the rest of the application. Galleries can be linked via their unique ID to other domains within the platform, such as Blogs, Productions, and Events.