"use strict";

const $ = (s) => document.querySelector(s);
const reduzMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
const raiz = document.documentElement;

/* ---------- Luzes da árvore (acendem em sequência) ---------- */
(function luzes() {
  const grupo = $("#luzes");
  const cores = ["#ff4d6d", "#ffd700", "#5ec8ff", "#8dff9b"];
  const NS = "http://www.w3.org/2000/svg";

  for (let i = 0; i < 34; i++) {
    const y = 85 + ((i * 53) % 235);                       // distribui na altura
    const meia = (y - 28) * 0.43;                          // meia-largura do triângulo
    const x = 150 + (((i * 0.618) % 1) * 2 - 1) * meia * 0.82;

    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", x.toFixed(1));
    c.setAttribute("cy", y);
    c.setAttribute("r", 5);
    c.setAttribute("fill", cores[i % cores.length]);
    c.style.color = cores[i % cores.length];
    c.style.setProperty("--d", `${(i * 0.09).toFixed(2)}s`);
    c.classList.add("luz");
    grupo.appendChild(c);
  }
})();

/* ---------- Neve ---------- */
const canvas = $("#neve");
const ctx = canvas.getContext("2d");
let flocos = [], largura = 0, altura = 0, quadro;

function ajustarCanvas() {
  largura = innerWidth;
  altura = innerHeight;
  const escala = Math.min(devicePixelRatio || 1, 2);
  canvas.width = largura * escala;
  canvas.height = altura * escala;
  ctx.setTransform(escala, 0, 0, escala, 0, 0);

  flocos = Array.from({ length: Math.min(120, Math.floor(largura / 9)) }, () => ({
    x: Math.random() * largura,
    y: Math.random() * altura,
    r: Math.random() * 2.5 + 1,
    v: Math.random() * 1 + 0.4,
    o: Math.random() * Math.PI * 2
  }));
}

function desenharNeve() {
  ctx.clearRect(0, 0, largura, altura);
  const cor = getComputedStyle(raiz).getPropertyValue("--neve").trim();
  ctx.fillStyle = `rgba(${cor}, .8)`;

  for (const f of flocos) {
    f.y += f.v;
    f.o += 0.015;
    f.x += Math.sin(f.o) * 0.5;
    if (f.y > altura) { f.y = -5; f.x = Math.random() * largura; }
    if (f.x > largura) f.x = 0;
    if (f.x < 0) f.x = largura;

    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
  quadro = requestAnimationFrame(desenharNeve);
}

addEventListener("resize", ajustarCanvas);
ajustarCanvas();
if (!reduzMovimento) desenharNeve();

document.addEventListener("visibilitychange", () => {
  cancelAnimationFrame(quadro);
  if (!document.hidden && !reduzMovimento) desenharNeve();
});

/* ---------- Tema ---------- */
const btnTema = $("#btnTema");

function atualizarTema() {
  const claro = raiz.dataset.theme === "claro";
  btnTema.textContent = claro ? "🌙 Tema escuro" : "☀️ Tema claro";
  $('meta[name="theme-color"]').content = claro ? "#fbf3e3" : "#0a1226";
}

btnTema.addEventListener("click", () => {
  raiz.dataset.theme = raiz.dataset.theme === "claro" ? "" : "claro";
  atualizarTema();
});

/* ---------- Mensagens ---------- */
const mensagens = [
  "O Natal começa no coração: quando damos amor, ele já está acontecendo. 💖",
  "Que a luz desta noite ilumine todos os seus caminhos no ano que vem. ✨",
  "Natal é tempo de abraçar, perdoar e recomeçar com o coração leve. 🤗",
  "A maior mágica do Natal é transformar pequenos gestos em grandes alegrias. 🎁",
  "Que sobre paz na sua casa, risadas na sua mesa e esperança no seu coração. 🕊️",
  "Gratidão pelo que passou, alegria pelo que está aqui e fé no que vem. 🌟",
  "Que o espírito natalino nos lembre: ninguém é feliz sozinho. 🤝",
  "Que cada dia do novo ano seja um presente a ser desembrulhado. 🎄",
  "Que a estrela de Belém ilumine seus sonhos e guie seus passos. ⭐",
  "O melhor presente é ter pessoas especiais para compartilhar a vida. ❤️",
  "Que nunca falte amor para dar, motivos para agradecer e sonhos para realizar. 💫",
  "Que o amor seja o presente mais bonito debaixo da sua árvore. 💝"
];

const textoMsg = $("#textoMsg");
let atual = 0, tRotacao, tFade;

function mostrar(i) {
  clearTimeout(tFade);
  atual = (i + mensagens.length) % mensagens.length;
  textoMsg.classList.add("sai");
  tFade = setTimeout(() => {
    textoMsg.textContent = mensagens[atual];
    textoMsg.classList.remove("sai");
  }, reduzMovimento ? 0 : 350);
}

function iniciarRotacao() {
  clearInterval(tRotacao);
  tRotacao = setInterval(() => mostrar(atual + 1), 8000);
}

$("#btnMsg").addEventListener("click", () => {
  mostrar(atual + 1);
  iniciarRotacao();
});

textoMsg.textContent = mensagens[0];
iniciarRotacao();

/* ---------- Contagem regressiva ---------- */
const [elD, elH, elM, elS] = ["#d", "#h", "#m", "#s"].map($);
const textoContagem = $("#textoContagem");
const dois = (n) => String(n).padStart(2, "0");

function contar() {
  const agora = new Date();
  const hoje25 = agora.getMonth() === 11 && agora.getDate() === 25;
  let natal = new Date(agora.getFullYear(), 11, 25);
  if (agora >= natal) natal = new Date(agora.getFullYear() + 1, 11, 25);

  const dif = hoje25 ? 0 : natal - agora;

  elD.textContent = dois(Math.floor(dif / 864e5));
  elH.textContent = dois(Math.floor(dif / 36e5) % 24);
  elM.textContent = dois(Math.floor(dif / 6e4) % 60);
  elS.textContent = dois(Math.floor(dif / 1e3) % 60);

  textoContagem.textContent = hoje25 ? "Hoje é Natal! 🎄" : "Faltam para o Natal";
}

contar();
setInterval(contar, 1000);

/* ---------- Cartão ---------- */
const saida = $("#saida");
const btnCompartilhar = $("#btnCompartilhar");
let textoCartao = "";

$("#formCartao").addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = $("#nome").value.trim() || "querido(a) amigo(a)";
  const msg = mensagens[Math.floor(Math.random() * mensagens.length)];
  textoCartao = `Feliz Natal, ${nome}! 🎅\n\n${msg}`;

  const papel = document.createElement("div");
  papel.className = "papel";
  const titulo = document.createElement("strong");
  titulo.textContent = `Feliz Natal, ${nome}! 🎅`;
  const corpo = document.createElement("span");
  corpo.textContent = msg;
  papel.append(titulo, corpo);

  saida.replaceChildren(papel);
  btnCompartilhar.hidden = false;
});

btnCompartilhar.addEventListener("click", async () => {
  if (!textoCartao) return;

  if (navigator.share) {
    try {
      await navigator.share({ title: "Meu cartão de Natal 🎄", text: textoCartao });
      return;
    } catch (erro) {
      if (erro.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(textoCartao);
    btnCompartilhar.textContent = "✅ Mensagem copiada!";
    setTimeout(() => (btnCompartilhar.textContent = "📤 Compartilhar cartão"), 2500);
  } catch {
    alert("Não foi possível copiar. Selecione e copie a mensagem do cartão.");
  }
});

/* ---------- Música ---------- */
const musica = $("#musica");
const btnMusica = $("#btnMusica");

function atualizarMusica() {
  const tocando = !musica.paused;
  btnMusica.textContent = tocando ? "⏸ Pausar" : "▶ Música";
  btnMusica.setAttribute("aria-pressed", String(tocando));
}

btnMusica.addEventListener("click", async () => {
  if (!musica.paused) return musica.pause();
  try {
    await musica.play();
  } catch {
    btnMusica.textContent = "⚠ Música indisponível";
  }
});

["play", "pause", "ended"].forEach((ev) => musica.addEventListener(ev, atualizarMusica));

atualizarTema();

/* ---------- Amigo secreto ---------- */
const amigos = [];
const listaAmigos = $("#listaAmigos");
const btnSortear = $("#btnSortear");
const resAmigo = $("#resultadoAmigo");

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function desenharAmigos() {
  listaAmigos.replaceChildren(...amigos.map((nome, i) => {
    const li = document.createElement("li");
    const rm = document.createElement("button");
    rm.type = "button";
    rm.textContent = "×";
    rm.setAttribute("aria-label", `Remover ${nome}`);
    rm.addEventListener("click", () => {
      amigos.splice(i, 1);
      resAmigo.replaceChildren();
      desenharAmigos();
    });
    li.append(nome, rm);
    return li;
  }));
  btnSortear.disabled = amigos.length < 3;
}

$("#formAmigo").addEventListener("submit", (e) => {
  e.preventDefault();
  const campo = $("#nomeAmigo");
  const nome = campo.value.trim();
  if (nome && !amigos.includes(nome) && amigos.length < 20) {
    amigos.push(nome);
    resAmigo.replaceChildren();
    desenharAmigos();
  }
  campo.value = "";
  campo.focus();
});

btnSortear.addEventListener("click", () => {
  let tirados;
  do { tirados = embaralhar(amigos); }
  while (tirados.some((nome, i) => nome === amigos[i]));   // ninguém tira a si mesmo

  const botoes = document.createElement("div");
  botoes.className = "sorteio";
  const revelado = document.createElement("p");
  revelado.className = "revelado";
  let tFechar;

  amigos.forEach((nome, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-sec";
    b.textContent = nome;
    b.addEventListener("click", () => {
      clearTimeout(tFechar);
      revelado.textContent = `${nome} tirou: ${tirados[i]} 🎁`;
      tFechar = setTimeout(() => (revelado.textContent = ""), 4000);
    });
    botoes.appendChild(b);
  });

  resAmigo.replaceChildren(botoes, revelado);
});

/* ---------- Carta ao Papai Noel ---------- */
$("#btnCarta").addEventListener("click", () => {
  const campo = $("#textoCarta");
  const resposta = $("#respostaCarta");

  if (!campo.value.trim()) {
    resposta.textContent = "Escreva algo na carta antes de enviar.";
    return;
  }

  campo.value = "";
  resposta.textContent = "✉️ Carta a caminho do Polo Norte...";
  setTimeout(() => {
    resposta.textContent = "🎅 Ho! Ho! Ho! O Papai Noel leu a sua carta e já avisou os duendes.";
  }, reduzMovimento ? 0 : 1800);
});