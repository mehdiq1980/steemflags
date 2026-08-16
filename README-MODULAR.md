# Modular Frontend Migration

The legacy monolithic game has been replaced at the entry point with a small `index.html` shell. The frontend is being rebuilt as independent modules so each feature can evolve without returning to a monolithic file.

Planned modules live under `js/modules/`, with styles under `css/` and reusable UI under `components/`.
