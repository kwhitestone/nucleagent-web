import { SUB_APPS } from "@/config";
const app = SUB_APPS.core;
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.MicroApp;
/** @type {[typeof __VLS_components.MicroApp, typeof __VLS_components.microApp, typeof __VLS_components.MicroApp, typeof __VLS_components.microApp, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: (__VLS_ctx.app.name),
    url: (__VLS_ctx.app.url),
    inline: true,
    disableScopecss: true,
}));
const __VLS_2 = __VLS_1({
    name: (__VLS_ctx.app.name),
    url: (__VLS_ctx.app.url),
    inline: true,
    disableScopecss: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            app: app,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
