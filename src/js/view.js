export class StoriesPageView {
    constructor() {
    this.container = document.getElementById('main');
  }

  render() {
    this.container.innerHTML = `
      <h1>Daftar Story</h1>
      <div id="map" style="height:300px;"></div>
      <ul id="story-list"></ul>
      <button id="view-saved-btn" style="margin-top:1rem;">Lihat Story Tersimpan</button>
      <button id="notif-btn" style="margin-top:1rem;">Aktifkan Notifikasi</button>
    `;
  }

  afterRender(presenter) {
    if (window.currentStream) {
      window.currentStream.getTracks().forEach(track => track.stop());
      window.currentStream = null;
    }

    presenter.loadStories();

    this.container.querySelector('#view-saved-btn').onclick = () => {
      location.hash = '#/saved';
    };

    const notifBtn = this.container.querySelector('#notif-btn');
    notifBtn.onclick = async () => {
      if (!('Notification' in window)) {
        alert('Browser tidak mendukung notifikasi.');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        if (typeof subscribePush === 'function') {
          subscribePush();
        }
        notifBtn.innerText = 'Notifikasi Aktif!';
        notifBtn.disabled = true;
        alert('Notifikasi diaktifkan!');
      } else {
        alert('Izin notifikasi ditolak.');
      }
    };
  }
  showLoading() {
    this.container.querySelector('#story-list').innerHTML = '<li>Loading...</li>';
  }

  renderStories(stories) {
    const list = this.container.querySelector('#story-list');
    list.innerHTML = '';

    const map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 13);
        L.marker([latitude, longitude]).addTo(map).bindPopup('Lokasi Anda').openPopup();
      });
    }

    stories.forEach(story => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto story dari ${story.name}" width="100" />
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <small>${new Date(story.createdAt).toLocaleString()}</small>
        <button class="save-story-btn">Simpan</button>
      `;
      list.appendChild(li);

      // Simpan ke indexDB saat tombol diklik
      li.querySelector('.save-story-btn').onclick = () => {
        window.saveStoryToIndexedDB(story);
        li.querySelector('.save-story-btn').innerText = 'Tersimpan!';
        li.querySelector('.save-story-btn').disabled = true;
      };

      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(`<strong>${story.name}</strong><p>${story.description}</p>`);
      }
    });
  }

  renderError() {
    this.container.innerHTML = '<p>Gagal memuat story.</p>';
  }
}

export class AddStoryPageView {
  constructor() {
    this.container = document.getElementById('main');
  }

  render() {
    this.container.innerHTML = `
      <h1>Tambah Story</h1>
      <form id="add-form">
        <label for="desc">Deskripsi:</label>
        <textarea id="desc" required></textarea>

        <label for="photo">Kamera Aktif:</label>
        <video id="video" autoplay playsinline width="200"></video>
        <canvas id="canvas" hidden></canvas>

        <label for="map-add">Klik peta untuk pilih lokasi:</label>
        <div id="map-add" style="height:200px;"></div>
        <input type="hidden" id="lat" name="lat">
        <input type="hidden" id="lon" name="lon">

        <button type="submit">Kirim</button>
      </form>
    `;
  }

  async afterRender(presenter) {

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const latInput = document.getElementById('lat');
    const lonInput = document.getElementById('lon');
    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      window.currentStream = stream;
    } catch (error) {
      console.error(error);
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Tidak dapat mengakses kamera.';
      this.container.appendChild(errorMsg);
    }

    window.addEventListener('hashchange', () => {
      if (!location.hash.startsWith('#/add') && stream) {
        stream.getTracks().forEach(t => t.stop());
        window.currentStream = null;
      }
    });

    const mapContainer = document.getElementById('map-add');
    if (!mapContainer) {
      console.error('Map container #map-add tidak ditemukan');
      return;
    }

    const map = L.map(mapContainer).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 13);
        latInput.value = latitude;
        lonInput.value = longitude;
        L.marker([latitude, longitude]).addTo(map).bindPopup('Lokasi Anda').openPopup();
      }, err => {
        console.warn('Geolokasi gagal:', err.message);
      });
    }

    map.on('click', e => {
      latInput.value = e.latlng.lat;
      lonInput.value = e.latlng.lng;
    });

    document.getElementById('add-form').addEventListener('submit', e => {
      e.preventDefault();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      presenter.submitStory(
        canvas,
        document.getElementById('desc').value,
        latInput.value,
        lonInput.value
      );
    });
  }

  showError(message) {
    const existing = this.container.querySelector('.error-msg');
    if (existing) existing.remove();

    const msg = document.createElement('p');
    msg.className = 'error-msg';
    msg.style.color = '#ff6b6b';
    msg.style.marginTop = '1rem';
    msg.textContent = message;
    this.container.appendChild(msg);
  }
}


export class LoginPageView {
  constructor() {
    this.container = document.getElementById('main');
  }

  render() {
    this.container.innerHTML = `
    <div class="auth-form-wrapper">
      <h1>Login</h1>
      <form id="login-form">
        <label for="email">Email:</label>
        <input type="email" id="email" required>

        <label for="password">Password:</label>
        <input type="password" id="password" required>

        <button type="submit">Login</button>
      </form>
      <p id="login-msg"></p>
    </div>
    `;
  }

  afterRender(presenter) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await presenter.login(email, password);
    });
  }

  showMessage(msg) {
    document.getElementById('login-msg').innerText = msg;
  }
}

export class RegisterPageView {
  constructor() {
    this.container = document.getElementById('main');
  }

  render() {
    this.container.innerHTML = `
    <div class="auth-form-wrapper">
      <h1>Register</h1>
      <form id="register-form">
        <label for="name">Nama:</label>
        <input type="text" id="name" required>

        <label for="email">Email:</label>
        <input type="email" id="email" required>

        <label for="password">Password:</label>
        <input type="password" id="password" required>

        <button type="submit">Daftar</button>
      </form>
      <p id="register-msg"></p>
    </div>
    `;
  }

  afterRender(presenter) {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await presenter.register(name, email, password);
    });
  }

  showMessage(msg) {
    document.getElementById('register-msg').innerText = msg;
  }
}

export class SavedStoriesPageView {
  constructor() {
    this.container = document.getElementById('main');
  }

  render() {
    this.container.innerHTML = `
      <h1>Story Tersimpan</h1>
      <ul id="saved-story-list"></ul>
      <button id="back-btn" style="margin-top:1rem;">Kembali</button>
    `;
  }

  async afterRender() {
    const list = this.container.querySelector('#saved-story-list');
    list.innerHTML = '<li>Memuat...</li>';
    const stories = await window.getAllSavedStoriesFromIndexedDB();
    list.innerHTML = '';
    if (!stories.length) {
      list.innerHTML = '<li>Tidak ada story tersimpan.</li>';
    }
    stories.forEach(story => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto story dari ${story.name}" width="100" />
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <small>${new Date(story.createdAt).toLocaleString()}</small>
        <button class="delete-story-btn">Hapus</button>
      `;
      list.appendChild(li);

      li.querySelector('.delete-story-btn').onclick = async () => {
        await window.deleteSavedStoryFromIndexedDB(story.id);
        li.remove();
      };
    });

    this.container.querySelector('#back-btn').onclick = () => {
      location.hash = '#/stories';
    };
  }
}

export class NotFoundPageView {
  constructor() {
    this.container = document.getElementById('main');
  }

  render() {
    this.container.innerHTML = `
      <div class="not-found">
        <h1>404</h1>
        <p>Halaman tidak ditemukan.</p>
        <a href="#/stories">Kembali ke Beranda</a>
      </div>
    `;
  }

  afterRender() {
  }
}

window.openStoriesDB = function () {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('stories-db', 1);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('stories')) {
        db.createObjectStore('stories', { keyPath: 'id' });
      }
    };
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
    request.onerror = function (event) {
      reject(event.target.error);
    };
  });
};

window.saveStoryToIndexedDB = async function (story) {
  const db = await window.openStoriesDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stories', 'readwrite');
    tx.objectStore('stories').put(story);
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
};

window.getAllSavedStoriesFromIndexedDB = async function () {
  const db = await window.openStoriesDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stories', 'readonly');
    const store = tx.objectStore('stories');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
};

window.deleteSavedStoryFromIndexedDB = async function (id) {
  const db = await window.openStoriesDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('stories', 'readwrite');
    tx.objectStore('stories').delete(id);
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
};