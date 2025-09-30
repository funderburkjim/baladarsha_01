let vocab = [];
let current = 0;
let flipped = false;
let history = [];

function openVocabModal() {
  document.getElementById("vocabModal").style.display = "flex";
}

function closeVocabModal() {
  document.getElementById("vocabModal").style.display = "none";
}

function showModal() {
  document.getElementById("modalOverlay").style.display = "flex";
  document.getElementById("flashcardPanel").style.display = "none";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
  document.getElementById("flashcardPanel").style.display = "block";
  showCard();
}

function parseTSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const entry = {};
    headers.forEach((key, index) => {
      entry[key] = values[index]?.trim() || "";
    });
    data.push({
      sanskrit: entry.sanskrit || "",
      english: entry.english || "",
      gender: entry.gender || ""
    });
  }

  return data;
}

function loadSelectedVocab() {
  const selector = document.getElementById("vocabSelector");
  const selectedURL = selector.value;
  if (!selectedURL) return;

  fetch(selectedURL)
    .then(res => res.text())
    .then(text => {
      vocab = selectedURL.endsWith('.tsv') ? parseTSV(text) : JSON.parse(text);
      finalizeVocabLoad();
    })
    .catch(err => {
      alert("Error loading hosted vocab.");
      console.error(err);
    });
}

function finalizeVocabLoad() {
  vocab = vocab.sort(() => Math.random() - 0.5);
  current = 0;
  flipped = false;
  history = [];
  updatePreview();
  closeVocabModal();
  showModal();
}

function showCard() {
  if (vocab.length === 0) return;
  const word = vocab[current];
  document.getElementById("cardText").textContent = flipped ? word.english : word.sanskrit;
  document.getElementById("genderText").textContent = flipped ? "" : `Info: ${word.gender}`;
}

function flipCard() {
  flipped = !flipped;
  showCard();
}

function nextCard() {
  history.push(current);
  current = (current + 1) % vocab.length;
  flipped = false;
  showCard();
}

function prevCard() {
  if (history.length === 0) return;
  current = history.pop();
  flipped = false;
  showCard();
}

function updatePreview() {
  const tbody = document.getElementById("previewBody");
  tbody.innerHTML = "";
  vocab.forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${entry.sanskrit}</td><td>${entry.english}</td><td>${entry.gender}</td>`;
    tbody.appendChild(row);
  });
}

function populateFileList() {
  fetch("vocablist.txt")
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split("\n");
      const selector = document.getElementById("vocabSelector");
      lines.forEach(path => {
        const option = document.createElement("option");
        option.value = path;
        option.textContent = path.split("/").pop();
        selector.appendChild(option);
      });
    })
    .catch(err => console.error("Failed to load vocablist.txt:", err));
}

populateFileList();

/*
// File upload logic (commented out)
document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = e.target.result;
      vocab = file.name.endsWith('.tsv') ? parseTSV(text) : JSON.parse(text);
      finalizeVocabLoad();
    } catch (err) {
      alert("Invalid file format.");
      console.error(err);
    }
  };
  reader.readAsText(file);
});
*/
