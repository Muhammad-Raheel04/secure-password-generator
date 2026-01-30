// DOM Elements
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const passwordDisplay = document.getElementById("passwordDisplay");
const lengthInput = document.getElementById("length");
const passwordList = document.getElementById("passwordList");
const copyBtn = document.getElementById("copyBtn");
const shareBtn = document.getElementById("shareBtn");
const strengthFill = document.getElementById("strengthFill");
const toast = document.getElementById("toast");
const chatPopup = document.getElementById("chatPopup");
const chatToggle = document.getElementById("chatToggle");
const closeChat = document.getElementById("closeChat");
const chatbotInfoBtn = document.getElementById("chatbotInfoBtn");
const body = document.body;

// Character sets
const charSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+[]{}|;:,.<>?"
};

// Show toast notification
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? "#da3633" : "#238636";
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Calculate password strength
function calculateStrength(password) {
  let strength = 0;

  // Length factor
  strength += Math.min(password.length / 32, 1) * 40;

  // Character variety factor
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  const varietyCount = [hasUpper, hasLower, hasNumbers, hasSymbols].filter(Boolean).length;
  strength += (varietyCount / 4) * 60;

  return Math.min(strength, 100);
}

// Update strength meter
function updateStrengthMeter(password) {
  const strength = calculateStrength(password);
  strengthFill.style.width = `${strength}%`;

  if (strength < 40) {
    strengthFill.style.background = "#da3633"; // Red
  } else if (strength < 70) {
    strengthFill.style.background = "#d29922"; // Yellow
  } else {
    strengthFill.style.background = "#3fb950"; // Green
  }
}

// Generate Password
function generatePassword(length) {
  // Get selected character sets
  const selectedSets = [];
  if (document.getElementById("uppercase").checked) selectedSets.push(charSets.uppercase);
  if (document.getElementById("lowercase").checked) selectedSets.push(charSets.lowercase);
  if (document.getElementById("numbers").checked) selectedSets.push(charSets.numbers);
  if (document.getElementById("symbols").checked) selectedSets.push(charSets.symbols);

  // If no character sets selected, use all
  if (selectedSets.length === 0) {
    selectedSets.push(
      charSets.uppercase,
      charSets.lowercase,
      charSets.numbers,
      charSets.symbols
    );
  }

  // Ensure at least one character from each selected set
  let password = "";
  selectedSets.forEach(set => {
    password += set.charAt(Math.floor(Math.random() * set.length));
  });

  // Fill the rest of the password
  const allChars = selectedSets.join("");
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Load saved passwords
function loadSavedPasswords() {
  const saved = JSON.parse(localStorage.getItem("passwords") || "[]");
  passwordList.innerHTML = "";

  if (saved.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No passwords saved yet";
    li.style.color = "var(--text-secondary)";
    li.style.fontStyle = "italic";
    passwordList.appendChild(li);
    return;
  }

  // Show only the last 5 passwords
  const recentPasswords = saved.slice(-5).reverse();

  recentPasswords.forEach((pwd) => {
    const li = document.createElement("li");

    const passwordSpan = document.createElement("span");
    passwordSpan.className = "password-item";
    passwordSpan.textContent = pwd;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "password-actions";

    const copyBtn = document.createElement("button");
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = "Copy password";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(pwd);
      showToast("Password copied to clipboard!");
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = "Delete password";
    deleteBtn.addEventListener("click", () => {
      deletePassword(pwd);
    });

    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(passwordSpan);
    li.appendChild(actionsDiv);
    passwordList.appendChild(li);
  });
}

// Save password
function savePassword(password) {
  const saved = JSON.parse(localStorage.getItem("passwords") || "[]");

  // Don't save duplicate passwords
  if (!saved.includes(password)) {
    saved.push(password);
    localStorage.setItem("passwords", JSON.stringify(saved));
  }

  loadSavedPasswords();
}

// Delete password
function deletePassword(password) {
  const saved = JSON.parse(localStorage.getItem("passwords") || "[]");
  const updated = saved.filter(p => p !== password);
  localStorage.setItem("passwords", JSON.stringify(updated));
  loadSavedPasswords();
  showToast("Password deleted");
}

// Share functionality
async function sharePassword() {
  const pwd = passwordDisplay.textContent;
  if (!pwd || pwd === "Your password will appear here") {
    showToast("No password to share!", true);
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Generated Password',
        text: `Check out this secure password I generated: ${pwd}`,
      });
      showToast("Password shared successfully!");
    } catch (err) {
      if (err.name !== 'AbortError') {
        showToast("Failed to share password", true);
      }
    }
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(pwd);
    showToast("Password copied to clipboard (sharing not supported)");
  }
}

// Chat functionality
function openChat() {
  body.classList.remove("show-password");
  body.classList.add("show-chat");
}

function closeChatPopup() {
  body.classList.remove("show-chat");
  body.classList.add("show-password");
}

chatToggle.addEventListener("click", openChat);
chatbotInfoBtn.addEventListener("click", openChat);
closeChat.addEventListener("click", closeChatPopup);

// Event Listeners
generateBtn.addEventListener("click", () => {
  const length = parseInt(lengthInput.value) || 12;

  if (length < 4 || length > 32) {
    showToast("Password length must be between 4 and 32", true);
    return;
  }

  const password = generatePassword(length);
  passwordDisplay.textContent = password;
  updateStrengthMeter(password);
  savePassword(password);
});

resetBtn.addEventListener("click", () => {
  passwordDisplay.textContent = "Your password will appear here";
  lengthInput.value = "12";
  strengthFill.style.width = "0%";

  // Reset checkboxes
  document.getElementById("uppercase").checked = true;
  document.getElementById("lowercase").checked = true;
  document.getElementById("numbers").checked = true;
  document.getElementById("symbols").checked = true;
});

copyBtn.addEventListener("click", () => {
  const pwd = passwordDisplay.textContent;
  if (!pwd || pwd === "Your password will appear here") {
    showToast("No password to copy!", true);
    return;
  }

  navigator.clipboard.writeText(pwd);
  showToast("Password copied to clipboard!");
});

shareBtn.addEventListener("click", sharePassword);

// Initialize
loadSavedPasswords();