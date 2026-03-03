'use strict'

let stompClient
let chatUser
let user
let isActive = true;
let connection = false;
let currentRecipient = null; // null means global chat

// A map to store active private chats in the sidebar
// key: nickname, value: preview text
const activeChats = new Map();

// Unread message counts for private DMs
const unreadCounts = new Map();

// ============================================================
// EMOJI PICKER DATA
// ============================================================
const EMOJI_CATEGORIES = [
    {
        id: 'smileys', label: 'Smileys & Emotion', icon: '😀',
        emojis: [
            { e: '😀', n: 'grinning face' }, { e: '😃', n: 'grinning face big eyes' },
            { e: '😄', n: 'grinning face smiling eyes' }, { e: '😁', n: 'beaming face' },
            { e: '😆', n: 'grinning squinting face' }, { e: '😅', n: 'grinning face sweat' },
            { e: '🤣', n: 'rolling on floor laughing' }, { e: '😂', n: 'face tears of joy' },
            { e: '🙂', n: 'slightly smiling face' }, { e: '🙃', n: 'upside down face' },
            { e: '😉', n: 'winking face' }, { e: '😊', n: 'smiling face blushing' },
            { e: '😇', n: 'smiling face halo' }, { e: '🥰', n: 'smiling face hearts' },
            { e: '😍', n: 'smiling face heart eyes' }, { e: '🤩', n: 'star struck' },
            { e: '😘', n: 'face blowing kiss' }, { e: '😗', n: 'kissing face' },
            { e: '😚', n: 'kissing face closed eyes' }, { e: '😙', n: 'kissing face smiling eyes' },
            { e: '🥲', n: 'smiling face tear' }, { e: '😋', n: 'face savoring food' },
            { e: '😛', n: 'face tongue' }, { e: '😜', n: 'winking face tongue' },
            { e: '🤪', n: 'zany face' }, { e: '😝', n: 'squinting face tongue' },
            { e: '🤑', n: 'money mouth face' }, { e: '🤗', n: 'hugging face' },
            { e: '🤭', n: 'face hand over mouth' }, { e: '🤫', n: 'shushing face' },
            { e: '🤔', n: 'thinking face' }, { e: '🤐', n: 'zipper mouth face' },
            { e: '🤨', n: 'face raised eyebrow' }, { e: '😐', n: 'neutral face' },
            { e: '😑', n: 'expressionless face' }, { e: '😶', n: 'face without mouth' },
            { e: '😏', n: 'smirking face' }, { e: '😒', n: 'unamused face' },
            { e: '🙄', n: 'face rolling eyes' }, { e: '😬', n: 'grimacing face' },
            { e: '🤥', n: 'lying face' }, { e: '😌', n: 'relieved face' },
            { e: '😔', n: 'pensive face' }, { e: '😪', n: 'sleepy face' },
            { e: '🤤', n: 'drooling face' }, { e: '😴', n: 'sleeping face' },
            { e: '😷', n: 'face medical mask' }, { e: '🤒', n: 'face thermometer' },
            { e: '🤕', n: 'face head bandage' }, { e: '🤢', n: 'nauseated face' },
            { e: '🤮', n: 'face vomiting' }, { e: '🤧', n: 'sneezing face' },
            { e: '🥵', n: 'hot face' }, { e: '🥶', n: 'cold face' },
            { e: '🥴', n: 'woozy face' }, { e: '😵', n: 'dizzy face' },
            { e: '🤯', n: 'exploding head' }, { e: '🤠', n: 'cowboy hat face' },
            { e: '🥳', n: 'partying face' }, { e: '🥸', n: 'disguised face' },
            { e: '😎', n: 'smiling face sunglasses' }, { e: '🤓', n: 'nerd face' },
            { e: '🧐', n: 'face monocle' }, { e: '😕', n: 'confused face' },
            { e: '😟', n: 'worried face' }, { e: '🙁', n: 'slightly frowning face' },
            { e: '☹️', n: 'frowning face' }, { e: '😮', n: 'face open mouth' },
            { e: '😯', n: 'hushed face' }, { e: '😲', n: 'astonished face' },
            { e: '😳', n: 'flushed face' }, { e: '🥺', n: 'pleading face' },
            { e: '😦', n: 'frowning face open mouth' }, { e: '😧', n: 'anguished face' },
            { e: '😨', n: 'fearful face' }, { e: '😰', n: 'anxious face sweat' },
            { e: '😥', n: 'sad but relieved face' }, { e: '😢', n: 'crying face' },
            { e: '😭', n: 'loudly crying face' }, { e: '😱', n: 'face screaming in fear' },
            { e: '😖', n: 'confounded face' }, { e: '😣', n: 'persevering face' },
            { e: '😞', n: 'disappointed face' }, { e: '😓', n: 'downcast face sweat' },
            { e: '😩', n: 'weary face' }, { e: '😫', n: 'tired face' },
            { e: '🥱', n: 'yawning face' }, { e: '😤', n: 'triumph face' },
            { e: '😡', n: 'pouting face' }, { e: '😠', n: 'angry face' },
            { e: '🤬', n: 'face symbols mouth' }, { e: '😈', n: 'smiling face horns' },
            { e: '👿', n: 'angry face horns' }, { e: '💀', n: 'skull' },
            { e: '💩', n: 'pile of poo' }, { e: '🤡', n: 'clown face' },
            { e: '👻', n: 'ghost' }, { e: '👽', n: 'alien' },
            { e: '🤖', n: 'robot' }, { e: '😺', n: 'grinning cat' },
            { e: '😸', n: 'grinning cat smiling eyes' }, { e: '😹', n: 'cat joy' },
            { e: '😻', n: 'smiling cat heart eyes' }, { e: '😼', n: 'cat wry smile' },
            { e: '😽', n: 'kissing cat' }, { e: '🙀', n: 'weary cat' },
            { e: '😿', n: 'crying cat' }, { e: '😾', n: 'pouting cat' },
        ]
    },
    {
        id: 'people', label: 'People & Body', icon: '👋',
        emojis: [
            { e: '👋', n: 'waving hand' }, { e: '🤚', n: 'raised back of hand' },
            { e: '🖐️', n: 'hand fingers splayed' }, { e: '✋', n: 'raised hand' },
            { e: '🖖', n: 'vulcan salute' }, { e: '👌', n: 'ok hand' },
            { e: '🤌', n: 'pinched fingers' }, { e: '✌️', n: 'victory hand' },
            { e: '🤞', n: 'crossed fingers' }, { e: '🤟', n: 'love you gesture' },
            { e: '🤘', n: 'sign of the horns' }, { e: '🤙', n: 'call me hand' },
            { e: '👈', n: 'backhand index left' }, { e: '👉', n: 'backhand index right' },
            { e: '👆', n: 'backhand index up' }, { e: '🖕', n: 'middle finger' },
            { e: '👇', n: 'backhand index down' }, { e: '☝️', n: 'index pointing up' },
            { e: '👍', n: 'thumbs up' }, { e: '👎', n: 'thumbs down' },
            { e: '✊', n: 'raised fist' }, { e: '👊', n: 'oncoming fist' },
            { e: '🤛', n: 'left facing fist' }, { e: '🤜', n: 'right facing fist' },
            { e: '👏', n: 'clapping hands' }, { e: '🙌', n: 'raising hands' },
            { e: '👐', n: 'open hands' }, { e: '🤲', n: 'palms up together' },
            { e: '🤝', n: 'handshake' }, { e: '🙏', n: 'folded hands' },
            { e: '✍️', n: 'writing hand' }, { e: '💅', n: 'nail polish' },
            { e: '🤳', n: 'selfie' }, { e: '💪', n: 'flexed biceps' },
            { e: '🦵', n: 'leg' }, { e: '🦶', n: 'foot' },
            { e: '👂', n: 'ear' }, { e: '🦻', n: 'ear hearing aid' },
            { e: '👃', n: 'nose' }, { e: '🧠', n: 'brain' },
            { e: '👀', n: 'eyes' }, { e: '👁️', n: 'eye' },
            { e: '👅', n: 'tongue' }, { e: '👄', n: 'mouth' },
        ]
    },
    {
        id: 'nature', label: 'Animals & Nature', icon: '🐶',
        emojis: [
            { e: '🐶', n: 'dog face' }, { e: '🐱', n: 'cat face' },
            { e: '🐭', n: 'mouse face' }, { e: '🐹', n: 'hamster' },
            { e: '🐰', n: 'rabbit face' }, { e: '🦊', n: 'fox' },
            { e: '🐻', n: 'bear' }, { e: '🐼', n: 'panda' },
            { e: '🐨', n: 'koala' }, { e: '🐯', n: 'tiger face' },
            { e: '🦁', n: 'lion' }, { e: '🐮', n: 'cow face' },
            { e: '🐷', n: 'pig face' }, { e: '🐸', n: 'frog' },
            { e: '🐵', n: 'monkey face' }, { e: '🦆', n: 'duck' },
            { e: '🦅', n: 'eagle' }, { e: '🦉', n: 'owl' },
            { e: '🦋', n: 'butterfly' }, { e: '🐝', n: 'honeybee' },
            { e: '🌸', n: 'cherry blossom' }, { e: '🌺', n: 'hibiscus' },
            { e: '🌻', n: 'sunflower' }, { e: '🌹', n: 'rose' },
            { e: '🍀', n: 'four leaf clover' }, { e: '🌿', n: 'herb' },
            { e: '🌱', n: 'seedling' }, { e: '🌳', n: 'deciduous tree' },
            { e: '🌊', n: 'water wave' }, { e: '🔥', n: 'fire' },
            { e: '⭐', n: 'star' }, { e: '🌈', n: 'rainbow' },
            { e: '☀️', n: 'sun' }, { e: '🌙', n: 'crescent moon' },
            { e: '⛄', n: 'snowman' }, { e: '🌍', n: 'globe europe africa' },
        ]
    },
    {
        id: 'food', label: 'Food & Drink', icon: '🍕',
        emojis: [
            { e: '🍕', n: 'pizza' }, { e: '🍔', n: 'hamburger' },
            { e: '🍟', n: 'french fries' }, { e: '🌮', n: 'taco' },
            { e: '🌯', n: 'burrito' }, { e: '🍿', n: 'popcorn' },
            { e: '🍩', n: 'doughnut' }, { e: '🍪', n: 'cookie' },
            { e: '🎂', n: 'birthday cake' }, { e: '🍰', n: 'shortcake' },
            { e: '🧁', n: 'cupcake' }, { e: '🍦', n: 'soft ice cream' },
            { e: '🍫', n: 'chocolate bar' }, { e: '🍬', n: 'candy' },
            { e: '🍭', n: 'lollipop' }, { e: '☕', n: 'hot beverage' },
            { e: '🧋', n: 'bubble tea' }, { e: '🍺', n: 'beer mug' },
            { e: '🥂', n: 'clinking glasses' }, { e: '🍷', n: 'wine glass' },
            { e: '🍎', n: 'red apple' }, { e: '🍊', n: 'tangerine' },
            { e: '🍋', n: 'lemon' }, { e: '🍇', n: 'grapes' },
            { e: '🍓', n: 'strawberry' }, { e: '🍒', n: 'cherries' },
            { e: '🥑', n: 'avocado' }, { e: '🥦', n: 'broccoli' },
        ]
    },
    {
        id: 'activity', label: 'Activities', icon: '⚽',
        emojis: [
            { e: '⚽', n: 'soccer ball' }, { e: '🏀', n: 'basketball' },
            { e: '🏈', n: 'american football' }, { e: '⚾', n: 'baseball' },
            { e: '🎾', n: 'tennis' }, { e: '🏐', n: 'volleyball' },
            { e: '🏉', n: 'rugby football' }, { e: '🎱', n: 'pool 8 ball' },
            { e: '🏓', n: 'ping pong' }, { e: '🏸', n: 'badminton' },
            { e: '🥊', n: 'boxing glove' }, { e: '🥋', n: 'martial arts uniform' },
            { e: '🎯', n: 'bullseye' }, { e: '⛳', n: 'golf' },
            { e: '🎮', n: 'video game' }, { e: '🕹️', n: 'joystick' },
            { e: '🎲', n: 'game die' }, { e: '♟️', n: 'chess pawn' },
            { e: '🎭', n: 'performing arts' }, { e: '🎨', n: 'artist palette' },
            { e: '🎬', n: 'clapper board' }, { e: '🎤', n: 'microphone' },
            { e: '🎧', n: 'headphone' }, { e: '🎵', n: 'musical note' },
            { e: '🎶', n: 'musical notes' }, { e: '🎷', n: 'saxophone' },
            { e: '🎸', n: 'guitar' }, { e: '🎹', n: 'musical keyboard' },
        ]
    },
    {
        id: 'travel', label: 'Travel & Places', icon: '✈️',
        emojis: [
            { e: '✈️', n: 'airplane' }, { e: '🚀', n: 'rocket' },
            { e: '🛸', n: 'flying saucer' }, { e: '🚂', n: 'locomotive' },
            { e: '🚗', n: 'automobile' }, { e: '🚕', n: 'taxi' },
            { e: '🚌', n: 'bus' }, { e: '🚔', n: 'police car' },
            { e: '🚑', n: 'ambulance' }, { e: '🚒', n: 'fire engine' },
            { e: '🏠', n: 'house' }, { e: '🏢', n: 'office building' },
            { e: '🏰', n: 'castle' }, { e: '🗼', n: 'tokyo tower' },
            { e: '🗽', n: 'statue of liberty' }, { e: '⛪', n: 'church' },
            { e: '🌁', n: 'foggy' }, { e: '🌃', n: 'night with stars' },
            { e: '🌉', n: 'bridge at night' }, { e: '🗺️', n: 'world map' },
        ]
    },
    {
        id: 'objects', label: 'Objects', icon: '💡',
        emojis: [
            { e: '💡', n: 'light bulb' }, { e: '🔦', n: 'flashlight' },
            { e: '📱', n: 'mobile phone' }, { e: '💻', n: 'laptop' },
            { e: '⌨️', n: 'keyboard' }, { e: '🖥️', n: 'desktop computer' },
            { e: '🖨️', n: 'printer' }, { e: '📷', n: 'camera' },
            { e: '📸', n: 'camera with flash' }, { e: '📹', n: 'video camera' },
            { e: '📺', n: 'television' }, { e: '📻', n: 'radio' },
            { e: '📞', n: 'telephone receiver' }, { e: '📡', n: 'satellite antenna' },
            { e: '🔋', n: 'battery' }, { e: '🔌', n: 'electric plug' },
            { e: '💾', n: 'floppy disk' }, { e: '💿', n: 'optical disk' },
            { e: '📀', n: 'dvd' }, { e: '🧲', n: 'magnet' },
            { e: '🔧', n: 'wrench' }, { e: '🔨', n: 'hammer' },
            { e: '⚙️', n: 'gear' }, { e: '🔩', n: 'nut and bolt' },
            { e: '🔑', n: 'key' }, { e: '🗝️', n: 'old key' },
            { e: '💊', n: 'pill' }, { e: '💉', n: 'syringe' },
            { e: '🩺', n: 'stethoscope' }, { e: '🩹', n: 'adhesive bandage' },
            { e: '📚', n: 'books' }, { e: '📖', n: 'open book' },
            { e: '✏️', n: 'pencil' }, { e: '🖊️', n: 'pen' },
            { e: '📌', n: 'pushpin' }, { e: '📎', n: 'paperclip' },
        ]
    },
    {
        id: 'symbols', label: 'Symbols', icon: '❤️',
        emojis: [
            { e: '❤️', n: 'red heart' }, { e: '🧡', n: 'orange heart' },
            { e: '💛', n: 'yellow heart' }, { e: '💚', n: 'green heart' },
            { e: '💙', n: 'blue heart' }, { e: '💜', n: 'purple heart' },
            { e: '🖤', n: 'black heart' }, { e: '🤍', n: 'white heart' },
            { e: '🤎', n: 'brown heart' }, { e: '💔', n: 'broken heart' },
            { e: '❣️', n: 'heart exclamation' }, { e: '💕', n: 'two hearts' },
            { e: '💞', n: 'revolving hearts' }, { e: '💓', n: 'beating heart' },
            { e: '💗', n: 'growing heart' }, { e: '💖', n: 'sparkling heart' },
            { e: '💘', n: 'heart with arrow' }, { e: '💝', n: 'heart with ribbon' },
            { e: '💟', n: 'heart decoration' }, { e: '☮️', n: 'peace symbol' },
            { e: '✝️', n: 'cross' }, { e: '☯️', n: 'yin yang' },
            { e: '✅', n: 'check mark button' }, { e: '❌', n: 'cross mark' },
            { e: '⭕', n: 'hollow red circle' }, { e: '🔴', n: 'red circle' },
            { e: '🟠', n: 'orange circle' }, { e: '🟡', n: 'yellow circle' },
            { e: '🟢', n: 'green circle' }, { e: '🔵', n: 'blue circle' },
            { e: '🟣', n: 'purple circle' }, { e: '⚫', n: 'black circle' },
            { e: '⚪', n: 'white circle' }, { e: '🔶', n: 'large orange diamond' },
            { e: '🔷', n: 'large blue diamond' }, { e: '⚡', n: 'high voltage' },
            { e: '🌟', n: 'glowing star' }, { e: '💫', n: 'dizzy' },
            { e: '✨', n: 'sparkles' }, { e: '🎉', n: 'party popper' },
            { e: '🎊', n: 'confetti ball' }, { e: '🎈', n: 'balloon' },
            { e: '🎁', n: 'wrapped gift' }, { e: '🏆', n: 'trophy' },
            { e: '🥇', n: 'first place medal' }, { e: '🎖️', n: 'military medal' },
        ]
    }
];

let currentEmojiCategory = 0;
let emojiPickerOpen = false;

// ============================================================
// EMOJI PICKER INITIALIZATION
// ============================================================
function initEmojiPicker() {
    const tabContainer = document.getElementById('emoji-category-tabs');
    EMOJI_CATEGORIES.forEach((cat, idx) => {
        const btn = document.createElement('button');
        btn.className = 'emoji-cat-tab' + (idx === 0 ? ' active' : '');
        btn.title = cat.label;
        btn.textContent = cat.icon;
        btn.setAttribute('data-idx', idx);
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            switchEmojiCategory(idx);
        });
        tabContainer.appendChild(btn);
    });
    renderEmojiCategory(0);
}

function switchEmojiCategory(idx) {
    currentEmojiCategory = idx;
    document.querySelectorAll('.emoji-cat-tab').forEach((t, i) => {
        t.classList.toggle('active', i === idx);
    });
    document.getElementById('emoji-search-input').value = '';
    document.getElementById('emoji-category-label').textContent = EMOJI_CATEGORIES[idx].label;
    renderEmojiCategory(idx);
}

function renderEmojiCategory(idx) {
    const grid = document.getElementById('emoji-grid');
    grid.innerHTML = '';
    EMOJI_CATEGORIES[idx].emojis.forEach(({ e, n }) => {
        const span = document.createElement('span');
        span.className = 'emoji-item';
        span.textContent = e;
        span.title = n;
        span.addEventListener('click', () => insertEmoji(e));
        grid.appendChild(span);
    });
}

function renderEmojiSearchResults(query) {
    const grid = document.getElementById('emoji-grid');
    const label = document.getElementById('emoji-category-label');
    grid.innerHTML = '';
    const q = query.toLowerCase();
    const results = [];
    EMOJI_CATEGORIES.forEach(cat => {
        cat.emojis.forEach(({ e, n }) => {
            if (n.includes(q)) results.push({ e, n });
        });
    });

    if (results.length === 0) {
        label.textContent = 'No results for "' + query + '"';
        grid.innerHTML = '<div class="emoji-no-results">😕 No emoji found</div>';
        return;
    }
    label.textContent = `Results for "${query}" (${results.length})`;
    results.forEach(({ e, n }) => {
        const span = document.createElement('span');
        span.className = 'emoji-item';
        span.textContent = e;
        span.title = n;
        span.addEventListener('click', () => insertEmoji(e));
        grid.appendChild(span);
    });
}

function insertEmoji(emoji) {
    const textarea = document.getElementById('message');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    textarea.value = current.substring(0, start) + emoji + current.substring(end);
    const newPos = start + emoji.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
    // trigger auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

function openEmojiPicker() {
    emojiPickerOpen = true;
    document.getElementById('emoji-picker').classList.add('open');
    document.getElementById('emoji-toggle-btn').classList.add('active');
}

function closeEmojiPicker() {
    emojiPickerOpen = false;
    document.getElementById('emoji-picker').classList.remove('open');
    document.getElementById('emoji-toggle-btn').classList.remove('active');
}

function toggleEmojiPicker(e) {
    e.stopPropagation();
    if (emojiPickerOpen) {
        closeEmojiPicker();
    } else {
        openEmojiPicker();
    }
}

// Wire up emoji toggle button
document.getElementById('emoji-toggle-btn').addEventListener('click', toggleEmojiPicker);

// Wire up emoji search
document.getElementById('emoji-search-input').addEventListener('input', (e) => {
    const q = e.target.value.trim();
    if (q) {
        renderEmojiSearchResults(q);
    } else {
        document.getElementById('emoji-category-label').textContent = EMOJI_CATEGORIES[currentEmojiCategory].label;
        renderEmojiCategory(currentEmojiCategory);
    }
});

// Prevent clicking inside the picker from closing it
document.getElementById('emoji-picker').addEventListener('click', (e) => e.stopPropagation());

// Close picker on click outside
document.addEventListener('click', () => {
    if (emojiPickerOpen) closeEmojiPicker();
});

// Initialize emoji picker data
initEmojiPicker();

// ============================================================
// UNREAD BADGE HELPERS
// ============================================================
function incrementUnread(nickname) {
    const prev = unreadCounts.get(nickname) || 0;
    const next = prev + 1;
    unreadCounts.set(nickname, next);
    updateUnreadBadgeUI(nickname, next);
}

function clearUnread(nickname) {
    unreadCounts.set(nickname, 0);
    updateUnreadBadgeUI(nickname, 0);
}

function updateUnreadBadgeUI(nickname, count) {
    let chatItem = document.getElementById(`chat-item-${nickname}`);
    if (!chatItem) return;

    let badge = chatItem.querySelector('.unread-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'unread-badge hidden';
        chatItem.appendChild(badge);
    }

    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ============================================================
// CONNECTION STATUS UI
// ============================================================
function updateConnectionStatus(isConnected) {
    const indicator = document.getElementById('conn-status-indicator');
    const statusText = document.getElementById('current-chat-status');
    if (isConnected) {
        indicator.innerHTML = '<i class="fas fa-circle" style="color: #32c787;"></i> Connected';
        statusText.innerHTML = 'Online';
    } else {
        indicator.innerHTML = '<i class="fas fa-circle" style="color: #ff595e;"></i> Disconnected';
        statusText.innerHTML = 'Offline';
    }
}

// ============================================================
// ACCOUNT DETAILS TOGGLE
// ============================================================
document.getElementById('account-details-button').addEventListener('click', () => {
    document.querySelector('.information-details-container').classList.toggle('hide');
});

// ============================================================
// USER INFO
// ============================================================
async function GetUserInfo() {
    let url = '/api/user/';
    try {
        let res = await fetch(url, { method: 'GET' });
        if (res.ok) {
            return await res.json();
        } else {
            console.error(`HTTP error: ${res.status}`);
        }
    } catch (err) {
        console.error(err);
    }
}

GetUserInfo().then(data => {
    if (data) {
        updateChatUser(data)
        fillUserInformation();
    }
});

function fillUserInformation() {
    $('#user-name').html(chatUser.name);
    $('#user-name-header').html(chatUser.name);
    $('#user-email').html(chatUser.email);
    $('#user-nickname').html(chatUser.nickname);
    $('#avatar-initial').html(chatUser.nickname.charAt(0).toUpperCase());
    document.querySelector('.img_cont_ava').style.background = getAvatarColor(chatUser.nickname);
    user = chatUser.nickname;
}

function updateChatUser(data) {
    chatUser = {
        name: data.firstName + " " + data.lastName,
        nickname: data.nickname,
        email: data.email
    }
}

async function handleSetUserNickname(event) {
    event.preventDefault();
    let prevNickname = chatUser.nickname;
    let nickname = $('#nickname').val();
    let form = event.currentTarget;
    let url = form.action;
    await doChangeNicknameRequest(url, prevNickname, nickname);
}

async function doChangeNicknameRequest(url, prevNickname, nickname) {
    chatUser.nickname = nickname;
    let fetchOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chatUser),
    };
    let res = await fetch(url, fetchOptions);
    if (res.ok) {
        $('#user-nickname').html(nickname);
        $('#avatar-initial').html(nickname.charAt(0).toUpperCase());
        document.querySelector('.img_cont_ava').style.background = getAvatarColor(nickname);
        user = nickname;
        if (stompClient) {
            sendMessageChangeNickname(prevNickname);
        }
        addNotification(createNotification("Nickname successfully changed", "success-notification"));
    } else {
        res.json().then((data) => {
            addNotification(createNotification(data.message, "fail-notification"));
        });
    }
}

// ============================================================
// STOMP CONNECTION
// ============================================================
const connect = (event) => {
    user = document.querySelector('#user-nickname').textContent;
    if (user && !connection) {
        connection = true;
        const socket = new SockJS('/chat')
        stompClient = Stomp.over(socket)
        stompClient.connect({}, onConnected, onError)
    }
    if (event) event.preventDefault()
}

const disconnect = (event) => {
    if (connection) {
        connection = false;
        stompClient.disconnect()
        updateConnectionStatus(false);
    }
    if (event) event.preventDefault()
}

const onConnected = () => {
    updateConnectionStatus(true);
    stompClient.subscribe('/topic/public', onMessageReceived);
    stompClient.subscribe('/user/queue/private', onPrivateMessageReceived);
    stompClient.subscribe('/topic/active-users', onActiveUsersReceived);
    stompClient.send("/app/active-users", {}, "");
    stompClient.send(
        "/app/new-User",
        {},
        JSON.stringify({ from: user, type: 'CONNECT' })
    );
    // Load group chat history immediately after connecting
    loadGroupHistory(50);
}

const onActiveUsersReceived = (payload) => {
    const activeUsersList = JSON.parse(payload.body);
    renderActiveUsers(activeUsersList);
}

const renderActiveUsers = (activeUsersList) => {
    const container = document.getElementById('active-users-list');
    const countSpan = document.getElementById('active-users-count');
    if (container) {
        container.innerHTML = '';
        const otherUsers = activeUsersList.filter(u => u !== user);
        if (countSpan) countSpan.textContent = activeUsersList.length;
        if (otherUsers.length === 0) {
            container.innerHTML = '<div style="padding: 5px 15px; font-size: 0.85rem; color: rgba(255,255,255,0.4);">No one else is online</div>';
            return;
        }
        otherUsers.forEach(u => {
            const div = document.createElement('div');
            div.className = 'chat-list-item';
            div.style.padding = '8px 15px';
            const avatarColor = getAvatarColor(u);
            div.innerHTML = `
                <div class="chat-item-avatar" style="background: ${avatarColor}; width: 30px; height: 30px; font-size: 0.8rem;">${u.charAt(0).toUpperCase()}</div>
                <div class="chat-item-info">
                    <div class="chat-item-name" style="font-size: 0.9rem;">${u}</div>
                </div>
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #32c787; margin-left: auto;"></div>
            `;
            div.addEventListener('click', () => openPrivateChat(u));
            container.appendChild(div);
        });
    }
}

const onError = (error) => {
    document.getElementById('current-chat-status').innerHTML = 'Connection lost. Reload.';
    updateConnectionStatus(false);
}

// ============================================================
// DM SEARCH
// ============================================================
const dmForm = document.querySelector('#dm-form');
const dmRecipient = document.querySelector('#dm-recipient');
const searchResults = document.querySelector('#search-results');
let searchTimeout;

if (dmRecipient) {
    dmRecipient.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        if (!query) {
            searchResults.style.display = 'none';
            return;
        }
        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`/api/Users/search?query=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const users = await response.json();
                    renderSearchResults(users);
                }
            } catch (error) {
                console.error("Search failed:", error);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#dm-form')) {
            searchResults.style.display = 'none';
        }
    });
}

function renderSearchResults(users) {
    searchResults.innerHTML = '';
    const filteredUsers = users.filter(u => u.nickname !== user);
    if (filteredUsers.length === 0) {
        searchResults.style.display = 'block';
        searchResults.innerHTML = '<div style="padding: 10px; color: var(--text-muted); text-align: center; font-size: 0.9rem;">No users found</div>';
        return;
    }
    filteredUsers.forEach(u => {
        const div = document.createElement('div');
        div.style.padding = '10px 15px';
        div.style.cursor = 'pointer';
        div.style.borderBottom = '1px solid var(--panel-border)';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '10px';
        div.style.fontSize = '0.9rem';
        div.onmouseover = () => div.style.backgroundColor = 'rgba(255,255,255,0.05)';
        div.onmouseout = () => div.style.backgroundColor = 'transparent';
        const avatarColor = getAvatarColor(u.nickname);
        const avatarHtml = `<div style="width: 28px; height: 28px; border-radius: 50%; background: ${avatarColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size:0.8rem;">${u.nickname[0].toUpperCase()}</div>`;
        div.innerHTML = `${avatarHtml} <span style="color: white;">${u.nickname}</span>`;
        div.addEventListener('click', () => {
            dmRecipient.value = '';
            searchResults.style.display = 'none';
            openPrivateChat(u.nickname);
        });
        searchResults.appendChild(div);
    });
    searchResults.style.display = 'block';
}

// ============================================================
// PRIVATE CHAT MANAGEMENT
// ============================================================
function openPrivateChat(nickname) {
    if (!activeChats.has(nickname)) {
        activeChats.set(nickname, 'Started chat');
        addChatToSidebar(nickname);
    }
    switchToChat(nickname);
}

function addChatToSidebar(nickname) {
    const chatList = document.getElementById('sidebar-chat-list');
    const div = document.createElement('div');
    div.className = 'chat-list-item';
    div.id = `chat-item-${nickname}`;
    div.dataset.recipient = nickname;
    const avatarColor = getAvatarColor(nickname);
    div.innerHTML = `
        <div class="chat-item-avatar" style="background: ${avatarColor};">${nickname.charAt(0).toUpperCase()}</div>
        <div class="chat-item-info">
            <div class="chat-item-name">${nickname}</div>
            <div class="chat-item-last-msg" id="last-msg-${nickname}">${activeChats.get(nickname)}</div>
        </div>
    `;
    div.addEventListener('click', () => switchToChat(nickname));
    chatList.appendChild(div);
}

function switchToChat(recipient) {
    currentRecipient = recipient === 'global' ? null : recipient;

    // Close emoji picker when switching chats
    if (emojiPickerOpen) closeEmojiPicker();

    document.querySelectorAll('.chat-list-item').forEach(el => el.classList.remove('active'));
    const targetId = currentRecipient ? `chat-item-${currentRecipient}` : 'chat-item-global';
    const targetEl = document.getElementById(targetId);
    if (targetEl) targetEl.classList.add('active');

    if (currentRecipient) {
        document.getElementById('current-chat-name').textContent = currentRecipient;
        const avatarColor = getAvatarColor(currentRecipient);
        document.getElementById('current-chat-avatar').innerHTML = currentRecipient.charAt(0).toUpperCase();
        document.getElementById('current-chat-avatar').style.background = avatarColor;
        // Clear unread badge when opening this chat
        clearUnread(currentRecipient);
    } else {
        document.getElementById('current-chat-name').textContent = "Global Chat Room";
        document.getElementById('current-chat-avatar').innerHTML = '<i class="fas fa-globe"></i>';
        document.getElementById('current-chat-avatar').style.background = 'linear-gradient(135deg, #3390ec, #2481cc)';
    }

    document.getElementById('chat').innerHTML = '';

    // Load history for the newly selected chat
    if (!connection) return; // Not connected yet — onConnected() will load history
    if (currentRecipient) {
        loadPrivateHistory(currentRecipient);
    } else {
        loadGroupHistory(50);
    }
}

document.getElementById('chat-item-global').addEventListener('click', () => {
    switchToChat('global');
});

// ============================================================
// CHAT HISTORY LOADERS
// ============================================================

/**
 * Show a brief loading indicator in the message area.
 */
function showHistoryLoader() {
    const chat = document.getElementById('chat');
    chat.insertAdjacentHTML('afterbegin',
        '<div id="history-loader" style="text-align:center; padding: 12px 0; font-size:0.82rem; color:rgba(255,255,255,0.4);">' +
        '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Loading history…</div>');
}

function removeHistoryLoader() {
    const loader = document.getElementById('history-loader');
    if (loader) loader.remove();
}

/**
 * Load the last `pageSize` messages for the global group chat.
 */
async function loadGroupHistory(pageSize = 50) {
    if (!user) return;
    showHistoryLoader();
    try {
        const res = await fetch(`/api/chat/group/history?pageSize=${pageSize}`);
        if (!res.ok) {
            console.warn('Group history fetch failed:', res.status);
            return;
        }
        const messages = await res.json();
        removeHistoryLoader();
        if (messages.length === 0) {
            document.getElementById('chat').insertAdjacentHTML('afterbegin',
                '<div style="text-align:center; padding:12px 0; font-size:0.82rem; color:rgba(255,255,255,0.3);">No messages yet — say hello! 👋</div>');
            return;
        }
        // Only render if we're still on the global chat
        if (currentRecipient !== null) return;
        messages.forEach(msg => displayMessage(msg, false));
    } catch (err) {
        console.error('Error loading group history:', err);
        removeHistoryLoader();
    }
}

/**
 * Load the full private conversation history between `user` and `nickname`.
 */
async function loadPrivateHistory(nickname) {
    if (!user || !nickname) return;
    showHistoryLoader();
    try {
        const res = await fetch(`/api/chat/history?user1=${encodeURIComponent(user)}&user2=${encodeURIComponent(nickname)}`);
        if (!res.ok) {
            console.warn('Private history fetch failed:', res.status);
            removeHistoryLoader();
            return;
        }
        const messages = await res.json();
        removeHistoryLoader();
        if (messages.length === 0) {
            document.getElementById('chat').insertAdjacentHTML('afterbegin',
                `<div style="text-align:center; padding:12px 0; font-size:0.82rem; color:rgba(255,255,255,0.3);">Start a conversation with ${nickname}! 🔒</div>`);
            return;
        }
        // Only render if we're still on this private chat
        if (currentRecipient !== nickname) return;
        messages.forEach(msg => displayMessage(msg, true));
    } catch (err) {
        console.error('Error loading private history:', err);
        removeHistoryLoader();
    }
}

// ============================================================
// SEND MESSAGE
// ============================================================

const sendMessage = (event) => {
    event.preventDefault();
    const messageInput = document.querySelector('#message')
    const messageContent = messageInput.value.trim()

    if (messageContent && stompClient) {
        const chatMessage = {
            from: user,
            message: messageContent,
            type: 'CHAT',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        if (currentRecipient) {
            chatMessage.recipientTo = currentRecipient;
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            displayMessage(chatMessage, true);
            updateSidebarPreview(currentRecipient, "You: " + messageContent);
        } else {
            stompClient.send("/app/room-message", {}, JSON.stringify(chatMessage));
        }
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // Close emoji picker on send
        if (emojiPickerOpen) closeEmojiPicker();
    }
}

// ============================================================
// FILE ATTACHMENT UPLOAD
// ============================================================

/**
 * Triggered when the user picks a file via the hidden input.
 * Uploads to /api/upload and broadcasts the URL via WebSocket.
 */
async function handleFileSelected(event) {
    const file = event.target.files[0];
    if (!file || !stompClient) return;

    // Reset input so same file can be selected again
    event.target.value = '';

    // Show uploading indicator
    const uploadBtn = document.getElementById('attach-btn');
    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
            const err = await res.json();
            addNotification(createNotification(err.error || 'Upload failed', 'fail-notification'));
            return;
        }

        const data = await res.json();
        sendFileMessage(data.fileUrl, data.fileName, data.fileType, data.fileSize);
    } catch (err) {
        console.error('File upload error:', err);
        addNotification(createNotification('Upload failed. Please try again.', 'fail-notification'));
    } finally {
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-paperclip"></i>';
        }
    }
}

/**
 * Sends a WebSocket message for an uploaded file.
 */
function sendFileMessage(fileUrl, fileName, fileType, fileSize) {
    if (!stompClient || !fileUrl) return;

    let msgType = 'FILE';
    if (fileType && fileType.startsWith('image/')) msgType = 'IMAGE';
    else if (fileType && fileType.startsWith('video/')) msgType = 'VIDEO';

    const chatMessage = {
        from: user,
        message: fileName,   // caption = filename
        type: msgType,
        fileUrl: fileUrl,
        fileName: fileName,
        fileType: fileType,
        fileSize: fileSize,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (currentRecipient) {
        chatMessage.recipientTo = currentRecipient;
        stompClient.send('/app/private-message', {}, JSON.stringify(chatMessage));
        displayMessage(chatMessage, true);
        updateSidebarPreview(currentRecipient, '📎 ' + fileName);
    } else {
        stompClient.send('/app/room-message', {}, JSON.stringify(chatMessage));
    }
}

// Wire up the hidden file input
const fileInput = document.getElementById('file-input');
if (fileInput) fileInput.addEventListener('change', handleFileSelected);

// Wire up the attachment button to trigger the file input
const attachBtn = document.getElementById('attach-btn');
if (attachBtn) attachBtn.addEventListener('click', () => {
    if (!stompClient) {
        addNotification(createNotification('Connect to chat first!', 'fail-notification'));
        return;
    }
    fileInput && fileInput.click();
});

const sendMessageChangeNickname = (prevNickname) => {
    const messageContent = `changed nickname to ${user}`;
    if (stompClient) {
        const chatMessage = { from: user, message: messageContent, type: 'CHANGE_NICKNAME' }
        stompClient.send("/app/room-message", {}, JSON.stringify(chatMessage))
    }
}

// ============================================================
// MESSAGE RECEIVERS
// ============================================================
const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    if (message.type === 'CHAT') {
        const snippet = `${message.sender}: ${message.content}`;
        document.getElementById('global-last-msg').textContent = snippet;
    }
    if (currentRecipient) {
        if (message.type !== 'CONNECT' && message.type !== 'DISCONNECT' && message.type !== 'CHANGE_NICKNAME') {
            return;
        }
    }
    displayMessage(message, false);
}

const onPrivateMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    const sender = message.sender || message.from;

    if (!activeChats.has(sender)) {
        activeChats.set(sender, message.content || message.fileName || '');
        addChatToSidebar(sender);
    }
    const previewText = (message.type === 'IMAGE') ? '📷 Image'
        : (message.type === 'VIDEO') ? '🎥 Video'
            : (message.type === 'FILE') ? ('📎 ' + (message.fileName || 'File'))
                : (message.content || '');
    updateSidebarPreview(sender, previewText);

    if (currentRecipient === sender) {
        displayMessage(message, true);
    } else {
        // Increment unread badge
        incrementUnread(sender);
        addNotification(createNotification(`💬 New message from ${sender}`, "success-notification"));
    }
}

function updateSidebarPreview(nickname, text) {
    activeChats.set(nickname, text);
    const previewEl = document.getElementById(`last-msg-${nickname}`);
    if (previewEl) previewEl.textContent = text;
}

// ============================================================
// DISPLAY MESSAGE
// ============================================================
const displayMessage = (message, isPrivate) => {
    const chat = document.getElementById('chat');

    // Normalize field names:
    //   outgoing JS object  → { from, message, timestamp }
    //   server entity (REST / WS echo) → { sender, content, timeStamp }
    const sender = message.sender || message.from;
    const content = message.content || message.message;
    const timeStamp = message.timeStamp || message.timestamp
        || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const type = message.type;
    const fileUrl = message.fileUrl;
    const fileName = message.fileName;
    const fileType = message.fileType;

    if (type === 'CONNECT') {
        chat.innerHTML += `<div class="event-message">${sender} joined the chat</div>`;
    } else if (type === 'DISCONNECT') {
        chat.innerHTML += `<div class="event-message">${sender} left the chat</div>`;
    } else if (type === 'CHANGE_NICKNAME') {
        chat.innerHTML += `<div class="event-message">${sender} ${content}</div>`;
    } else {
        const isMyMessage = sender === user;
        const wrapper = document.createElement('div');
        wrapper.className = `chat-message-wrapper ${isMyMessage ? 'message-out' : 'message-in'}`;

        let nameHtml = '';
        if (!isMyMessage) {
            nameHtml = `<span class="message-sender-name" style="color: ${getAvatarColor(sender)}">${sender}</span>`;
        }

        // Private indicator badge on bubble
        const privateBadge = isPrivate && isMyMessage
            ? `<span style="font-size:0.65rem; opacity:0.6; margin-right:4px;">🔒</span>`
            : '';

        // Build the message body (text, image, video, or file link)
        let bodyHtml = '';
        if (type === 'IMAGE' && fileUrl) {
            bodyHtml = `
                <a href="${fileUrl}" target="_blank">
                    <img src="${fileUrl}" alt="${escapeHtml(fileName || 'image')}" style="max-width:260px; max-height:260px; border-radius:8px; display:block; margin-top:4px; cursor:pointer;" loading="lazy">
                </a>`;
            if (content && content !== fileName) {
                bodyHtml += `<div class="message-text" style="margin-top:4px;">${escapeHtml(content)}</div>`;
            }
        } else if (type === 'VIDEO' && fileUrl) {
            bodyHtml = `
                <video controls style="max-width:280px; border-radius:8px; display:block; margin-top:4px;">
                    <source src="${fileUrl}" type="${fileType || 'video/mp4'}">
                    <a href="${fileUrl}" target="_blank">${escapeHtml(fileName || 'video')}</a>
                </video>`;
        } else if (type === 'FILE' && fileUrl) {
            const sizeLabel = message.fileSize ? ' (' + formatFileSize(message.fileSize) + ')' : '';
            bodyHtml = `
                <a href="${fileUrl}" target="_blank" download="${escapeHtml(fileName || 'file')}" style="display:inline-flex; align-items:center; gap:8px; padding:8px 12px; background:rgba(255,255,255,0.1); border-radius:8px; color:inherit; text-decoration:none; margin-top:4px;">
                    <i class="fas fa-file" style="font-size:1.2rem;"></i>
                    <span>${escapeHtml(fileName || 'Download file')}${sizeLabel}</span>
                </a>`;
        } else {
            bodyHtml = `<div class="message-text">${escapeHtml(content || '')}</div>`;
        }

        wrapper.innerHTML = `
            <div class="chat-bubble">
                ${nameHtml}
                ${bodyHtml}
                <div class="message-meta">${privateBadge}${timeStamp}</div>
            </div>
        `;

        chat.appendChild(wrapper);
    }

    const chatBody = document.getElementById('chat-body');
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Escape HTML to prevent XSS while still rendering emoji unicode
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// Format file size for display (e.g. 1.2 MB)
function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================================
// UTILS
// ============================================================
const getAvatarColor = (nickname) => {
    let hash = 0;
    if (!nickname) return '#3390ec';
    for (let i = 0; i < nickname.length; i++) {
        hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colours = ['#e66465', '#9198e5', '#3390ec', '#f3a683', '#546de5', '#e15f41', '#3dc1d3', '#f19066'];
    const index = Math.abs(hash % colours.length);
    return colours[index];
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.getElementById('nickname-form').addEventListener('submit', handleSetUserNickname);
document.getElementById('connect-form').addEventListener('submit', connect);
document.getElementById('disconnect-form').addEventListener('submit', disconnect);
document.getElementById('message-controls').addEventListener('submit', sendMessage);

// Textarea auto-resize
const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
    tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
    tx[i].addEventListener("input", OnInput, false);
}
function OnInput() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 150) + "px";
    this.style.overflowY = this.scrollHeight > 150 ? "auto" : "hidden";
}

// Enter key to send (Shift+Enter for newline)
document.getElementById('message').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('message-controls').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
});