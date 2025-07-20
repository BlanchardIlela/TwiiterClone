/**
 * Récupération des API et affectation dans des constantes
 * 1. API_BASE = renvoie l'adresse url des API
 * 2. USRS_URL = renvoie les utilisateurs
 * 3. TWEETS_URL = renvoie les tweets des utilisateurs
 */
const API_BASE = "http://localhost:3000";
const USERS_URL = `${API_BASE}/users`;
const TWEETS_URL = `${API_BASE}/tweets`;

/**
 * La fonction toggleModal permettant d'afficher et masquer la modale login où 
 * création de compte et cette fonction reçoit deux paramètres 
 * @param {string} id 
 * @param {string} show 
 * @returns {boolean}
 */
function toggleModal(id, show = true) {
  document.getElementById(id).classList.toggle("flex", show);
  document.getElementById(id).classList.toggle("hidden", !show);
}

/**
 * La fonction switchModals basculer de la modale login à 
 * la création compte depuis le bouton inscrivez-vous
 * @returns {boolean}
 */
function switchModals() {
  toggleModal('loginModal', false);
  toggleModal('signupModal', true);
}

/**
 * Fonction login permet de s'authentifier
 * currentUser l'utilisateur connecté
 * @returns {user}
 */
async function login() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Veuillez renseigner vos informations");
    return;
  }

  try {
    const response = await fetch(`${USERS_URL}?email=${(email)}&password=${(password)}`);
    const users = await response.json();

    if (users.length === 1) {
      const user = users[0];

      //Connexion réussie
      console.log("Utilisateur connecté :", user);

      // Stocker l'utilisateur connecté
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Fermerture de la modale login
      toggleModal("loginModal", false);
      document.querySelector(".blanchard")?.classList.remove("hidden");

      // Appeler la fonction showApp pour afficher l'application
      showApp();
    } else {
      alert("Identifiants incorrects !");
    }
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    alert("Une erreur est survenue. Veuillez réessayer plus tard.");
  }
}

/**
 * La Fonction signup permettant d'inscrition un
 * utilisateur
 * @returns {user}
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  form.addEventListener("submit", signup);
});
async function signup(event) {
  event.preventDefault(); // Empêche le rechargement du formulaire

  const username = document.getElementById("signupUsername").value.trim();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const birthDate = document.getElementById("signupNais").value.trim();
  const phone = document.getElementById("signupNametelUser").value.trim();

  if (!username || !name || !email || !password || !birthDate || !phone) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  try {
    const res = await fetch(`${USERS_URL}?email=${encodeURIComponent(email)}`);
    const existing = await res.json();

    if (existing.length > 0) {
      alert("Cet utilisateur existe déjà !");
      return;
    }

    const user = {
      id: crypto.randomUUID(),
      username,
      name,
      email,
      password,
      birthDate,
      phone
    };

    await fetch(USERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    alert("Inscription réussie ! Connecte-toi maintenant.");

    toggleModal("signupModal", false);
    toggleModal("loginModal", true);

  } catch (err) {
    console.error("Erreur lors de l'inscription :", err);
    alert("Une erreur s'est produite.");
  }
}

/**
 * La mise à jour de User
 */
document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editProfileBtn");
  const form = document.getElementById("editProfileForm");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  editBtn.addEventListener("click", () => {
    form.classList.remove("hidden");
    form.username.value = currentUser.username;
    form.name.value = currentUser.name;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newUser = {
      username: form.username.value.trim(),
      name: form.name.value.trim(),
    };

    const res = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    const data = await res.json();
    localStorage.setItem("currentUser", JSON.stringify(data));
    form.classList.add("hidden");
  });
});

/**
 * Cette fonction showApp permet d'afficher les éléments de l'application
 * une fois l'utilisateur connecté
 * La foncion loadProfileTweets() charge et affiche les tweets de User dans son profil
 * La fonction loadMyTweets() charge les tweets de User depuis son profil
 * @returns {HTMLElement} 
 */
function showApp() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  document.getElementById("principale").style.display = "none";
  document.getElementById("navigation").classList.remove("hidden");
  document.getElementById("profile").classList.remove('hidden');

  document.getElementById("sidebarUserName").textContent = user.name;
  document.getElementById("sidebarUserHandle").textContent = user.username;

  document.getElementById("abonnements").textContent = user.followers;
  document.getElementById("abonnés").textContent = user.following;
  document.getElementById("datecre").textContent = user.createdAt;

  document.getElementById("profileUserName").textContent = user.name;
  document.getElementById("profileUserHandle").textContent = user.username;

  loadProfileTweets(); 
  loadMyTweets(); 
}

/**
 * La fonction permet d'ajouter un tweet et fait
 * appel à loadMyTweets pour son affichage
 * @returns {HTMLElement}
 */
async function addTweet() {
  const content = document.getElementById("tweetInput").value.trim();
  if (!content) return;

  const user = JSON.parse(localStorage.getItem("currentUser"));
  const tweet = {
    id: crypto.randomUUID(),
    userId: user.id,
    content,
    createdAt: new Date().toISOString()
  };

  await fetch(TWEETS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tweet)
  });

  document.getElementById("tweetInput").value = "";
  loadMyTweets();
}

/**
 * La fonction loadProfileTweets charge les tweets puis 
 * les affiches dans  le profil de l'utilisateur
 * @returns {HTMLCollection}
 */
async function loadProfileTweets() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const res = await fetch(`${TWEETS_URL}?userId=${user.id}&_sort=createdAt&_order=desc`);
  const tweets = await res.json();

  const container = document.getElementById("profile-tweets");
  container.innerHTML = "";

  if (tweets.length === 0) {
    container.innerHTML = "<p class='text-gray-400'>Aucun tweet à afficher.</p>";
    return;
  }

  tweets.forEach(tweet => {
    const div = document.createElement("div");
    div.className = "bg-[#16181C] p-0 rounded-lg";
    div.textContent = tweet.content;
    container.appendChild(div);
  });
}

/**
 * Nagivate permet de changer la navaigation de ma section dans le main 
 * une fois cliquer sur poster je n'ai plus la partie profil
 * @param {string} id 
 */
function navigate(id) {
  document.querySelectorAll("main > section").forEach(section => {
    section.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

/**
 * La fonction loadMyTweets permet de charger et affiché les tweets 
 * après juster cliquer sur le bouton poster
 */
async function loadMyTweets() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const res = await fetch(`${TWEETS_URL}?userId=${user.id}&_sort=createdAt&_order=desc`);
  const tweets = await res.json();

  console.log("Tweets récupérés pour userId =", user.id, "=>", tweets);

  //const container = document.getElementById("myTweets");
  const container = document.getElementById("myTweets");

  container.innerHTML = "";

  tweets.forEach(tweet => {
    const div = document.createElement("div");
    div.className = "bg-[#16181C] p-0 rounded-lg mb-2";

    div.innerHTML = `
      <div id="tweet-${tweet.id}" class="flex justify-between items-center">
        <span class="tweet-content">${tweet.content}</span>
        <div class="space-x-2">
          <button onclick="deleteTweet('${tweet.id}')" class="text-red-500 hover:underline">Supprimer</button>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

/**
 * La fonction logout déconnect un user connecté
 */
async function logout() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (user) {
    await fetch(`${USERS_URL}/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ isLoggedIn: false })
    });
  }

  localStorage.removeItem("currentUser");
  window.location.reload();
}

/**
 * Une fonction qui permet de supprimer un tweet
 * @param {user} id 
 * @returns {boolean}
 */
async function deleteTweet(id) {
  await fetch(`${TWEETS_URL}/${id}`, { method: "DELETE" });
  loadMyTweets();
}

/**
 * Permet de garder la session de User jusqu'à ce 
 * déconnecté
 */
function initApp() {
  const user = localStorage.getItem("currentUser");

  if (user !== null) {
    const appContainer = document.querySelector('.blanchard');
    if (appContainer) {
      appContainer.classList.remove('hidden');
    }

    showApp();
  }
}

document.addEventListener("DOMContentLoaded", initApp);

