import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SUB_APPS } from "@/config";
const route = useRoute();
const router = useRouter();
const navItems = [
    { name: "core", label: "工作台", icon: SUB_APPS.core.icon },
    { name: "executor", label: "执行器", icon: SUB_APPS.executor.icon },
    { name: "auth", label: "账户", icon: SUB_APPS.auth.icon },
];
const activeName = computed(() => {
    if (route.path.startsWith("/auth"))
        return "auth";
    if (route.path.startsWith("/executor"))
        return "executor";
    return "core";
});
function go(name) {
    const target = SUB_APPS[name];
    router.push(name === "core" ? "/" : target.basePath);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['shell__nav-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "shell__sidebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "shell__brand" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "shell__brand-mark" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "shell__brand-name" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "shell__nav" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.navItems))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.go(item.name);
            } },
        key: (item.name),
        type: "button",
        ...{ class: "shell__nav-item" },
        ...{ class: ({ 'shell__nav-item--active': __VLS_ctx.activeName === item.name }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "shell__nav-icon" },
    });
    (item.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "shell__main" },
});
const __VLS_0 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['shell']} */ ;
/** @type {__VLS_StyleScopedClasses['shell__sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['shell__brand']} */ ;
/** @type {__VLS_StyleScopedClasses['shell__brand-mark']} */ ;
/** @type {__VLS_StyleScopedClasses['shell__brand-name']} */ ;
/** @type {__VLS_StyleScopedClasses['shell__nav']} */ ;
/** @type {__VLS_StyleScopedClasses['shell__nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['shell__nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['shell__main']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            navItems: navItems,
            activeName: activeName,
            go: go,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
