# ES Module Integration Test Checklist

This checklist verifies that the ES module integration is working correctly.

## Automated Tests ✓

- [x] **Unit Tests**: Run `npm test` - All tests should pass
- [x] **Module Integration Test**: Run `node test-module-integration.js` - All checks should pass
- [x] **Production Build**: Run `npm run build` - Should complete without errors

## Manual Browser Tests

### 1. Test Page Verification

- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:3000/test-es-modules.html
- [ ] All tests should show "PASS" in green
- [ ] Check browser console - no errors should appear

### 2. Main Game Verification

- [ ] Open http://localhost:3000
- [ ] Game should load properly
- [ ] Check browser console for:
  - No JavaScript errors
  - Process.env is defined
  - Game class is available globally
- [ ] Start a new game - should work normally

### 3. Developer Tools Test

- [ ] Open browser DevTools console
- [ ] Type `window.Game` - should show the Game class
- [ ] Type `process.env.NODE_ENV` - should show "development"
- [ ] Type `new Game()` - should create a game instance

### 4. ES Module Loading Test

- [ ] In DevTools, check Network tab
- [ ] Filter by JS files
- [ ] Verify these files load:
  - src/gameWrapper.js
  - src/Game-browser.js
  - Related model/utility files

### 5. Import Map Test

- [ ] In browser console, run:
  ```javascript
  import('@models/AreaData.js').then(m => console.log(m));
  ```
- [ ] Should successfully import the module

## Production Tests

### 1. Build Output Verification

- [ ] Check dist/ folder after build
- [ ] Verify src/gameWrapper.js is copied
- [ ] Check bundle sizes are reasonable

### 2. Production Deployment Test

- [ ] Build with `npm run build`
- [ ] Serve dist/ folder with a static server
- [ ] Verify game works in production mode
- [ ] Check `process.env.NODE_ENV` shows "production"

## Cross-Browser Testing

Test in multiple browsers:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

## Common Issues to Check

1. **MIME Type Errors**: Should not see "blocked because of a disallowed MIME type"
2. **Module Resolution**: No errors about bare specifiers or missing modules
3. **Process Not Defined**: Should not see "process is not defined" errors
4. **Global Exposure**: Game class should be available on window object

## Performance Checks

- [ ] Page load time is acceptable
- [ ] No significant console warnings about performance
- [ ] Module loading doesn't block game initialization

## Final Verification

If all tests pass:

1. The ES module integration is working correctly
2. Legacy compatibility is maintained
3. The game can be developed using modern ES modules
4. Production builds continue to work as expected

## Troubleshooting

If tests fail, check:

1. Browser console for specific error messages
2. Network tab for failed module loads
3. Webpack dev server logs
4. File permissions and paths
