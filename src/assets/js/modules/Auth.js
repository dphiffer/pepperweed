class Auth {

	constructor() {
		if (! document.querySelector('.header')) {
			return;
		}
		this.el = document.body.appendChild(document.createElement('div'));
		this.el.classList.add('auth');
		this.setupBackground();
		this.setupCloseButton();
	}

	setupBackground() {
		this.isOpen = false;
		this.bg = this.el.appendChild(document.createElement('div'));
		this.bg.classList.add('auth__bg');
		this.bg.addEventListener('click', this.open.bind(this));
	}

	setupCloseButton() {
		var btn = this.el.appendChild(document.createElement('div'));
		btn.classList.add('auth__close');
		btn.innerHTML = '&times;';
		btn.addEventListener('click', this.close.bind(this));
	}

	open() {
		if (this.isOpen) {
			return;
		}
		this.isOpen = true;
		this.el.classList.add('auth--open');
		if (! this.iframe) {
			this.iframe = this.el.appendChild(document.createElement('iframe'));
			this.iframe.setAttribute('src', '/login');
			this.iframe.classList.add('auth__iframe');
		}
		setTimeout(() => {
			this.iframe.classList.add('auth--visible');
		}, 300);
	}

	close() {
		if (this.isOpen) {
			this.isOpen = false;
			this.el.classList.remove('auth--open');
			this.iframe.classList.remove('auth--visible');
		}
	}

}

module.exports = Auth;
