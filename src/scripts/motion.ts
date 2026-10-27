import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function splitText(root: ParentNode = document) {
	root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
		if (el.dataset.splitDone) return;
		const mode = el.dataset.split;
		const text = el.textContent ?? "";
		el.setAttribute("aria-label", text.trim());
		el.textContent = "";

		if (mode === "chars") {
			[...text].forEach((ch) => {
				const span = document.createElement("span");
				span.className = "split-char";
				span.textContent = ch === " " ? "\u00A0" : ch;
				span.setAttribute("aria-hidden", "true");
				el.appendChild(span);
			});
		} else {
			text.split(/(\s+)/).forEach((part) => {
				if (/^\s+$/.test(part)) {
					el.appendChild(document.createTextNode(part));
					return;
				}
				const span = document.createElement("span");
				span.className = "split-word";
				span.textContent = part;
				span.setAttribute("aria-hidden", "true");
				el.appendChild(span);
			});
		}
		el.dataset.splitDone = "1";
	});
}

function runPreloader(): Promise<void> {
	const pre = document.querySelector<HTMLElement>("[data-preloader]");
	if (!pre) return Promise.resolve();

	if (reduced) {
		pre.remove();
		return Promise.resolve();
	}

	const pct = document.querySelector<HTMLElement>("#preloader-pct");
	const path = document.querySelector<SVGPathElement>("#preloader-path");
	const particles = document.querySelector<HTMLElement>("#preloader-particles");
	const state = { n: 0 };

	return new Promise((resolve) => {
		const tl = gsap.timeline({
			defaults: { ease: "power4.inOut" },
			onComplete: () => {
				pre.remove();
				resolve();
			},
		});

		if (path) {
			tl.to(path, { strokeDashoffset: 0, duration: 1.1 }, 0);
		}

		tl.to(
			state,
			{
				n: 100,
				duration: 1.25,
				onUpdate: () => {
					if (pct) pct.textContent = String(Math.round(state.n)).padStart(2, "0");
				},
			},
			0,
		);

		tl.add(() => {
			if (!particles) return;
			particles.style.opacity = "1";
			for (let i = 0; i < 28; i++) {
				const d = document.createElement("span");
				d.className = "absolute h-1 w-1 rounded-full bg-protected";
				d.style.left = "50%";
				d.style.top = "42%";
				particles.appendChild(d);
				gsap.to(d, {
					x: gsap.utils.random(-180, 180),
					y: gsap.utils.random(-140, 140),
					opacity: 0,
					scale: 0,
					duration: 0.55,
					ease: "power2.out",
				});
			}
		});

		tl.to(
			pre,
			{
				clipPath: "inset(0 0 100% 0)",
				duration: 0.45,
				ease: "power4.inOut",
			},
			"-=0.15",
		);
	});
}

function initLenis() {
	if (reduced) return null;

	const lenis = new Lenis({
		duration: 1.1,
		smoothWheel: true,
	});

	lenis.on("scroll", ScrollTrigger.update);
	gsap.ticker.add((time) => {
		lenis.raf(time * 1000);
	});
	gsap.ticker.lagSmoothing(0);

	return lenis;
}

function morphShieldLoop(el: HTMLElement | null) {
	if (!el || reduced) return;
	gsap.to(el, {
		borderRadius: "42% 58% 52% 48% / 58% 42% 58% 42%",
		duration: 8,
		ease: "sine.inOut",
		yoyo: true,
		repeat: -1,
	});
}

function initHero() {
	const chars = document.querySelectorAll("#hero .split-char, #hero .split-word");
	const cta = document.querySelectorAll("[data-hero-cta]");
	const visual = document.querySelector("[data-hero-visual]");
	const shield = document.querySelector<HTMLElement>("[data-shield]");

	if (reduced) {
		gsap.set([chars, cta, visual, shield], { clearProps: "all", opacity: 1 });
		return;
	}

	gsap.set(chars, { y: 28, opacity: 0, filter: "blur(8px)" });
	gsap.set(cta, { y: 16, opacity: 0 });

	const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
	tl.to(chars, {
		y: 0,
		opacity: 1,
		filter: "blur(0px)",
		duration: 0.7,
		stagger: 0.028,
	});
	tl.to(cta, { y: 0, opacity: 1, duration: 0.5 }, "-=0.25");

	morphShieldLoop(shield);

	if (visual) {
		gsap.to(visual, {
			yPercent: 15,
			ease: "none",
			scrollTrigger: {
				trigger: "#hero",
				start: "top top",
				end: "bottom top",
				scrub: true,
			},
		});
	}
}

function initQuotePin() {
	const shell = document.querySelector<HTMLElement>("[data-quote-shell]");
	const shield = document.querySelector<HTMLElement>("[data-shield]");
	if (!shell || reduced) return;

	ScrollTrigger.create({
		trigger: "#cotizador",
		start: "top center",
		end: "bottom center",
		onEnter: () => {
			gsap.to(shell, {
				borderRadius: "24px",
				duration: 0.8,
				ease: "power3.inOut",
			});
			if (shield) {
				gsap.to(shield, {
					scale: 0.55,
					opacity: 0.35,
					duration: 0.8,
					ease: "power3.inOut",
				});
			}
		},
		onLeaveBack: () => {
			gsap.to(shell, {
				borderRadius: "48% 52% 46% 54% / 42% 48% 52% 58%",
				duration: 0.8,
				ease: "power3.inOut",
			});
			if (shield) {
				gsap.to(shield, { scale: 1, opacity: 1, duration: 0.8 });
			}
		},
	});
}

function countUp(el: HTMLElement, target: number) {
	const obj = { n: 0 };
	gsap.to(obj, {
		n: target,
		duration: reduced ? 0.2 : 0.6,
		ease: "power2.out",
		onUpdate: () => {
			el.textContent = String(Math.round(obj.n));
		},
	});
}

function initResultados() {
	const cards = gsap.utils.toArray<HTMLElement>("[data-plan-card]");
	if (!cards.length) return;

	if (reduced) {
		cards.forEach((c) => {
			const counter = c.querySelector<HTMLElement>("[data-count-up]");
			if (counter) counter.textContent = counter.dataset.countUp ?? "0";
		});
		return;
	}

	gsap.set(cards, { rotateY: -90, opacity: 0, transformOrigin: "left center" });

	ScrollTrigger.create({
		trigger: "[data-plan-grid]",
		start: "top 75%",
		once: true,
		onEnter: () => {
			gsap.to(cards, {
				rotateY: 0,
				opacity: 1,
				duration: 0.75,
				stagger: 0.12,
				ease: "power3.out",
				onComplete: () => {
					cards.forEach((c) => {
						const counter = c.querySelector<HTMLElement>("[data-count-up]");
						if (counter) countUp(counter, Number(counter.dataset.countUp ?? 0));
					});
				},
			});
		},
	});

	cards.forEach((card) => {
		card.addEventListener("mouseenter", () => {
			cards.forEach((c) => {
				if (c !== card) gsap.to(c, { opacity: 0.35, filter: "blur(1px)", duration: 0.25 });
			});
		});
		card.addEventListener("mouseleave", () => {
			gsap.to(cards, { opacity: 1, filter: "blur(0px)", duration: 0.25 });
		});
	});

	window.addEventListener("escudo:quote", ((e: CustomEvent<{ plan: string }>) => {
		const plan = e.detail?.plan;
		cards.forEach((c) => {
			const match = c.dataset.planId === plan;
			c.classList.toggle("ring-1", match);
			c.classList.toggle("ring-protected", match);
			c.classList.toggle("shadow-glow-protected", match);
		});
	}) as EventListener);
}

function initComparador() {
	const pin = document.querySelector("[data-compare-pin]");
	const track = document.querySelector<HTMLElement>("[data-compare-track]");
	const rows = gsap.utils.toArray<HTMLElement>("[data-compare-row]");
	if (!pin || !track) return;

	if (reduced) {
		rows.forEach((r) => {
			r.style.opacity = "1";
			r.querySelectorAll<SVGPathElement>("[data-check-path]").forEach((p) => {
				p.style.strokeDashoffset = "0";
			});
		});
		return;
	}

	const getScroll = () => Math.max(0, track.scrollWidth - window.innerWidth);

	gsap.to(track, {
		x: () => -getScroll(),
		ease: "none",
		scrollTrigger: {
			trigger: pin,
			start: "top top",
			end: () => `+=${getScroll() || window.innerWidth}`,
			pin: true,
			scrub: 1,
			anticipatePin: 1,
			invalidateOnRefresh: true,
			onUpdate: (self) => {
				const p = self.progress;
				rows.forEach((row, i) => {
					const threshold = (i + 0.2) / rows.length;
					if (p >= threshold && row.dataset.revealed !== "1") {
						row.dataset.revealed = "1";
						gsap.to(row, { opacity: 1, duration: 0.35 });
						row.querySelectorAll<SVGPathElement>("[data-check-path]").forEach((path) => {
							gsap.to(path, { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" });
						});
					}
				});
			},
		},
	});
}

function initSocial() {
	const cols = gsap.utils.toArray<HTMLElement>("[data-masonry-col]");
	const cards = gsap.utils.toArray<HTMLElement>("[data-social-card]");

	if (reduced) {
		document.querySelectorAll<HTMLElement>("[data-quote-text]").forEach((q) => {
			q.style.clipPath = "inset(0 0 0 0)";
		});
		return;
	}

	cols.forEach((col, i) => {
		const amount = [12, -18, 8][i] ?? 10;
		gsap.to(col, {
			yPercent: amount,
			ease: "none",
			scrollTrigger: {
				trigger: "[data-masonry]",
				start: "top bottom",
				end: "bottom top",
				scrub: true,
			},
		});
	});

	cards.forEach((card) => {
		const quote = card.querySelector<HTMLElement>("[data-quote-text]");
		ScrollTrigger.create({
			trigger: card,
			start: "top 85%",
			once: true,
			onEnter: () => {
				if (quote) {
					gsap.to(quote, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power3.out" });
				}
			},
		});

		card.addEventListener("mouseenter", () => {
			cards.forEach((c) => {
				if (c !== card) gsap.to(c, { filter: "blur(2px)", opacity: 0.45, duration: 0.25 });
			});
		});
		card.addEventListener("mouseleave", () => {
			gsap.to(cards, { filter: "blur(0px)", opacity: 1, duration: 0.25 });
		});
	});
}

function initFaq() {
	const items = document.querySelectorAll<HTMLDetailsElement>("[data-faq-item]");
	const scan = document.querySelector<HTMLElement>("[data-faq-scan]");

	if (scan && !reduced) {
		gsap.fromTo(
			scan,
			{ scaleY: 0 },
			{
				scaleY: 1,
				ease: "none",
				scrollTrigger: {
					trigger: "[data-faq-list]",
					start: "top 80%",
					end: "bottom 40%",
					scrub: true,
				},
			},
		);
	}

	items.forEach((item) => {
		const icon = item.querySelector<HTMLElement>(".faq-icon");
		const panel = item.querySelector<HTMLElement>("[data-faq-panel]");

		const sync = () => {
			if (icon) {
				gsap.to(icon, {
					rotation: item.open ? 45 : 0,
					duration: reduced ? 0.2 : 0.45,
					ease: reduced ? "power1.out" : "back.out(1.7)",
				});
			}
			if (panel && !reduced) {
				if (item.open) {
					gsap.fromTo(
						panel,
						{ height: 0, opacity: 0 },
						{
							height: "auto",
							opacity: 1,
							duration: 0.4,
							ease: "power2.out",
							onComplete: () => ScrollTrigger.refresh(),
						},
					);
				}
			} else {
				ScrollTrigger.refresh();
			}
		};

		item.addEventListener("toggle", sync);
		if (item.open && icon) gsap.set(icon, { rotation: 45 });
	});
}

function initFinalCta() {
	const shield = document.querySelector<HTMLElement>("[data-shield-final]");
	const btn = document.querySelector<HTMLElement>("[data-magnetic]");
	const ring = document.querySelector<HTMLElement>("[data-glow-ring]");

	morphShieldLoop(shield);

	if (ring && !reduced) {
		gsap.to(ring, {
			boxShadow: "0 0 0 2px hsl(151 100% 45% / 0.55), 0 0 28px hsl(151 100% 45% / 0.35)",
			duration: 2,
			ease: "sine.inOut",
			yoyo: true,
			repeat: -1,
		});
	}

	if (!btn || reduced) return;

	const xTo = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3" });
	const yTo = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3" });

	btn.addEventListener("mousemove", (e) => {
		const rect = btn.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		xTo(x * 0.28);
		yTo(y * 0.28);
	});
	btn.addEventListener("mouseleave", () => {
		xTo(0);
		yTo(0);
	});
}

async function boot() {
	splitText();
	await runPreloader();
	initLenis();
	initHero();
	initQuotePin();
	initResultados();
	initComparador();
	initSocial();
	initFaq();
	initFinalCta();
	ScrollTrigger.refresh();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		void boot();
	});
} else {
	void boot();
}
