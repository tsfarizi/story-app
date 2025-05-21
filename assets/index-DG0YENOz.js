(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))e(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&e(a)}).observe(document,{childList:!0,subtree:!0});function o(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function e(t){if(t.ep)return;t.ep=!0;const i=o(t);fetch(t.href,i)}})();class y{constructor(n){this.baseUrl=n}async login(n,o){const e=await fetch(`${this.baseUrl}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:o})});if(!e.ok)throw new Error("LOGIN_FAILED");return(await e.json()).loginResult}async getStories(n){const o=await fetch(`${this.baseUrl}/stories?location=1`,{headers:{Authorization:`Bearer ${n}`}});if(!o.ok)throw new Error("FETCH_STORIES_FAILED");return(await o.json()).listStory}async addStory(n,o){const e=await fetch(`${this.baseUrl}/stories`,{method:"POST",headers:{Authorization:`Bearer ${o}`},body:n});if(!e.ok)throw new Error("ADD_STORY_FAILED");return await e.json()}}class b{async login(n,o){const e=await fetch("https://story-api.dicoding.dev/v1/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:o})}),t=await e.json();if(!e.ok||t.error)throw new Error("Login gagal");return t.loginResult}async register(n,o,e){const t=await fetch("https://story-api.dicoding.dev/v1/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:n,email:o,password:e})}),i=await t.json();if(!t.ok||i.error)throw new Error("Register gagal");return i.message}}class v{constructor(){this.container=document.getElementById("main")}render(){this.container.innerHTML=`
      <h1>Daftar Story</h1>
      <div id="map" style="height:300px;"></div>
      <ul id="story-list"></ul>
      <button id="view-saved-btn" style="margin-top:1rem;">Lihat Story Tersimpan</button>
      <button id="notif-btn" style="margin-top:1rem;">Aktifkan Notifikasi</button>
    `}afterRender(n){window.currentStream&&(window.currentStream.getTracks().forEach(e=>e.stop()),window.currentStream=null),n.loadStories(),this.container.querySelector("#view-saved-btn").onclick=()=>{location.hash="#/saved"};const o=this.container.querySelector("#notif-btn");o.onclick=async()=>{if(!("Notification"in window)){alert("Browser tidak mendukung notifikasi.");return}await Notification.requestPermission()==="granted"?(typeof subscribePush=="function"&&subscribePush(),o.innerText="Notifikasi Aktif!",o.disabled=!0,alert("Notifikasi diaktifkan!")):alert("Izin notifikasi ditolak.")}}showLoading(){this.container.querySelector("#story-list").innerHTML="<li>Loading...</li>"}renderStories(n){const o=this.container.querySelector("#story-list");o.innerHTML="";const e=L.map("map").setView([0,0],2);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{}).addTo(e),navigator.geolocation&&navigator.geolocation.getCurrentPosition(t=>{const{latitude:i,longitude:a}=t.coords;e.setView([i,a],13),L.marker([i,a]).addTo(e).bindPopup("Lokasi Anda").openPopup()}),n.forEach(t=>{const i=document.createElement("li");i.innerHTML=`
        <img src="${t.photoUrl}" alt="Foto story dari ${t.name}" width="100" />
        <h2>${t.name}</h2>
        <p>${t.description}</p>
        <small>${new Date(t.createdAt).toLocaleString()}</small>
        <button class="save-story-btn">Simpan</button>
      `,o.appendChild(i),i.querySelector(".save-story-btn").onclick=()=>{window.saveStoryToIndexedDB(t),i.querySelector(".save-story-btn").innerText="Tersimpan!",i.querySelector(".save-story-btn").disabled=!0},t.lat&&t.lon&&L.marker([t.lat,t.lon]).addTo(e).bindPopup(`<strong>${t.name}</strong><p>${t.description}</p>`)})}renderError(){this.container.innerHTML="<p>Gagal memuat story.</p>"}}class S{constructor(){this.container=document.getElementById("main")}render(){this.container.innerHTML=`
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
    `}async afterRender(n){const o=document.getElementById("video"),e=document.getElementById("canvas"),t=e.getContext("2d"),i=document.getElementById("lat"),a=document.getElementById("lon");let d;try{d=await navigator.mediaDevices.getUserMedia({video:!0}),o.srcObject=d,window.currentStream=d}catch(s){console.error(s);const c=document.createElement("p");c.textContent="Tidak dapat mengakses kamera.",this.container.appendChild(c)}window.addEventListener("hashchange",()=>{!location.hash.startsWith("#/add")&&d&&(d.getTracks().forEach(s=>s.stop()),window.currentStream=null)});const l=document.getElementById("map-add");if(!l){console.error("Map container #map-add tidak ditemukan");return}const u=L.map(l).setView([0,0],2);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{}).addTo(u),navigator.geolocation&&navigator.geolocation.getCurrentPosition(s=>{const{latitude:c,longitude:m}=s.coords;u.setView([c,m],13),i.value=c,a.value=m,L.marker([c,m]).addTo(u).bindPopup("Lokasi Anda").openPopup()},s=>{console.warn("Geolokasi gagal:",s.message)}),u.on("click",s=>{i.value=s.latlng.lat,a.value=s.latlng.lng}),document.getElementById("add-form").addEventListener("submit",s=>{s.preventDefault(),e.width=o.videoWidth,e.height=o.videoHeight,t.drawImage(o,0,0,e.width,e.height),n.submitStory(e,document.getElementById("desc").value,i.value,a.value)})}showError(n){const o=this.container.querySelector(".error-msg");o&&o.remove();const e=document.createElement("p");e.className="error-msg",e.style.color="#ff6b6b",e.style.marginTop="1rem",e.textContent=n,this.container.appendChild(e)}}class k{constructor(){this.container=document.getElementById("main")}render(){this.container.innerHTML=`
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
    `}afterRender(n){document.getElementById("login-form").addEventListener("submit",async o=>{o.preventDefault();const e=document.getElementById("email").value,t=document.getElementById("password").value;await n.login(e,t)})}showMessage(n){document.getElementById("login-msg").innerText=n}}class E{constructor(){this.container=document.getElementById("main")}render(){this.container.innerHTML=`
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
    `}afterRender(n){document.getElementById("register-form").addEventListener("submit",async o=>{o.preventDefault();const e=document.getElementById("name").value,t=document.getElementById("email").value,i=document.getElementById("password").value;await n.register(e,t,i)})}showMessage(n){document.getElementById("register-msg").innerText=n}}class T{constructor(){this.container=document.getElementById("main")}render(){this.container.innerHTML=`
      <h1>Story Tersimpan</h1>
      <ul id="saved-story-list"></ul>
      <button id="back-btn" style="margin-top:1rem;">Kembali</button>
    `}async afterRender(){const n=this.container.querySelector("#saved-story-list");n.innerHTML="<li>Memuat...</li>";const o=await window.getAllSavedStoriesFromIndexedDB();n.innerHTML="",o.length||(n.innerHTML="<li>Tidak ada story tersimpan.</li>"),o.forEach(e=>{const t=document.createElement("li");t.innerHTML=`
        <img src="${e.photoUrl}" alt="Foto story dari ${e.name}" width="100" />
        <h2>${e.name}</h2>
        <p>${e.description}</p>
        <small>${new Date(e.createdAt).toLocaleString()}</small>
        <button class="delete-story-btn">Hapus</button>
      `,n.appendChild(t),t.querySelector(".delete-story-btn").onclick=async()=>{await window.deleteSavedStoryFromIndexedDB(e.id),t.remove()}}),this.container.querySelector("#back-btn").onclick=()=>{location.hash="#/stories"}}}class I{constructor(){this.container=document.getElementById("main")}render(){this.container.innerHTML=`
      <div class="not-found">
        <h1>404</h1>
        <p>Halaman tidak ditemukan.</p>
        <a href="#/stories">Kembali ke Beranda</a>
      </div>
    `}afterRender(){}}window.openStoriesDB=function(){return new Promise((r,n)=>{const o=indexedDB.open("stories-db",1);o.onupgradeneeded=function(e){const t=e.target.result;t.objectStoreNames.contains("stories")||t.createObjectStore("stories",{keyPath:"id"})},o.onsuccess=function(e){r(e.target.result)},o.onerror=function(e){n(e.target.error)}})};window.saveStoryToIndexedDB=async function(r){const n=await window.openStoriesDB();return new Promise((o,e)=>{const t=n.transaction("stories","readwrite");t.objectStore("stories").put(r),t.oncomplete=o,t.onerror=e})};window.getAllSavedStoriesFromIndexedDB=async function(){const r=await window.openStoriesDB();return new Promise((n,o)=>{const i=r.transaction("stories","readonly").objectStore("stories").getAll();i.onsuccess=()=>n(i.result),i.onerror=o})};window.deleteSavedStoryFromIndexedDB=async function(r){const n=await window.openStoriesDB();return new Promise((o,e)=>{const t=n.transaction("stories","readwrite");t.objectStore("stories").delete(r),t.oncomplete=o,t.onerror=e})};class P{constructor(n,o){this.model=n,this.view=o}async loadStories(){try{this.view.showLoading();const n=localStorage.getItem("token");if(!n)throw new Error("NOT_AUTHENTICATED");const o=await this.model.getStories(n);this.view.renderStories(o)}catch{this.view.renderError("Gagal memuat daftar story.")}}}class B{constructor(n,o){this.model=n,this.view=o}async submitStory(n,o,e,t){try{const i=localStorage.getItem("token");if(!i)throw new Error("Token tidak ditemukan");const a=await new Promise(l=>n.toBlob(l,"image/jpeg")),d=new FormData;d.append("description",o),d.append("photo",a,"capture.jpg"),e&&t&&(d.append("lat",e),d.append("lon",t)),await this.model.addStory(d,i),location.hash="#/stories"}catch(i){this.view.showError(i.message||"Gagal menambahkan story.")}}}class M{constructor(n,o){this.model=n,this.view=o}async login(n,o){try{const e=await this.model.login(n,o);localStorage.setItem("token",e.token),this.view.showMessage(`Selamat datang, ${e.name}`),"serviceWorker"in navigator&&(navigator.serviceWorker.register("/sw.js"),typeof subscribePush=="function"&&subscribePush()),location.hash="#/stories"}catch{this.view.showMessage("Login gagal. Cek email dan password.")}}}class A{constructor(n,o){this.model=n,this.view=o}async register(n,o,e){try{await this.model.register(n,o,e),this.view.showMessage("Registrasi berhasil. Silakan login."),location.hash="#/login"}catch{this.view.showMessage("Registrasi gagal. Coba lagi.")}}}const g=new y("https://story-api.dicoding.dev/v1"),h=new b;function w(){const r=document.getElementById("nav-links"),n=localStorage.getItem("token"),o=location.hash||"#/stories";if(r.innerHTML="",n){if(o.startsWith("#/add")){const t=document.createElement("li");t.innerHTML='<a href="#/stories">Stories</a>',r.appendChild(t)}else{const t=document.createElement("li");t.innerHTML='<a href="#/add">Tambah</a>',r.appendChild(t)}const e=document.createElement("li");e.innerHTML='<a href="#" id="logout-link">Logout</a>',r.appendChild(e),document.getElementById("logout-link").addEventListener("click",()=>{localStorage.removeItem("token"),w(),location.hash="#/login"})}else{const e=document.createElement("li");e.innerHTML='<a href="#/login">Login</a>';const t=document.createElement("li");t.innerHTML='<a href="#/register">Register</a>',r.appendChild(e),r.appendChild(t)}}function f(){var o;const r=location.hash||"#/stories",n=localStorage.getItem("token");w(),(o=document.startViewTransition)==null||o.call(document,()=>{if(n&&(r==="#/login"||r==="#/register")){location.hash="#/stories";return}if(!n&&(r==="#/stories"||r.startsWith("#/add")||r==="#/saved")){location.hash="#/login";return}if(r.startsWith("#/add")){const e=new S;e.render(),e.afterRender(new B(g,e))}else if(r==="#/login"){const e=new k;e.render(),e.afterRender(new M(h,e))}else if(r==="#/register"){const e=new E;e.render(),e.afterRender(new A(h,e))}else if(r==="#/stories"||r==="#/"||r===""){const e=new v;e.render(),e.afterRender(new P(g,e))}else if(r==="#/saved"){const e=new T;e.render(),e.afterRender()}else{const e=new I;e.render(),e.afterRender()}})}const C="BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";async function x(){if(!("serviceWorker"in navigator)||!("PushManager"in window))return;const n=await(await navigator.serviceWorker.ready).pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:D(C)}),o=localStorage.getItem("token");await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe",{method:"POST",headers:{Authorization:`Bearer ${o}`,"Content-Type":"application/json"},body:JSON.stringify({endpoint:n.endpoint,keys:{p256dh:p(n.getKey("p256dh")),auth:p(n.getKey("auth"))}})})}function D(r){const n="=".repeat((4-r.length%4)%4),o=(r+n).replace(/\-/g,"+").replace(/_/g,"/"),e=window.atob(o);return Uint8Array.from([...e].map(t=>t.charCodeAt(0)))}function p(r){return btoa(String.fromCharCode.apply(null,new Uint8Array(r)))}window.addEventListener("hashchange",f);window.addEventListener("load",f);window.subscribePush=x;
