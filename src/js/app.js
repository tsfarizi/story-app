import { StoryModel, AuthModel } from './model.js';
import {
  StoriesPageView,
  AddStoryPageView,
  LoginPageView,
  RegisterPageView,
  SavedStoriesPageView,
  NotFoundPageView,
} from './view.js';
import {
  StoriesPagePresenter,
  AddStoryPagePresenter,
  LoginPagePresenter,
  RegisterPagePresenter
} from './presenter.js';

const storyModel = new StoryModel('https://story-api.dicoding.dev/v1');
const authModel = new AuthModel();

function updateNav() {
  const nav = document.getElementById('nav-links');
  const token = localStorage.getItem('token');
  const hash = location.hash || '#/stories';

  nav.innerHTML = '';

  if (token) {
    if (hash.startsWith('#/add')) {
      const stories = document.createElement('li');
      stories.innerHTML = `<a href="#/stories">Stories</a>`;
      nav.appendChild(stories);
    } else {
      const add = document.createElement('li');
      add.innerHTML = `<a href="#/add">Tambah</a>`;
      nav.appendChild(add);
    }

    const logout = document.createElement('li');
    logout.innerHTML = `<a href="#" id="logout-link">Logout</a>`;
    nav.appendChild(logout);

    document.getElementById('logout-link').addEventListener('click', () => {
      localStorage.removeItem('token');
      updateNav();
      location.hash = '#/login';
    });
  } else {
    const login = document.createElement('li');
    login.innerHTML = `<a href="#/login">Login</a>`;
    const register = document.createElement('li');
    register.innerHTML = `<a href="#/register">Register</a>`;
    nav.appendChild(login);
    nav.appendChild(register);
  }
}


function router() {
  const hash = location.hash || '#/stories';
  const token = localStorage.getItem('token');

  updateNav();

  document.startViewTransition?.(() => {
    if (token && (hash === '#/login' || hash === '#/register')) {
      location.hash = '#/stories';
      return;
    }

    if (!token && (hash === '#/stories' || hash.startsWith('#/add') || hash === '#/saved')) {
      location.hash = '#/login';
      return;
    }

    if (hash.startsWith('#/add')) {
      const view = new AddStoryPageView();
      view.render();
      view.afterRender(new AddStoryPagePresenter(storyModel, view));
    } else if (hash === '#/login') {
      const view = new LoginPageView();
      view.render();
      view.afterRender(new LoginPagePresenter(authModel, view));
    } else if (hash === '#/register') {
      const view = new RegisterPageView();
      view.render();
      view.afterRender(new RegisterPagePresenter(authModel, view));
    } else if (hash === '#/stories' || hash === '#/' || hash === '') {
      const view = new StoriesPageView();
      view.render();
      view.afterRender(new StoriesPagePresenter(storyModel, view));
    } else if (hash === '#/saved') {
      const view = new SavedStoriesPageView();
      view.render();
      view.afterRender();
    } else {
      const view = new NotFoundPageView();
      view.render();
      view.afterRender();
    }
  });
}

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

async function subscribePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const token = localStorage.getItem('token');
  await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
        auth: arrayBufferToBase64(sub.getKey('auth')),
      }
    })
  });
}

async function unsubscribePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    const token = localStorage.getItem('token');
    await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint })
    });
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(char => char.charCodeAt(0)));
}
function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
window.subscribePush = subscribePush;