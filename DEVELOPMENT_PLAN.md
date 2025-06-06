# Aitetsu Development Plan

## Current State Analysis

### ✅ Working (Backend - Rust)
- **Project directory management**: Can set/get project directories with Git discovery
- **Fuzzy file search**: Working nucleo-matcher implementation for fast file finding
- **LLM integration**: Streaming chat completions via OpenRouter API (Gemini model)
- **Tool system**: `read_file` tool implementation for agent file access
- **Tauri setup**: Basic app structure with proper plugins

### 🔄 Partially Working (Frontend - React/TypeScript) 
- **Basic UI components**: Message, PromptArea, Header components exist
- **File picker**: `@filename` fuzzy search functionality in prompt area
- **Styling**: Catppuccin theme with Tailwind CSS setup
- **Core structure**: React app with Tauri API integration

### ❌ Broken/Missing (Frontend)
- **Chat functionality**: Chat component has undefined variables (`history`, `last`, `toolActive`, `activeTool`)
- **State management**: No global state management for messages/chat history
- **Message streaming**: UI not connected to streaming events properly
- **Error handling**: No error states or fallbacks
- **Tool feedback**: No visual indication of active tools beyond console logs

## Development Plan

### Phase 1: Frontend Foundation (Priority: HIGH)
**Goal**: Get basic chat working with proper state management

#### 1.1 State Management Setup
- [ ] Create a chat context/store for global state management
- [ ] Define proper TypeScript interfaces for messages, tools, streaming events
- [ ] Implement message history management
- [ ] Add loading/streaming states

#### 1.2 Fix Chat Component
- [ ] Connect chat to global state
- [ ] Fix undefined variable references
- [ ] Implement proper message rendering with markdown support
- [ ] Add streaming message display with cursor

#### 1.3 Stream Event Handling
- [ ] Create proper event handlers for streaming responses
- [ ] Connect frontend streaming to backend events
- [ ] Add tool execution visual feedback
- [ ] Handle errors gracefully

### Phase 2: Core Features (Priority: HIGH)
**Goal**: Complete the basic agentic assistant functionality

#### 2.1 Enhanced Tools System
- [ ] Add `write_file` tool to backend
- [ ] Add `list_directory` tool to backend  
- [ ] Add `execute_command` tool to backend
- [ ] Implement tool call visualization in UI

#### 2.2 Project Management
- [ ] Show current project directory in header
- [ ] Add project switching capability
- [ ] Persist project settings
- [ ] Add project validation

#### 2.3 Message Management
- [ ] Save/load conversation history
- [ ] Add conversation export/import
- [ ] Implement message editing
- [ ] Add conversation branching

### Phase 3: User Experience (Priority: MEDIUM)
**Goal**: Polish the interface and add productivity features

#### 3.1 UI/UX Improvements
- [ ] Add keyboard shortcuts documentation
- [ ] Implement proper focus management
- [ ] Add drag-and-drop file support
- [ ] Responsive design improvements

#### 3.2 File Integration
- [ ] Enhanced file browser with tree view
- [ ] File content preview
- [ ] Multi-file selection
- [ ] Git integration (show file status)

#### 3.3 Settings & Configuration
- [ ] Model selection interface
- [ ] API key management
- [ ] Custom system prompts
- [ ] Theme customization

### Phase 4: Advanced Features (Priority: LOW)
**Goal**: Add advanced functionality for power users

#### 4.1 Advanced Tools
- [ ] Code execution environments
- [ ] Web search capabilities
- [ ] Image generation/analysis
- [ ] Database connectivity

#### 4.2 Collaboration Features
- [ ] Conversation sharing
- [ ] Team workspaces
- [ ] Version control integration
- [ ] Plugin system

## Implementation TODOs

### Immediate (This Week)
1. **Fix broken chat state** 
   - Create `src/store/chat.tsx` with React Context
   - Define interfaces in `src/types.ts`
   - Connect Chat component to state

2. **Implement proper streaming**
   - Fix event handlers in PromptArea
   - Add visual streaming indicators
   - Handle tool execution states

3. **Basic error handling**
   - Add try/catch around API calls
   - Show error messages in UI
   - Graceful degradation

### Short Term (Next 2 Weeks)
1. **Add core tools**
   - `write_file` in Rust backend
   - `list_directory` in Rust backend
   - Tool result visualization

2. **Message persistence**
   - Local storage for conversations
   - Export/import functionality

3. **Project management**
   - Header shows current project
   - Project switching UI

### Medium Term (Next Month)
1. **Enhanced file system**
   - File tree browser
   - Content preview
   - Multi-file operations

2. **Configuration system**
   - Settings panel
   - Model selection
   - API key management

3. **Keyboard shortcuts**
   - Global shortcut system
   - Help documentation

## Technical Debt & Best Practices

### Code Quality
- [ ] Add proper TypeScript strict mode
- [ ] Implement error boundaries
- [ ] Add unit tests for core functions
- [ ] Set up proper linting rules

### Architecture
- [ ] Separate concerns (UI/Logic/State)
- [ ] Implement proper dependency injection
- [ ] Add configuration management
- [ ] Create reusable component library

### Performance
- [ ] Implement message virtualization for large chats
- [ ] Add debouncing to search inputs
- [ ] Optimize re-renders with React.memo
- [ ] Add lazy loading for components

### Security
- [ ] Validate all file paths in backend
- [ ] Sanitize markdown rendering
- [ ] Implement rate limiting
- [ ] Add input validation

## File Structure Goals

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives
│   ├── chat/           # Chat-related components
│   └── file-browser/   # File system components
├── store/              # State management
│   ├── chat.tsx        # Chat state
│   ├── project.tsx     # Project state
│   └── settings.tsx    # App settings
├── types/              # TypeScript definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── styles/             # CSS/Tailwind styles
```

## Success Metrics

### Week 1
- [ ] Chat component displays messages without errors
- [ ] Streaming responses work in UI
- [ ] File picker functionality restored

### Week 2  
- [ ] Can send messages and get responses
- [ ] Tool execution visible in UI
- [ ] Basic file operations working

### Week 4
- [ ] Conversation history persists
- [ ] Multiple tools available
- [ ] Project management working
- [ ] Basic settings interface

## Risk Mitigation

### Technical Risks
- **Complex state management**: Start simple with Context, upgrade to Redux if needed
- **Performance issues**: Implement virtualization early for large chats
- **Tool reliability**: Add comprehensive error handling and fallbacks

### Scope Risks
- **Feature creep**: Focus on core chat functionality first
- **Over-engineering**: Build minimum viable features, iterate based on usage
- **Time management**: Set clear weekly milestones and stick to them

## Dependencies Management

### Current Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Tauri APIs
- **Backend**: Rust, Tauri, reqwest, serde, nucleo-matcher
- **Styling**: Catppuccin theme, Tailwind Typography
- **Build**: Vite, Tauri CLI

### Avoid Adding
- Heavy state management libraries (start with Context)
- Complex UI component libraries (build custom with Tailwind)
- Unnecessary dependencies (evaluate each addition carefully)

---

**Next Action**: Start with fixing the Chat component state management issues.
