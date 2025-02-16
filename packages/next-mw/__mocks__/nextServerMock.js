// Simple Headers implementation for tests
class Headers {
  constructor(init = {}) {
    this.map = {};

    for (const key in init) {
      this.map[key.toLowerCase()] = init[key];
    }
  }

  get(key) {
    return this.map[key.toLowerCase()] || null;
  }

  set(key, value) {
    this.map[key.toLowerCase()] = value;
  }
}

// Minimal NextResponse mock with Headers instance
const NextResponse = {
  next: () => ({ status: 200, headers: new Headers({}) }),
  redirect: (url) => ({ status: 307, headers: new Headers({ location: url }) }),
};

// Minimal NextRequest mock for tests
class NextRequest {
  constructor(url) {
    this.url = url;
    this.nextUrl = new URL(url);
    this.headers = {
      _headers: {},
      get(name) {
        return this._headers[name.toLowerCase()] || null;
      },
      set(name, value) {
        this._headers[name.toLowerCase()] = value;
      },
    };
    this.cookies = {
      get: () => null,
    };
  }
}

module.exports = { NextResponse, NextRequest };
