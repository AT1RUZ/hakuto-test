import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Answers = {
	who: string;
	age: string;
	priority: string;
};

const STEPS = [
	{
		key: "who" as const,
		title: "¿Para quién es la cobertura?",
		hint: "Define el núcleo asegurado",
		options: [
			{ value: "yo", label: "Solo yo", desc: "Cobertura individual" },
			{ value: "pareja", label: "Pareja", desc: "Dos adultos" },
			{ value: "familia", label: "Familia", desc: "Con dependientes" },
		],
	},
	{
		key: "age" as const,
		title: "Rango de edad del titular",
		hint: "Ajusta el perfil de riesgo",
		options: [
			{ value: "18-34", label: "18–34", desc: "Perfil joven" },
			{ value: "35-49", label: "35–49", desc: "Perfil medio" },
			{ value: "50+", label: "50+", desc: "Perfil senior" },
		],
	},
	{
		key: "priority" as const,
		title: "¿Qué priorizas?",
		hint: "Guía la recomendación",
		options: [
			{ value: "precio", label: "Precio", desc: "Optimizar cuota" },
			{ value: "equilibrio", label: "Equilibrio", desc: "Balance cobertura/coste" },
			{ value: "maxima", label: "Máxima cobertura", desc: "Sin fricción clínica" },
		],
	},
];

function recommendPlan(answers: Answers): "esencial" | "equilibrio" | "integral" {
	if (answers.priority === "maxima" || answers.who === "familia") return "integral";
	if (answers.priority === "precio" && answers.age === "18-34") return "esencial";
	return "equilibrio";
}

export function Cotizador() {
	const baseId = useId();
	const [step, setStep] = useState(0);
	const [dir, setDir] = useState(1);
	const [answers, setAnswers] = useState<Answers>({ who: "", age: "", priority: "" });
	const [done, setDone] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const current = STEPS[step];
	const currentValue = answers[current.key];

	useEffect(() => {
		const first = optionRefs.current.find(Boolean);
		first?.focus();
	}, [step, done]);

	useEffect(() => {
		const panel = panelRef.current;
		if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		panel.animate(
			[
				{ transform: `translateX(${dir * 28}px)`, opacity: 0 },
				{ transform: "translateX(0)", opacity: 1 },
			],
			{ duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
		);
	}, [step, done, dir]);

	function select(value: string) {
		const key = current.key;
		const nextAnswers = { ...answers, [key]: value };
		setAnswers(nextAnswers);

		const btn = optionRefs.current.find((el) => el?.dataset.value === value);
		if (btn && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			btn.animate(
				[
					{ transform: "scale(1)" },
					{ transform: "scale(1.03)" },
					{ transform: "scale(1)" },
				],
				{ duration: 420, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
			);
		}

		window.setTimeout(() => {
			if (step < STEPS.length - 1) {
				setDir(1);
				setStep((s) => s + 1);
			} else {
				setDone(true);
				const plan = recommendPlan(nextAnswers);
				window.dispatchEvent(
					new CustomEvent("escudo:quote", {
						detail: { answers: nextAnswers, plan },
					}),
				);
			}
		}, 280);
	}

	function goBack() {
		if (done) {
			setDone(false);
			setDir(-1);
			return;
		}
		if (step > 0) {
			setDir(-1);
			setStep((s) => s - 1);
		}
	}

	return (
		<section
			id="cotizador"
			className="relative scroll-mt-24 overflow-hidden py-24 md:py-32"
			data-section="cotizador"
		>
			<div className="container relative z-10">
				<div className="mx-auto max-w-3xl text-center">
					<p className="font-mono text-[11px] uppercase tracking-[0.28em] text-protected">
						Cotizador
					</p>
					<h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
						Tres preguntas. Un plan claro.
					</h2>
					<p className="mt-4 text-muted-foreground">
						El escudo se convierte en contenedor: responde y te mostramos la cobertura
						recomendada.
					</p>
				</div>

				<div
					className="shield-blob relative mx-auto mt-14 max-w-2xl border border-border/80 bg-surface/90 p-6 shadow-medium backdrop-blur-sm sm:p-10"
					data-quote-shell
					style={{ borderRadius: "48% 52% 46% 54% / 42% 48% 52% 58%" }}
				>
					<div className="mb-8 flex items-center justify-between gap-4">
						<div className="flex gap-2" aria-hidden="true">
							{STEPS.map((_, i) => (
								<span
									key={i}
									className={cn(
										"h-1 w-10 rounded-full transition-colors",
										i <= step || done ? "bg-protected" : "bg-border",
									)}
								/>
							))}
						</div>
						<span className="font-mono text-xs text-muted-foreground tabular-nums">
							{done ? "03/03" : `${String(step + 1).padStart(2, "0")}/03`}
						</span>
					</div>

					<div ref={panelRef} className="min-h-[280px]">
						{done ? (
							<div className="text-center">
								<p className="font-mono text-[11px] uppercase tracking-[0.22em] text-protected">
									Calibración completa
								</p>
								<p className="mt-3 font-display text-3xl text-foreground">
									Tu perfil está listo
								</p>
								<p className="mt-3 text-sm text-muted-foreground">
									Revisa los planes recomendados debajo. Puedes ajustar las respuestas
									si cambias de criterio.
								</p>
								<button
									type="button"
									onClick={goBack}
									className="mt-8 inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium text-foreground hover:border-protected/50"
								>
									Ajustar respuestas
								</button>
							</div>
						) : (
							<fieldset>
								<legend className="sr-only">{current.title}</legend>
								<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
									{current.hint}
								</p>
								<h3
									id={`${baseId}-title`}
									className="mt-2 font-display text-2xl text-foreground sm:text-3xl"
								>
									{current.title}
								</h3>
								<div
									className="mt-8 grid gap-3"
									role="radiogroup"
									aria-labelledby={`${baseId}-title`}
								>
									{current.options.map((opt, i) => {
										const selected = currentValue === opt.value;
										return (
											<button
												key={opt.value}
												type="button"
												role="radio"
												aria-checked={selected}
												data-value={opt.value}
												ref={(el) => {
													optionRefs.current[i] = el;
												}}
												onClick={() => select(opt.value)}
												className={cn(
													"flex items-start justify-between gap-4 rounded-lg border px-4 py-4 text-left transition-colors",
													selected
														? "border-protected bg-protected/10"
														: "border-border bg-background/40 hover:border-protected/40",
												)}
											>
												<span>
													<span className="block text-sm font-semibold text-foreground">
														{opt.label}
													</span>
													<span className="mt-1 block text-xs text-muted-foreground">
														{opt.desc}
													</span>
												</span>
												<span
													className={cn(
														"mt-0.5 h-4 w-4 shrink-0 rounded-full border",
														selected
															? "border-protected bg-protected"
															: "border-muted-foreground/40",
													)}
													aria-hidden="true"
												/>
											</button>
										);
									})}
								</div>
								{step > 0 && (
									<button
										type="button"
										onClick={goBack}
										className="mt-6 text-sm text-muted-foreground hover:text-foreground"
									>
										← Volver
									</button>
								)}
							</fieldset>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
