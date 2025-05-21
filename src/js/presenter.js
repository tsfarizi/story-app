export class StoriesPagePresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async loadStories() {
    try {
      this.view.showLoading();
      const token = localStorage.getItem('token');
      if (!token) throw new Error('NOT_AUTHENTICATED');

      const stories = await this.model.getStories(token);
      this.view.renderStories(stories);
    } catch (e) {
      this.view.renderError('Gagal memuat daftar story.');
    }
  }
}

export class AddStoryPagePresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async submitStory(canvas, description, lat, lon) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan');

      const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg'));
      const fd = new FormData();
      fd.append('description', description);
      fd.append('photo', blob, 'capture.jpg');
      if (lat && lon) {
        fd.append('lat', lat);
        fd.append('lon', lon);
      }

      await this.model.addStory(fd, token);

      location.hash = '#/stories';
    } catch (err) {
      this.view.showError(err.message || 'Gagal menambahkan story.');
    }
  }
}

export class LoginPagePresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

async login(email, password) {
  try {
    const user = await this.model.login(email, password);
    localStorage.setItem('token', user.token);
    this.view.showMessage(`Selamat datang, ${user.name}`);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
      if (typeof subscribePush === 'function') {
        subscribePush();
      }
    }

    location.hash = '#/stories';
  } catch {
    this.view.showMessage('Login gagal. Cek email dan password.');
  }
}
}

export class RegisterPagePresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async register(name, email, password) {
    try {
      await this.model.register(name, email, password);
      this.view.showMessage('Registrasi berhasil. Silakan login.');
      location.hash = '#/login';
    } catch {
      this.view.showMessage('Registrasi gagal. Coba lagi.');
    }
  }
}
