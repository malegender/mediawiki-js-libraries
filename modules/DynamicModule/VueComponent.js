(self.webpackChunkjs_libraries=self.webpackChunkjs_libraries||[]).push([[944],{472:(e,n,t)=>{"use strict";t.r(n),t.d(n,{default:()=>o});var s=t(862),u=s.useSlots,r=s.h,i=s.defineAsyncComponent,a=s.Suspense;const o={name:"ModuleComponent",props:{name:{type:String,required:!0},timeout:[String,Number],suspensible:Boolean},emits:["fail"],setup:function(e,n){var t=u(),s=i((function(){return new Promise((function(t,s){mw.loader.using([e.name],(function(n){t(n(e.name))})).catch((function(e){n.emit("fail"),s(e)}))}))})),o={default:r(s,n.attrs,t)};return t.fallback&&(o.fallback=t.fallback()),function(){return r(a,{timeout:e.timeout,suspensible:e.suspensible},o)}}}},862:e=>{var n=mw.loader.require("vue");e.exports=n}},e=>{var n,t=(n=472,e(e.s=n));module.exports=t}]);