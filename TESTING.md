# Software Engineering Portfolio - Testing Documentation

## Overview

This document provides comprehensive information about the testing setup for the Software Engineering Portfolio frontend application.

## Test Framework Setup

### Dependencies Added
- **Vitest** - Modern test runner with Vite integration
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM testing
- **@testing-library/user-event** - User interaction simulation
- **@vitest/coverage-v8** - Code coverage reporting
- **@vitest/ui** - Visual test interface
- **jsdom** - DOM environment for testing

### Configuration Files
- `vitest.config.js` - Main test configuration
- `src/test/setup.js` - Test environment setup and global mocks
- `src/test/testUtils.jsx` - Reusable test utilities and helpers

## Test Structure

### Component Tests
Located in: `src/pages/portfolios/softwareEngineer/components/__tests__/`

1. **Layout.test.jsx** (8 tests)
   - Component rendering with different props
   - Navigation functionality
   - CSS class application
   - Children content handling

2. **Sidebar.test.jsx** (10 tests)
   - Navigation items rendering
   - Collapse/expand functionality
   - Accessibility features
   - Hover effects and styling
   - Keyboard navigation

3. **Dashboard.test.jsx** (8 tests)
   - Authentication state handling
   - User information display
   - Navigation redirects
   - Role-based rendering
   - Different email formats

4. **Portfolio.test.jsx** (10 tests)
   - Loading states
   - Data rendering across all sections
   - Editing functionality
   - Admin features
   - Error handling
   - Empty state handling

5. **ReadOnlyPortfolio.test.jsx** (12 tests)
   - Read-only mode functionality
   - Data display across all sections
   - Example view mode
   - Different user states
   - Last refresh timestamp

6. **SoftwareEngineerApp.test.jsx** (12 tests)
   - Route handling for all paths
   - Authentication-based routing
   - Component rendering
   - Context management
   - Multiple route changes

## Test Coverage Areas

### ✅ Functional Testing
- Component rendering and mounting
- User interactions (clicks, form inputs, navigation)
- State management and updates
- Props handling and validation
- Event handling and callbacks

### ✅ Authentication Testing
- Login/logout flows
- Protected route access
- Role-based rendering
- Context state management
- localStorage integration

### ✅ Routing Testing
- Route navigation
- Authentication-based redirects
- URL parameter handling
- Route protection
- Navigation state management

### ✅ Data Flow Testing
- API data loading
- Loading states
- Error handling
- Empty state management
- Data persistence

### ✅ UI/UX Testing
- Responsive behavior
- Accessibility features
- CSS class application
- Hover and focus states
- Modal and overlay behavior

### ✅ Error Handling Testing
- Network errors
- Invalid data
- Missing dependencies
- Authentication failures
- Component error boundaries

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test Layout.test.jsx

# Run tests matching pattern
npm test -- --grep "renders"
```

### Advanced Commands
```bash
# Run tests with UI interface
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run tests with verbose output
npm test -- --reporter=verbose

# Run tests in specific directory
npm test -- src/pages/portfolios/softwareEngineer
```

## Test Utilities

### Custom Render Functions
- `renderWithProviders()` - Renders with AuthContext and MemoryRouter
- `renderWithBrowserRouter()` - Renders with AuthContext and BrowserRouter

### Mock Data
- `mockPortfolioData` - Complete portfolio data structure
- `mockUser` - User authentication data
- `generateTestSkills()` - Dynamic skill data generation
- `generateTestProjects()` - Dynamic project data generation

### Mock Functions
- `mockLocalStorage()` - localStorage API mocking
- `mockFetch()` - Fetch API mocking with responses
- `mockFetchError()` - Fetch API error mocking
- `createMockHandlers()` - Event handler mocks

## Best Practices Implemented

### Test Organization
- One test file per component
- Descriptive test names following "should [behavior] when [condition]" pattern
- Grouped tests by functionality
- Clear setup and teardown

### Mocking Strategy
- Mock external dependencies (APIs, browser APIs)
- Use realistic test data
- Consistent mock setup across tests
- Avoid over-mocking internal logic

### Assertions
- Test user-visible behavior
- Verify accessibility attributes
- Check CSS classes and styling
- Validate data flow and state changes
- Test both success and error scenarios

### Performance
- Fast test execution with Vitest
- Parallel test running
- Efficient mocking to avoid real API calls
- Minimal DOM manipulation in tests

## Continuous Integration

### GitHub Actions Integration
The test suite is designed to work with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm install
    npm run test:coverage
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### Coverage Thresholds
- Minimum 80% line coverage
- Minimum 70% branch coverage
- Minimum 60% function coverage

## Debugging Tests

### Common Issues and Solutions

1. **Import Errors**
   - Check file paths and component exports
   - Verify test file location and naming

2. **Mock Failures**
   - Ensure mocks are properly set up in `setup.js`
   - Check mock implementation matches expected API

3. **Async Issues**
   - Use `waitFor()` for async operations
   - Properly handle loading states in tests

4. **DOM Errors**
   - Ensure proper cleanup between tests
   - Check for memory leaks in component unmounting

### Debug Commands
```bash
# Run single test with debug output
npm test -- --run Layout.test.jsx

# Run tests with console output
npm test -- --reporter=verbose

# Debug specific test
npm test -- --grep "should render" --reporter=verbose
```

## Future Enhancements

### Planned Improvements
- [ ] Integration tests for complete user flows
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility testing automation
- [ ] E2E testing with Playwright

### Test Expansion
- [ ] More edge case coverage
- [ ] Error boundary testing
- [ ] Performance optimization testing
- [ ] Cross-browser compatibility testing

## Contributing

### Adding New Tests
1. Follow existing naming conventions
2. Use provided test utilities
3. Include both positive and negative test cases
4. Update this documentation if adding new test patterns

### Test Review Checklist
- [ ] Tests cover main functionality
- [ ] Edge cases are handled
- [ ] Mocks are appropriate and minimal
- [ ] Assertions are meaningful
- [ ] Tests are readable and maintainable
- [ ] Performance is acceptable

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://testing-library.com/docs/guide-which-query/)


