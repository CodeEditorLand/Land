# Current Tasks

## Immediate Tasks (Batches 13-20)

### Compatibility Requirements ⚠️

- [ ] Maintain backwards compatibility with ALL existing code
- [ ] Keep existing PascalCase naming conventions
- [ ] Don't break existing APIs or interfaces
- [ ] Add new features as extensions, not replacements

### Grove (WASM+Rhai) 🟡

- Research existing SpineConnection patterns
- [ ] Add EchoAction SUPPORT (not replacement) to SpineConnection
- [ ] Keep existing SpineConnection methods intact
- [ ] Add new EchoAction methods alongside old ones
- [ ] Implement Rhai runtime integration (separate module)
- [ ] Add package loading (.wsix, .rix) - new feature
- [ ] Create extension loader that respects existing patterns

### Cocoon (Node.js) 🔴

- Research existing MountainClientService patterns
- [ ] Add EchoAction SUPPORT (not replacement)
- [ ] Keep all existing RPC methods intact
- [ ] Add EchoAction as optional layer
- [ ] Maintain existing CircuitBreaker pattern
- [ ] Add package validation layer
- [ ] Create extension marketplace client

### Mountain (Spine) ☀️

- [ ] Update Vinyl.proto (ADD, not replace EchoAction messages)
- [ ] Keep all existing RPC services
- [ ] Add new EchoActionService alongside others
- [ ] Add extension router as NEW service
- [ ] Keep TODO tracking and completion going (256 remaining)
- [ ] Improve existing services with telemetry ( additive )

### Wind (Frontend) ⚪

- [ ] Research existing Effect-TS patterns
- [ ] Keep all existing services
- [ ] Add EchoAction client as optional layer
- [ ] Maintain existing Configuration/Telemetry patterns
- [ ] Add extension host selector UI (new)

### Documentation 📚

- [ ] Document backwards compat strategy
- [ ] Document migration path (optional)
- [ ] Keep all existing docs valid
- [ ] Add migration guides for optional EchoAction usage

### Testing ✅

- [ ] Test all existing functionality still works
- [ ] Test backwards compat of new features
- [ ] Test EchoAction as optional add-on
- [ ] Test both old and new patterns work together

## Design Principles

### 1. Additive Only 📥

- Never remove existing methods
- Always add NEW methods, don't replace
- Use feature flags to enable new features
- Keep old code paths working

### 2. Dual Support 🤝

- Support both old RPC and new EchoAction
- Let users choose which to use
- Gradually migrate, don't force
- Provide migration guides

### 3. Pattern Research 🔍

- Read existing code before implementing
- Follow existing conventions
- Use existing naming schemes
- Match existing error handling

### 4. Testing First 🧪

- Test existing still works
- Test new features
- Test integration
- Test backwards compat
