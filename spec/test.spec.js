describe('Flashcard App', () => {
  let script;
  
  beforeEach(() => {
    // Mock localStorage for Node.js testing
    global.localStorage = {
      data: {},
      getItem(key) { return this.data[key] || null; },
      setItem(key, value) { this.data[key] = value; },
      removeItem(key) { delete this.data[key]; },
      clear() { this.data = {}; }
    };

    // Mock document for jsdom with all necessary elements
    if (!global.document) {
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
          <body>
            <div id="main"></div>
            <button id="home"></button>
            <button id="create"></button>
            <button id="sets"></button>
            <button id="dark-mode-toggle"></button>
          </body>
        </html>
      `);
      global.window = dom.window;
      global.document = dom.window.document;
    }

    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset global state - do this BEFORE requiring script.js
    global.page = 'home';
    global.quizState = null;
    
    // Initialize the main container
    document.getElementById('main').innerHTML = '';
    
    // Require script.js AFTER mocks are set up
    script = require('../script.js');
  });

  it('should keep track of the users page so it is not reset on reload', () => {
    expect(script.page).toBe('home');
  });
});