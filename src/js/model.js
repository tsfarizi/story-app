export class StoryModel {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async login(email, password) {
    const res = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('LOGIN_FAILED');
    const data = await res.json();
    return data.loginResult;
  }

  async getStories(token) {
    const res = await fetch(`${this.baseUrl}/stories?location=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('FETCH_STORIES_FAILED');
    const data = await res.json();
    return data.listStory;
  }

  async addStory(formData, token) {
    const res = await fetch(`${this.baseUrl}/stories`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('ADD_STORY_FAILED');
    return await res.json();
  }
}

export class AuthModel {
  async login(email, password) {
    const res = await fetch('https://story-api.dicoding.dev/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    if (!res.ok || json.error) throw new Error('Login gagal');
    return json.loginResult;
  }

  async register(name, email, password) {
    const res = await fetch('https://story-api.dicoding.dev/v1/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const json = await res.json();
    if (!res.ok || json.error) throw new Error('Register gagal');
    return json.message;
  }
}
