import { o as __toESM } from "../_runtime.mjs";
import { F as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-BkEeRci-.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Dt as Check, Tt as ChevronRight, bt as Circle, ut as Ellipsis } from "../_libs/lucide-react.mjs";
import { a as Label2, c as Root2, d as SubTrigger2, f as Trigger, i as ItemIndicator2, l as Separator2, n as Content2, o as Portal2, r as Item2, s as RadioItem2, t as CheckboxItem2, u as SubContent2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/action-bar-DMY53NvK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
var DropdownMenuSubTrigger = import_react.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SubTrigger2, {
	ref,
	className: cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubContent2, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}));
DropdownMenuSubContent.displayName = SubContent2.displayName;
var DropdownMenuContent = import_react.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)", className),
	...props
}) }));
DropdownMenuContent.displayName = Content2.displayName;
var DropdownMenuItem = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = Item2.displayName;
var DropdownMenuCheckboxItem = import_react.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CheckboxItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadioItem2, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIndicator2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
var DropdownMenuLabel = import_react.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label2, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = Label2.displayName;
var DropdownMenuSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator2, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = Separator2.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
function renderInner(a, full) {
	const Icon = a.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("h-4 w-4", full && "mr-2") }), full && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "truncate",
		children: a.label
	})] });
}
function ActionButton({ a, compact = false }) {
	const variant = a.primary ? "default" : "outline";
	const className = cn("min-h-9", a.primary && a.accent === "success" ? "bg-emerald-600 text-white shadow-glow hover:bg-emerald-500" : a.primary && a.accent === "amber" ? "bg-amber-500 text-white shadow-glow hover:bg-amber-400" : a.primary ? "bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90" : "", compact && "px-2.5");
	const content = renderInner(a, !compact);
	if (a.to) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant,
		size: "sm",
		className,
		title: a.label,
		"aria-label": a.label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: a.to,
			params: a.params,
			search: a.search,
			children: content
		})
	});
	if (a.href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant,
		size: "sm",
		className,
		title: a.label,
		"aria-label": a.label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: a.href,
			target: a.external ? "_blank" : void 0,
			rel: a.external ? "noopener noreferrer" : void 0,
			children: content
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant,
		size: "sm",
		className,
		onClick: a.onClick,
		title: a.label,
		"aria-label": a.label,
		children: content
	});
}
function MobileMenuItem({ a }) {
	const Icon = a.icon;
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }), a.label]
	});
	if (a.to) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: a.to,
			params: a.params,
			search: a.search,
			children: inner
		})
	});
	if (a.href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: a.href,
			target: a.external ? "_blank" : void 0,
			rel: a.external ? "noopener noreferrer" : void 0,
			children: inner
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
		onClick: a.onClick,
		children: inner
	});
}
/**
* Contextual action bar for entity dashboards (Aluno / Turma / Grupo / Escola).
* Desktop: primary actions inline + remaining in overflow menu.
* Mobile:  primary actions as icon-only + full menu for everything else.
*/
function ActionBar({ actions, trailing, inlineDesktop = 4, inlineMobile = 1 }) {
	const pinnedEnd = actions.filter((a) => a.pinnedEnd);
	const normal = actions.filter((a) => !a.pinnedEnd);
	const desktopInline = normal.slice(0, inlineDesktop);
	const desktopOverflow = normal.slice(inlineDesktop);
	const mobileInline = actions.slice(0, inlineMobile);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden w-full flex-wrap items-center gap-2 sm:flex",
				children: [desktopInline.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, { a }, a.label)), (pinnedEnd.length > 0 || desktopOverflow.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex flex-wrap items-center gap-2",
					children: [pinnedEnd.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, { a }, a.label)), desktopOverflow.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: "min-h-9 px-2.5",
							"aria-label": "Mais ações",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
						align: "end",
						className: "w-56",
						children: desktopOverflow.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileMenuItem, { a }, a.label))
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full items-center gap-2 sm:hidden",
				children: [mobileInline.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionButton, {
					a,
					compact: true
				}, a.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "ml-auto min-h-9 gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" }), " Ações"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
					align: "end",
					className: "w-60",
					children: actions.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [i > 0 && a.primary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileMenuItem, { a })] }, a.label))
				})] })]
			}),
			trailing
		]
	});
}
//#endregion
export { ActionBar as t };
