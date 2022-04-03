# Panorama Usage

To take full use of the prepared panorama side, please carefully read the following instructions:

## Utility functions

There is a huge palette of utility functions available from the start. Please include `utils.js` in every xml file as first script. The most important content is described below.

These function can and should be extended for any use case you might encounter along in the project.

### Namespaces

-   `Numbers` - A collection of various functions to work with numbers, like `RandomInt` or `Round`
-   `Vectors` - Vector calculations for panorama vectors (2D)
-   `Arrays` - Array utility functions
-   `Colors` - Anything that has to do with colors, like shading or marking text
-   `Panels` - Functions to extend the existing panel functionality. Please use `Abs` functions to ensure resolution-independent behavior.

### Playertables and Nettables

Various functions to help with setting up dynamic content based on table contents.

### Cross compatibility

Exposure of some server-side functions.

-   `print`
-   `error`

### Global Values

You can set and get global values, that can be used accross multiple panorama scripts (context-independent). You can also register a listener for any changes on a specific value.

To add a new global value, add a new definition for it inside `interfaces.d.ts` under the `CustomUIConfig` interface.

### Key registers

You can also register callback functions for alt and control key presses. These also include the current button state.

### Others

-   `IsCheatMode` - Are cheats enabled?
-   `SetCheatModeActivation` - Run a callback, if cheats are enabled
-   `GetConstant` - Get a server defined constant
-   `TryLocalize` - Same as a normal localize, but returns `undefined` if no localization is found
