const DICTIONARIES = {
  en: {
    loginTitle: 'Steem Flags', loginPrompt: 'Enter your Steem username to continue.', usernameLabel: 'Steem username', login: 'Login',
    invalidUsername: 'Enter a valid Steem username.', loggedInAs: 'Logged in as', logout: 'Logout',
    welcome: 'How well do you know the world?', gameRule: 'Choose the correct country. Correct answers earn +1 SF; wrong answers cost 1 SF.',
    startGame: 'Start Game', noEnergy: 'No Energy — Come Back Tomorrow', home: 'Home', reset: 'Reset Game',
    whichCountry: 'Which country does this flag belong to?', nextQuestion: 'Next question',
    question: 'Question', of: 'of', score: 'Score', correct: 'Correct!', wrong: 'Wrong. Correct answer:',
    gameComplete: 'Game complete!', preparing: 'Preparing the game interface.', jsRequired: 'JavaScript is required to play this game.'
  },
  fa: {
    loginTitle: 'استیم فلگز', loginPrompt: 'نام کاربری استیم خود را برای ادامه وارد کنید.', usernameLabel: 'نام کاربری استیم', login: 'ورود',
    invalidUsername: 'یک نام کاربری معتبر استیم وارد کنید.', loggedInAs: 'وارد شده به عنوان', logout: 'خروج',
    welcome: 'چقدر کشورهای جهان را می‌شناسید؟', gameRule: 'کشور درست را انتخاب کنید. پاسخ صحیح +۱ SF و پاسخ غلط −۱ SF است.',
    startGame: 'شروع بازی', noEnergy: 'انرژی ندارید — فردا دوباره برگردید', home: 'خانه', reset: 'بازنشانی بازی',
    whichCountry: 'این پرچم متعلق به کدام کشور است؟', nextQuestion: 'سؤال بعدی',
    question: 'سؤال', of: 'از', score: 'امتیاز', correct: 'درست!', wrong: 'اشتباه. پاسخ صحیح:',
    gameComplete: 'بازی تمام شد!', preparing: 'در حال آماده‌سازی رابط بازی.', jsRequired: 'برای اجرای بازی JavaScript لازم است.'
  },
  es: {
    loginTitle: 'Steem Flags', loginPrompt: 'Introduce tu nombre de usuario de Steem para continuar.', usernameLabel: 'Nombre de usuario de Steem', login: 'Iniciar sesión',
    invalidUsername: 'Introduce un nombre de usuario de Steem válido.', loggedInAs: 'Sesión iniciada como', logout: 'Cerrar sesión',
    welcome: '¿Cuánto conoces del mundo?', gameRule: 'Elige el país correcto. Las respuestas correctas ganan +1 SF; las incorrectas cuestan 1 SF.',
    startGame: 'Iniciar juego', noEnergy: 'Sin energía — vuelve mañana', home: 'Inicio', reset: 'Reiniciar juego',
    whichCountry: '¿A qué país pertenece esta bandera?', nextQuestion: 'Siguiente pregunta',
    question: 'Pregunta', of: 'de', score: 'Puntuación', correct: '¡Correcto!', wrong: 'Incorrecto. Respuesta correcta:',
    gameComplete: '¡Juego completado!', preparing: 'Preparando la interfaz del juego.', jsRequired: 'Se necesita JavaScript para jugar.'
  }
};

export const LANGUAGES = Object.freeze(['en', 'fa', 'es']);
const STORAGE_KEY = 'steemFlagsLanguage';

export function getLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return LANGUAGES.includes(saved) ? saved : 'en';
}

export function setLanguage(language) {
  const value = LANGUAGES.includes(language) ? language : 'en';
  localStorage.setItem(STORAGE_KEY, value);
  return value;
}

export function t(key, language = getLanguage()) {
  return DICTIONARIES[language]?.[key] ?? DICTIONARIES.en[key] ?? key;
}

export function applyLanguage(root = document, language = getLanguage()) {
  const lang = setLanguage(language);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  root.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n, lang);
  });
  return lang;
}
