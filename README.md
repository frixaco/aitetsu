# Aitetsu

### TODO

- [x] Implemented high performance canvas using pure DOM from scratch. Can handle ~450 cards while providing smooth panning and zooming.
- [ ] Decide where I wanna take this project

### Ideas

- For seamless edit/view mode for cards:
  - When input box, buttons are hovered, they work immediately and you can't dragging while pressing those
  - Everywhere else (e.g. messages, empty areas) are for dragging
- Collabsible responses for easier navigation
- Fix titlebar on macOS: https://v2.tauri.app/learn/window-customization/#macos-transparent-titlebar-with-custom-window-background-color
- Have 2 modes for each card: AI chat and Note. Can switch modes for existing cards as well: AI chats -> become fully formatted markdown Note, Note -> populate input box for AI chat
- Pin a message like a bookmark (e.g. wanna bookmark an explanation response in a long conversation about smth)
